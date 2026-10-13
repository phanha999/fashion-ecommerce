export function shopifyImageUrl(src, width) {
  if (!src || !Number.isFinite(width) || width < 1) return src;
  try {
    const url = new URL(src);
    if (url.hostname !== 'cdn.shopify.com' || !/\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(url.pathname)) return src;
    url.searchParams.set('width', String(Math.round(width)));
    return url.href;
  } catch { return src; }
}
