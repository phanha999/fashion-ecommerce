import { getIntlLocale } from "../../utils/localization";
import { t } from "../../utils/translations";
import StoreImage from '../../components/StoreImage';
import Seo from '../../components/Seo';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/cartContext';

function money(value) {
  return value ? new Intl.NumberFormat(getIntlLocale(), { style: 'currency', currency: value.currencyCode }).format(Number(value.amount)) : '';
}
export default function Cart() {
  const { cart, isLoading, isUpdating, error, updateItem, removeItem, refresh, setDiscounts, checkout } = useCart();
  const [discount, setDiscount] = useState('');
  const lines = cart?.lines.nodes || [];
  const perform = promise => promise.catch(() => {});
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <Seo title={t("Your cart")} description="" noIndex />
      <h1 className="text-3xl font-bold">{t("Your cart")}</h1>
      {error && <p role="alert" className="mt-6 bg-red-50 p-4 text-red-800">{error} <button type="button" onClick={() => perform(refresh())} className="underline">{t("Refresh cart")}</button></p>}
      {cart?.warnings?.map((warning, index) => <p role="status" key={index} className="mt-4 bg-amber-50 p-3">{warning.message}</p>)}
      {isLoading ? <p role="status" className="mt-8">{t("Loading cart…")}</p> : !lines.length ? (
        <div className="py-16 text-center"><p className="mb-6 text-gray-500">{t("Your cart is empty.")}</p><Link to="/shop" className="bg-gray-900 px-8 py-3 text-white">{t("Continue shopping")}</Link></div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="divide-y divide-gray-200">
            {lines.map(line => {
              const variant = line.merchandise;
              const image = variant.image || variant.product.featuredImage;
              return (
                <div key={line.id} className="flex gap-5 py-6">
                  <Link to={'/products/' + encodeURIComponent(variant.product.id)} className="w-24 shrink-0 bg-gray-100">{image && <StoreImage src={image.url} alt={image.altText || variant.product.title} className="h-32 w-full object-cover" />}</Link>
                  <div className="min-w-0 flex-1">
                    <Link to={'/products/' + encodeURIComponent(variant.product.id)} className="font-medium">{variant.product.title}</Link>
                    {variant.title !== 'Default Title' && <p className="mt-1 text-sm text-gray-500">{variant.title}</p>}
                    <p className="mt-3 font-medium">{money(line.cost.totalAmount)}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <div className="flex items-center border border-gray-300">
                        <button aria-label={'Decrease quantity of ' + variant.product.title} disabled={isUpdating || line.quantity <= 1} onClick={() => perform(updateItem(line.id, line.quantity - 1))} className="px-4 py-2 disabled:opacity-40">−</button>
                        <span className="px-3" aria-label={t("Quantity")}>{line.quantity}</span>
                        <button aria-label={'Increase quantity of ' + variant.product.title} disabled={isUpdating || line.quantity >= 250} onClick={() => perform(updateItem(line.id, line.quantity + 1))} className="px-4 py-2 disabled:opacity-40">+</button>
                      </div>
                      <button disabled={isUpdating} onClick={() => perform(removeItem(line.id))} className="text-sm underline disabled:opacity-40">{t("Remove")}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="h-fit border border-gray-200 p-6">
            <h2 className="text-xl font-semibold">{t("Order summary")}</h2>
            <form className="mt-5 flex gap-2" onSubmit={event => { event.preventDefault(); perform(setDiscounts([...new Set([...(cart.discountCodes || []).map(item => item.code), discount.trim()].filter(Boolean))])); }}>
              <input aria-label={t("Discount code")} placeholder={t("Discount code")} value={discount} onChange={event => setDiscount(event.target.value)} required className="min-w-0 flex-1 border p-2 text-sm" />
              <button disabled={isUpdating} className="border px-3 text-sm disabled:opacity-50">{t("Apply")}</button>
            </form>
            {cart.discountCodes?.map(code => <div key={code.code} className="mt-3 flex justify-between gap-2 text-sm"><span>{code.code} {code.applicable ? '✓' : '(not applicable)'}</span><button disabled={isUpdating} onClick={() => perform(setDiscounts(cart.discountCodes.filter(item => item.code !== code.code).map(item => item.code)))} className="underline">{t("Remove")}</button></div>)}
            <div className="mt-6 flex justify-between"><span>{t("Subtotal")}</span><span>{money(cart.cost.subtotalAmount)}</span></div>
            <div className="mt-3 flex justify-between font-semibold"><span>{t("Estimated total")}</span><span>{money(cart.cost.totalAmount)}</span></div>
            <p className="mt-3 text-xs leading-5 text-gray-500">{t("Shipping and taxes calculated at checkout.")}</p>
            <button type="button" disabled={isUpdating} onClick={() => perform(checkout())} className="mt-6 block w-full bg-gray-900 p-4 text-center text-white disabled:opacity-50">{isUpdating ? t("Updating…") : t("Checkout")}</button>
            <Link to="/shop" className="mt-4 block text-center text-sm underline">{t("Continue shopping")}</Link>
          </aside>
        </div>
      )}
    </section>
  );
}