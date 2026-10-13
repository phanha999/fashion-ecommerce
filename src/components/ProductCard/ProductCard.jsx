import StoreImage from '../StoreImage';
import { Link } from 'react-router-dom';
import WishlistButton from '../WishlistButton';
import { useRef, useState } from 'react';
import { FiShoppingBag, FiCheck } from 'react-icons/fi';
import { useCart } from '../../contexts/cartContext';
import { getProductDetail } from '../../services/shopify/productService';
import { useNotifications } from '../../contexts/notificationContext';

function ProductCard({ product, imageRatio = 'portrait', priority = false }) {
  const { notify } = useNotifications();
  const { addItem, isLoading: cartLoading, isUpdating } = useCart();
  const [details, setDetails] = useState(null);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const pending = useRef(false);
  const variants = details?.id === product.id ? details.variants : null;
  async function add() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      const current = variants ? details : await getProductDetail(product.id);
      const available = current.variants.filter(item => item.availableForSale);
      if (!available.length) throw new Error('This product is sold out.');
      if (!variants && current.variants.length > 1) {
        setDetails(current);
        setSelected(available[0].id);
        notify('Choose an option before adding this product.', 'info');
        return;
      }
      const variant = variants ? current.variants.find(item => item.id === selected) : available[0];
      if (!variant?.availableForSale) throw new Error('Choose an available option.');
      const cart = await addItem(variant.id, 1);
      setFeedback({ message: cart.warnings?.length ? cart.warnings.map(item => item.message).join(' ') : 'Added to your cart.', success: true });
    } catch (error) { setFeedback({ message: error.message, success: false }); notify(error.message, 'error'); }
    finally { pending.current = false; setBusy(false); }
  }
  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: product.currencyCode || 'USD',
  }).format(product.price);
  const hasNaturalDimensions = imageRatio === 'natural' && product.imageWidth && product.imageHeight;
  const imageRatioClass = hasNaturalDimensions
    ? ''
    : imageRatio === 'square' ? 'aspect-square' : 'aspect-[3/4]';
  const imageStyle = hasNaturalDimensions
    ? { aspectRatio: `${product.imageWidth} / ${product.imageHeight}` }
    : undefined;

  return (
    <div className="product-card relative">
      <WishlistButton productId={product.id} className="absolute right-3 top-3 z-10" />
      <button type="button" onClick={add} aria-busy={busy} disabled={busy || cartLoading || isUpdating || product.availableForSale === false} aria-label={(busy ? 'Adding…' : product.availableForSale === false ? 'Sold out' : 'Add to cart') + ' — ' + product.name} title={product.availableForSale === false ? 'Sold out' : 'Add to cart'} className="absolute right-3 top-16 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm hover:scale-105 hover:border-gray-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">{feedback?.success ? <FiCheck size={19} aria-hidden="true" /> : <FiShoppingBag size={19} aria-hidden="true" />}{busy && <span className="sr-only">Adding…</span>}</button>
      <Link to={`/products/${encodeURIComponent(product.handle || product.id)}`} className="group block overflow-hidden">
        <div className={`relative ${imageRatioClass} overflow-hidden rounded-md bg-gray-100`} style={imageStyle}>
          <StoreImage
            priority={priority}
            width={product.imageWidth || undefined}
            height={product.imageHeight || undefined}
            src={product.image}
            alt={product.imageAlt || product.name}
            className={`h-full w-full ${imageRatio === 'natural' ? 'object-contain' : 'object-cover transition duration-500 group-hover:scale-105'}`}
          />
          {product.isNew && (
            <span className="absolute left-3 top-3 bg-black px-3 py-1 text-xs uppercase tracking-wider text-white">
              New
            </span>
          )}
        </div>
        <div className="px-3 pt-4">
          <h2 className="text-sm font-bold text-gray-900">{product.name}</h2>
          {product.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
              {product.description}
            </p>
          )}
          <p className="mt-3 text-sm font-medium text-gray-900">{formattedPrice}</p>
        </div>
      </Link>
      <div className="px-3">
        {variants && <label className="dialog-enter mb-3 block text-xs text-gray-600">Choose an option for {product.name}<select aria-label={'Option for ' + product.name} value={selected} onChange={event => { setSelected(event.target.value); setFeedback(null); }} disabled={busy} className="mt-2 min-h-10 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900">{variants.map(variant => <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>{variant.title} — {new Intl.NumberFormat(undefined, { style: 'currency', currency: variant.price.currencyCode }).format(Number(variant.price.amount))}{!variant.availableForSale ? ' (Sold out)' : ''}</option>)}</select></label>}

        {feedback && <p role={feedback.success ? 'status' : 'alert'} className={'toast-enter mt-2 text-xs leading-5 ' + (feedback.success ? 'text-green-700' : 'text-red-700')}>{feedback.message}</p>}
      </div>
    </div>
  );
}

export default ProductCard;
