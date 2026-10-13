import { getIntlLocale } from "../utils/localization";
import { t } from "../utils/translations";
import useAnimatedClose from '../hooks/useAnimatedClose';
import StoreImage from './StoreImage';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiX, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../hooks/useWishlist';
import { getProductDetail } from '../services/shopify/productService';
import { useNotifications } from '../contexts/notificationContext';

export default function WishlistDrawer({ onClose: onDismiss }) {
  const dialog = useRef(null);
  const onClose = useAnimatedClose(dialog, onDismiss, 'right');
  const { setHost } = useNotifications();
  const { ids, toggle } = useWishlist();
  const key = JSON.stringify(ids);
  const [result, setResult] = useState(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement;
    element.showModal();
    setHost(element);
    document.body.style.overflow = 'hidden';
    return () => { setHost(null); element.close(); document.body.style.overflow = previous; previousFocus?.focus(); };
  }, [setHost]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(JSON.parse(key).map(async id => {
      try { return { id, product: await getProductDetail(id) }; }
      catch { return { id, unavailable: true }; }
    })).then(items => { if (!cancelled) setResult({ key, revision, items }); });
    return () => { cancelled = true; };
  }, [key, revision]);
  const items = result?.key === key && result.revision === revision ? result.items : null;
  return <dialog ref={dialog} aria-labelledby="wishlist-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }} className="wishlist-drawer fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-full max-w-[440px] border-0 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/40 open:flex open:flex-col">
    <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5">
      <div><h2 id="wishlist-title" className="flex items-center gap-2 text-xl font-semibold"><FiHeart aria-hidden="true" /> {t("Your wishlist")} <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">{ids.length}</span></h2><p className="mt-1 text-xs text-gray-500">{t("Saved on this browser")}</p></div>
      <button type="button" onClick={onClose} aria-label="Close wishlist" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100"><FiX size={22} /></button>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
      {!ids.length ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><div className="mb-5 rounded-full bg-gray-50 p-5"><FiHeart size={32} strokeWidth={1.3} /></div><h3 className="text-lg font-medium">Your wishlist is empty</h3><p className="mt-2 max-w-64 text-sm leading-6 text-gray-500">{t("Tap the heart on a product to keep your favourites here.")}</p></div> : !items ? <p role="status" className="text-sm text-gray-500">{t("Loading wishlist…")}</p> : <ul className="space-y-5">{items.map(({ id, product }) => {
        const variant = product?.variants.find(item => item.availableForSale) || product?.variants[0];
        return <li key={id} className="flex gap-4 border-b border-gray-100 pb-5">
          {product ? <><Link onClick={onClose} to={'/products/' + encodeURIComponent(product.handle || id)} className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">{product.featuredImage && <StoreImage src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} className="h-full w-full object-cover" />}</Link><div className="min-w-0 flex-1"><Link onClick={onClose} to={'/products/' + encodeURIComponent(product.handle || id)} className="text-sm font-medium leading-5 hover:underline">{product.title}</Link>{variant && <p className="mt-2 text-sm">{new Intl.NumberFormat(getIntlLocale(), { style: 'currency', currency: variant.price.currencyCode }).format(Number(variant.price.amount))}</p>}{!product.variants.some(item => item.availableForSale) && <p className="mt-1 text-xs text-gray-500">{t("Sold out")}</p>}<button type="button" onClick={() => toggle(id)} aria-label={'Remove ' + product.title + ' from wishlist'} className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-xs text-gray-500 hover:text-rose-600"><FiTrash2 size={13} /> {t("Remove")}</button></div></> : <div className="flex-1"><p className="text-sm text-gray-500">{t("Product temporarily unavailable.")}</p><div className="mt-2 flex gap-4 text-sm"><button onClick={() => setRevision(value => value + 1)} className="underline">{t("Try again")}</button><button onClick={() => toggle(id)} className="underline">{t("Remove")}</button></div></div>}
        </li>;
      })}</ul>}
    </div>
    <div className="shrink-0 border-t border-gray-100 p-6"><Link to="/shop" onClick={onClose} className="flex min-h-12 items-center justify-center gap-2 bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800">{t("Continue shopping")} <FiArrowRight /></Link></div>
  </dialog>;
}
