import { t } from "../utils/translations";
import { useCallback, useEffect, useRef, useState } from 'react';
import { CartContext } from './cartContext';
import { addCartLine, getCart, removeCartLine, updateCartLine, updateCartBuyer, updateCartDiscounts } from '../services/shopify/cartService';
import { readStoredSession } from '../services/shopify/accountService';
import { useCustomerAccount } from './customerAccountContext';
import { useNotifications } from './notificationContext';
import { useLocalization } from './localizationContext';
import { getLocalizationContext, getIntlLocale } from '../utils/localization';

const key = 'velora_shopify_cart_id';
export default function CartProvider({ children }) {
  const { notify } = useNotifications();
  const { data: localization } = useLocalization();
  const country = localization?.country.isoCode;
  const { customer, isLoading: accountLoading } = useCustomerAccount();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const current = useRef(null);
  const queue = useRef(Promise.resolve());
  const profile = useRef(customer);
  useEffect(() => { profile.current = customer; }, [customer]);

  const save = useCallback(next => {
    current.current = next;
    setCart(next);
    try { if (next) localStorage.setItem(key, next.id); else localStorage.removeItem(key); } catch { /* Storage is optional. */ }
  }, []);
  const enqueue = useCallback(operation => {
    const task = queue.current.then(async () => {
      setIsUpdating(true); setError('');
      try { return await operation(); }
      catch (failure) { setError(failure.message || 'Could not update your cart.'); throw failure; }
      finally { setIsUpdating(false); setIsLoading(false); }
    });
    queue.current = task.catch(() => {});
    return task;
  }, []);
  const restore = useCallback(async () => {
    let id;
    try { id = localStorage.getItem(key); } catch { id = current.current?.id; }
    let next = id ? await getCart(id) : null;
    const selectedCountry = getLocalizationContext().country;
    if (next && selectedCountry && next.buyerIdentity?.countryCode !== selectedCountry) next = await updateCartBuyer(next.id, { countryCode: selectedCountry });
    save(next);
    return next;
  }, [save]);
  const refresh = useCallback(() => enqueue(restore), [enqueue, restore]);
  const identity = useCallback(() => {
    const session = readStoredSession();
    const countryCode = getLocalizationContext().country;
    return { ...(countryCode ? { countryCode } : {}), ...(session ? { customerAccessToken: session.accessToken, email: profile.current?.email || null } : { customerAccessToken: null, email: null, phone: null }) };
  }, []);
  useEffect(() => {
    refresh().catch(() => {});
    const focus = () => { if (document.visibilityState === 'visible') refresh().catch(() => {}); };
    const storage = event => { if (event.key === key) refresh().catch(() => {}); };
    window.addEventListener('focus', focus);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener('focus', focus); window.removeEventListener('storage', storage); };
  }, [refresh]);
  useEffect(() => {
    if (accountLoading) return;
    enqueue(async () => {
      const existing = current.current;
      if (existing) save(await updateCartBuyer(existing.id, identity()));
    }).catch(() => {});
  }, [customer, accountLoading, country, enqueue, save, identity]);

  function mutate(operation, message, action) {
    return enqueue(async () => {
      try {
      const existing = await restore();
      const next = await operation(existing);
      save(next);
      const warnings = next?.warnings?.map(item => item.message).join(' ');
      if (warnings) notify(warnings, 'warning');
      else if (message) {
        const notice = typeof message === 'function' ? message(next) : { message, type: 'success' };
        notify(notice.message, notice.type, action);
      }
      return next;
      } catch (failure) { notify(failure.message || 'Could not update your cart.', 'error'); throw failure; }
    });
  }
  return (
    <CartContext.Provider value={{
      cart, isLoading, isUpdating, error, refresh,
      changeCountry: countryCode => enqueue(async () => {
        const existing = await restore();
        if (existing) {
          const next = await updateCartBuyer(existing.id, { ...identity(), countryCode });
          save(next);
          if (next.warnings?.length) notify(next.warnings.map(item => item.message).join(' '), 'warning');
        }
      }),
      addItem: (variantId, quantity = 1) => mutate(existing => addCartLine(existing?.id, variantId, quantity, identity()), t("Added to your cart."), { to: '/cart', label: t("View cart") }),
      updateItem: (id, quantity) => mutate(existing => { if (!existing) throw new Error('Your cart expired. Please add your products again.'); return updateCartLine(existing.id, id, quantity); }, t("Cart quantity updated.")),
      removeItem: id => mutate(existing => { if (!existing) return null; return removeCartLine(existing.id, id); }, t("Item removed from your cart.")),
      setDiscounts: codes => mutate(existing => { if (!existing) throw new Error('Add a product before applying a discount.'); return updateCartDiscounts(existing.id, codes); }, next => next.discountCodes?.some(code => !code.applicable) ? { message: 'This discount does not apply to your cart.', type: 'warning' } : { message: codes.length ? 'Discount codes updated.' : 'Discount code removed.', type: 'success' }),
      checkout: () => mutate(async existing => {
        if (!existing?.totalQuantity) throw new Error('Your cart is empty. Please add a product first.');
        notify(t("Opening secure Shopify checkout…"), 'info');
        const next = await updateCartBuyer(existing.id, identity());
        if (!next.totalQuantity) throw new Error('Your products are no longer available.');
        const url = new URL(next.checkoutUrl);
        url.searchParams.set('locale', getIntlLocale());
        if (url.protocol !== 'https:') throw new Error('Checkout is temporarily unavailable.');
        window.location.assign(url.toString());
        return next;
      }),
    }}>
      {children}
    </CartContext.Provider>
  );
}
