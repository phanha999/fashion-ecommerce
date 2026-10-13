// Keep Shopify-managed navigation inside the React storefront when a route exists.
export function storefrontLink(value, storeDomains = [], languageCodes = []) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const link = value.trim();
  if (link.startsWith('#')) return link;
  if (/^(mailto:|tel:)/i.test(link)) return link;
  let url;
  try { url = new URL(link, 'https://react-storefront.invalid'); } catch { return null; }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
  const internal = url.hostname === 'react-storefront.invalid' || storeDomains.some(domain => {
    try { return new URL(domain.startsWith('http') ? domain : 'https://' + domain).hostname === url.hostname; } catch { return false; }
  });
  if (!internal) return url.href;
  // Shopify localizes hosted URLs (/fr/collections/...), while React keeps
  // its existing routes and reads the chosen language from storefront context.
  const segment = url.pathname.split('/')[1].toLowerCase();
  if (languageCodes.some(code => code.toLowerCase().replace('_', '-') === segment)) {
    url.pathname = url.pathname.slice(segment.length + 1) || '/';
  }
  const product = url.pathname.match(/^\/collections\/[^/]+\/products\/([^/]+)\/?$/);
  const collection = url.pathname.match(/^\/collections\/([^/]+)\/?$/);
  if (product) url.pathname = '/products/' + product[1];
  else if (collection) {
    url.pathname = '/shop';
    if (collection[1] !== 'all') {
      try { url.searchParams.set('collection', decodeURIComponent(collection[1])); } catch { return null; }
    }
  } else if (/^\/collections\/?$/.test(url.pathname) || url.pathname === '/search') url.pathname = '/shop';
  else if (/^\/account\/(login|register)\/?$/.test(url.pathname)) url.pathname = '/account';
  else if (/^\/blogs\/[^/]+\/?$/.test(url.pathname)) url.pathname = '/blogs';
  return url.pathname + url.search + url.hash;
}
