import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../hooks/useWishlist';

export default function WishlistButton({ productId, className = '', showLabel = false }) {
  const { ids, toggle } = useWishlist();
  const saved = ids.includes(productId);
  return <button type="button" aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={saved} title={saved ? 'Remove from wishlist' : 'Save to wishlist'} onClick={() => toggle(productId)} className={'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border shadow-sm transition duration-200 hover:scale-105 ' + (saved ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 ' : 'border-gray-200 bg-white/95 text-gray-700 hover:border-gray-400 hover:bg-white ') + className}>
    <FiHeart size={19} strokeWidth={1.7} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
    {showLabel && <span className="text-sm font-medium">{saved ? 'Saved' : 'Save'}</span>}
  </button>;
}
