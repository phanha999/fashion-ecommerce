import { shopifyImageUrl } from '../utils/shopifyImage';

export default function StoreImage({ src, alt = '', priority = false, maxWidth = 960, sizes = '(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw', loading, fetchPriority, ...props }) {
  const optimized = shopifyImageUrl(src, maxWidth);
  const widths = [240, 360, 480, 640, 960, 1440, 1920].filter(width => width <= maxWidth);
  const srcSet = optimized !== src ? widths.map(width => `${shopifyImageUrl(src, width)} ${width}w`).join(', ') : undefined;
  return <img {...props} src={optimized} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={alt} loading={priority ? 'eager' : loading || 'lazy'} fetchPriority={priority ? 'high' : fetchPriority} decoding="async" />;
}
