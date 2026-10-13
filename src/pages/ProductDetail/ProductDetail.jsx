import { getIntlLocale } from "../../utils/localization";
import { t } from "../../utils/translations";
import StoreImage from '../../components/StoreImage';
import { useEffect, useState } from 'react';
import ProductExtras from '../../components/ProductExtras';
import Seo from '../../components/Seo';
import SafeHtml from '../../components/SafeHtml';
import WishlistButton from '../../components/WishlistButton';
import { Link, useParams } from 'react-router-dom';
import { getProductDetail } from '../../services/shopify/productService';
import { useCart } from '../../contexts/cartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem, isLoading: cartLoading, isUpdating } = useCart();
  const [result, setResult] = useState(null);
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [galleryImage, setGalleryImage] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getProductDetail(id).then(product => {
      if (!cancelled) {
        setResult({ id, revision, product });
        setVariantId((product.variants.find(variant => variant.availableForSale) || product.variants[0])?.id || '');
        setGalleryImage(null);
        setQuantity(1);
        setMessage('');
        setError('');
      }
    }).catch(failure => { if (!cancelled) setResult({ id, revision, error: failure.message }); });
    return () => { cancelled = true; };
  }, [id, revision]);

  const current = result?.id === id && result.revision === revision ? result : null;
  const product = current?.product;
  const variant = product?.variants.find(item => item.id === variantId);
  async function add(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const cart = await addItem(variant.id, quantity);
      setMessage(cart.warnings?.length ? cart.warnings.map(item => item.message).join(' ') : t("Added to your cart."));
    } catch (failure) { setError(failure.message); }
  }
  if (current?.error) return <div role="alert" className="p-12"><p>{current.error}</p><button onClick={() => setRevision(value => value + 1)} className="mt-4 underline">{t("Try again")}</button><Link to="/shop" className="ml-6 underline">{t("Back to shop")}</Link></div>;
  if (!product) return <section aria-label="Loading product" aria-busy="true" className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8"><div className="aspect-[3/4] animate-pulse rounded bg-gray-100" /><div><div className="h-8 w-3/4 animate-pulse bg-gray-100" /><div className="mt-6 h-6 w-1/3 animate-pulse bg-gray-100" /><div className="mt-8 h-40 animate-pulse bg-gray-50" /><div className="mt-8 h-12 animate-pulse bg-gray-100" /><p role="status" className="mt-4 text-sm text-gray-600">{t("Loading product…")}</p></div></section>;
  const image = galleryImage || variant?.image || product.featuredImage;
  return (
    <>
    <Seo title={product.seo?.title || product.title} description={product.seo?.description || product.description} image={image?.url} product />
    <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: product.title, image: product.images?.nodes.map(item => item.url), description: product.description, offers: variant ? { "@type": "Offer", price: variant.price.amount, priceCurrency: variant.price.currencyCode, availability: variant.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: window.location.href } : undefined })}</script>
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8">
      <div>
        <div className="aspect-[3/4] bg-gray-100">{image && <StoreImage key={image.url} src={image.url} alt={image.altText || product.title} className={"h-full w-full object-contain " + (galleryImage ? "image-change" : "")} priority sizes="(max-width: 768px) 100vw, 50vw" />}</div>
        <div className="mt-3 flex gap-3 overflow-x-auto">{product.images?.nodes.map((item, index) => <button key={item.url} onClick={() => setGalleryImage(item)} aria-label={'View product image ' + (index + 1)} aria-pressed={image?.url === item.url} className={'w-20 shrink-0 border p-1 ' + (image?.url === item.url ? 'border-black' : 'border-gray-200')}><StoreImage src={item.url} alt={item.altText || product.title} className="h-24 w-full object-cover" loading="lazy" maxWidth={240} sizes="80px" /></button>)}</div>
      </div>
      <div>
        <p className="text-sm text-gray-500">{product.vendor}</p>
        <div className="mt-3 flex items-start justify-between gap-4"><h1 className="text-3xl font-bold">{product.title}</h1><WishlistButton productId={product.id} className="shrink-0" /></div>
        {variant && <p className="mt-5 text-xl">{new Intl.NumberFormat(getIntlLocale(), { style: 'currency', currency: variant.price.currencyCode }).format(Number(variant.price.amount))}</p>}
        {product.descriptionHtml ? <div className="mt-6 text-sm leading-7 text-gray-600"><SafeHtml html={product.descriptionHtml} /></div> : <p className="mt-6 whitespace-pre-line text-sm leading-7 text-gray-600">{product.description}</p>}
        <form onSubmit={add} className="mt-8 space-y-5">
          <label className="block text-sm">{t("Variant")}
            <select value={variantId} onChange={event => { setVariantId(event.target.value); setGalleryImage(null); setMessage(''); }} className="mt-2 w-full border border-gray-300 p-3">
              {product.variants.map(item => <option key={item.id} value={item.id} disabled={!item.availableForSale}>{item.title}{!item.availableForSale ? ' — Sold out' : ''}</option>)}
            </select>
          </label>
          <label className="block text-sm">{t("Quantity")}<input type="number" min="1" max="250" required value={quantity} onChange={event => setQuantity(Number(event.target.value))} className="ml-4 w-24 border border-gray-300 p-3" /></label>
          <button aria-busy={isUpdating} disabled={!variant?.availableForSale || cartLoading || isUpdating} className="w-full bg-gray-900 p-4 text-white disabled:opacity-50">{isUpdating ? t("Adding…") : variant?.availableForSale ? t("Add to cart") : t("Sold out")}</button>
        </form>
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-4 text-sm text-green-700">{message}</p>}
      </div>
    </section>
    <ProductExtras product={product} />
    </>
  );
}
