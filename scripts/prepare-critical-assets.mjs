import { readFile, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
import vm from 'node:vm';
import { shopifyImageUrl } from '../src/utils/shopifyImage.js';

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
const domain = (env.VITE_SHOPIFY_STORE_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
if (!domain || !env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN) throw new Error('Shopify public configuration is required for optimized builds.');
async function shopifyFetch(query, variables = {}) {
  const response = await fetch(`https://${domain}/api/${env.VITE_SHOPIFY_API_VERSION || '2026-07'}/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(20000),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) throw new Error('Could not prepare Shopify image hints.');
  return payload.data;
}
const source = (await readFile('src/services/shopify/contentService.js', 'utf8')).replace(/^import .*;\r?\n/, '').replaceAll('export ', '');
const context = vm.createContext({ shopifyFetch });
vm.runInContext(source + ';globalThis.hero = getHeroBanners;', context);
const [banners, catalog] = await Promise.all([
  context.hero().catch(() => []),
  shopifyFetch('{ products(first: 2, sortKey: TITLE) { nodes { featuredImage { url } } } }'),
]);
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
function hint(src, maxWidth, sizes) {
  if (!src) return '';
  const widths = [240, 360, 480, 640, 960, 1440, 1920].filter(width => width <= maxWidth);
  return `<link rel="preload" as="image" ${new URL(src).hostname === 'cdn.shopify.com' ? 'crossorigin="anonymous"' : ''} fetchpriority="high" href="${escape(shopifyImageUrl(src, maxWidth))}" imagesrcset="${escape(widths.map(width => shopifyImageUrl(src, width) + ' ' + width + 'w').join(', '))}" imagesizes="${sizes}">`;
}
const html = await readFile('dist/index.html', 'utf8');
const appHtml = html.replace('</head>', `<link rel="preconnect" href="https://${escape(domain)}" crossorigin></head>`);
// Start only public reads while the JS bundle is loading, then let the normal
// Storefront client consume those exact responses. No account/cart read is prefetched.
async function capture(file, name, argument, mock) {
  const calls = [];
  const code = (await readFile(file, 'utf8')).replace(/^import .*;\r?\n/, '').replaceAll('export ', '');
  const sandbox = vm.createContext({ shopifyFetch: async (query, variables = {}) => { calls.push({ query, variables }); return mock; } });
  vm.runInContext(code + ';globalThis.operation = ' + name + ';', sandbox);
  await sandbox.operation(argument).catch(() => {});
  return calls;
}
const [siteRequests, heroRequests, productRequests, shopRequests] = await Promise.all([
  capture('src/services/shopify/siteService.js', 'getSiteInfo', undefined, { shop: {}, pages: {nodes:[]} }),
  capture('src/services/shopify/contentService.js', 'getHeroBanners', undefined, {metaobjects:{nodes:[]}}),
  capture('src/services/shopify/productService.js', 'getProductDetail', '__handle__', {product:{variants:{nodes:[],pageInfo:{hasNextPage:false}}}}),
  capture('src/services/shopify/productService.js', 'searchProducts', {first:24,sortKey:'TITLE'}, {products:{nodes:[],filters:[],pageInfo:{hasNextPage:false}}}),
]);
const publicQueries = { site: siteRequests, hero: heroRequests, product: productRequests, shop: shopRequests };
const prefetch = `<script>(()=>{const q=${JSON.stringify(publicQueries).replaceAll('<', '\\u003c')};const p=location.pathname;let requests=[...q.site];if(p==='/')requests.push(...q.hero);else if(/^\\/shop\\/?$/.test(p)&&!location.search)requests.push(...q.shop);else if(/^\\/products\\/[^/]+\\/?$/.test(p)){try{const handle=decodeURIComponent(p.split('/')[2]);if(!handle.startsWith('gid:'))requests.push(...q.product.map(s=>({...s,variables:{...s.variables,handle}})))}catch{}}const cache=window.__SHOPIFY_PREFETCH__=new Map;for(const spec of requests){const promise=fetch(${JSON.stringify(`https://${domain}/api/${env.VITE_SHOPIFY_API_VERSION || '2026-07'}/graphql.json`)},{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':${JSON.stringify(env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN)}},body:JSON.stringify(spec),signal:AbortSignal.timeout(20000)});promise.catch(()=>{});if(spec.query.includes('query ProductDetail'))promise.then(r=>r.clone().json()).then(({data})=>{const product=data?.product;if(!product)return;const variant=product.variants?.nodes.find(v=>v.availableForSale)||product.variants?.nodes[0];const src=variant?.image?.url||product.featuredImage?.url;if(!src)return;const transform=(url,width)=>{const u=new URL(url);if(u.hostname==='cdn.shopify.com')u.searchParams.set('width',width);return u.href};const link=document.createElement('link');link.rel='preload';link.as='image';if(new URL(src).hostname==='cdn.shopify.com')link.crossOrigin='anonymous';link.setAttribute('fetchpriority','high');link.href=transform(src,960);link.setAttribute('imagesrcset',[240,360,480,640,960].map(w=>transform(src,w)+' '+w+'w').join(', '));link.setAttribute('imagesizes','(max-width: 768px) 100vw, 50vw');document.head.appendChild(link)}).catch(()=>{});cache.set(JSON.stringify([spec.query,spec.variables]),promise)}setTimeout(()=>cache.clear(),30000)})()</script>`;
const liveHtml = appHtml.replace('</head>', prefetch + '</head>');
await writeFile('dist/app.html', liveHtml);
await writeFile('dist/index.html', liveHtml.replace('</head>', hint(banners[0]?.image, 1920, '100vw') + '</head>'));
// Filtered shops may have a different first product. Don't preload the all-products image for them.
const shopHint = catalog.products.nodes.map(product => hint(product.featuredImage?.url, 960, '(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw')).join('');
const conditionalHint = `<script>if(!location.search){document.head.insertAdjacentHTML('beforeend',${JSON.stringify(shopHint).replaceAll('<', '\\u003c')})}</script>`;
await writeFile('dist/shop.html', liveHtml.replace('</head>', conditionalHint + '</head>'));
console.log('Prepared route-specific Shopify image hints; prices and availability remain live API data.');
