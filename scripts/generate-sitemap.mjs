import { readFile, writeFile, mkdir } from 'node:fs/promises';
const env = { ...process.env };
for (const file of ['.env', '.env.local', '.env.production']) {
  try {
    for (const line of (await readFile(file, 'utf8')).split(String.fromCharCode(10))) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const index = line.indexOf('=');
      if (index > 0) env[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  } catch { /* Optional environment files. */ }
}
const siteUrl = process.argv[2] || env.VITE_SITE_URL;
if (!siteUrl) throw new Error('Provide the public React domain: npm run sitemap -- https://your-domain.example');
const base = new URL(siteUrl);
if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash) throw new Error('Use an HTTPS origin without a path.');
const domain = env.VITE_SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/+$/, '');
if (!domain || !env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN) throw new Error('Shopify public Storefront configuration is missing.');
async function query(query, variables = {}) {
  const response = await fetch('https://' + domain + '/api/' + (env.VITE_SHOPIFY_API_VERSION || '2026-07') + '/graphql.json', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN }, body: JSON.stringify({ query, variables })
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) throw new Error('Sitemap could not load Shopify content.');
  return payload.data;
}
const routes = new Set(['/', '/shop', '/blogs']);
for (const type of ['products', 'pages', 'articles']) {
  let after = null;
  do {
    const data = await query(`query Sitemap($after: String) { ${type}(first: 250, after: $after) { nodes { handle ${type === 'articles' ? 'blog { handle }' : ''} } pageInfo { hasNextPage endCursor } } }`, { after });
    const page = data[type];
    for (const item of page.nodes) routes.add(type === 'products' ? '/products/' + encodeURIComponent(item.handle) : type === 'pages' ? '/pages/' + encodeURIComponent(item.handle) : '/blogs/' + encodeURIComponent(item.blog.handle) + '/' + encodeURIComponent(item.handle));
    if (page.pageInfo.hasNextPage && (!page.pageInfo.endCursor || page.pageInfo.endCursor === after)) throw new Error('Invalid sitemap pagination.');
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
}
const { shop } = await query('{ shop { privacyPolicy { id } refundPolicy { id } shippingPolicy { id } termsOfService { id } } }');
for (const [key, handle] of [['privacyPolicy', 'privacy-policy'], ['refundPolicy', 'refund-policy'], ['shippingPolicy', 'shipping-policy'], ['termsOfService', 'terms-of-service']]) if (shop[key]) routes.add('/policies/' + handle);
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
await mkdir('public', { recursive: true });
await writeFile('public/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + [...routes].map(route => '<url><loc>' + escape(new URL(route,base).href) + '</loc></url>').join('') + '</urlset>');
await writeFile('public/robots.txt', 'User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /cart\nDisallow: /wishlist\nSitemap: ' + new URL('/sitemap.xml',base).href + '\n');
console.log('Generated sitemap with ' + routes.size + ' URLs. Rebuild before deploying.');
