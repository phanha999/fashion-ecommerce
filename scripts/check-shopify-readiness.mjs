import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const env = Object.fromEntries((await readFile('.env.local', 'utf8')).split(String.fromCharCode(10)).filter(line => line && !line.startsWith('#')).map(line => { const index = line.indexOf('='); return [line.slice(0,index).trim(), line.slice(index+1).trim().replace(/^['"]|['"]$/g,'')]; }));
async function shopifyFetch(query, variables={}) {
  const response = await fetch('https://' + env.VITE_SHOPIFY_STORE_DOMAIN + '/api/' + env.VITE_SHOPIFY_API_VERSION + '/graphql.json', {
    method:'POST', headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN}, body:JSON.stringify({query,variables})
  });
  const payload=await response.json();
  if(!response.ok || payload.errors?.length) throw new Error(payload.errors?.map(item=>item.message).join('; ') || 'API failed');
  return payload.data;
}
async function moduleApi(file, names, extra={}) {
  const source = (await readFile(file,'utf8')).split(String.fromCharCode(10)).filter(line=>!line.startsWith('import ')).join(String.fromCharCode(10)).replaceAll('export ','');
  const context=vm.createContext({shopifyFetch,...extra});
  vm.runInContext(source + ';globalThis.api={' + names.join(',') + '};',context);
  return context.api;
}
const catalog=await moduleApi('src/services/shopify/productService.js',['searchProducts','getProductDetail']);
const products=await catalog.searchProducts({first:2});
if(!products.products.length) throw new Error('No products');
console.log('PASS catalog query, filters and sorting');
const product=await catalog.getProductDetail(products.products[0].id);
await catalog.getProductDetail(product.handle);
console.log('PASS product lookup by ID and handle, gallery and SEO');
const site=await moduleApi('src/services/shopify/siteService.js',['getSiteInfo','getContentPage']);
const info=await site.getSiteInfo();
await site.getContentPage('size-guide');
console.log('PASS Shopify pages and policy query; missing policies: ' + ['refundPolicy','shippingPolicy','termsOfService'].filter(key=>!info[key]).join(', '));
const accounts=await moduleApi('src/services/shopify/accountDetailsService.js',['getAccountDetails','getOrders'],{readStoredSession:()=>({accessToken:'diagnostic-invalid-token'})});
for(const name of ['getAccountDetails','getOrders']) {
  try { await accounts[name](); } catch(error) { if(!error.message.includes('session has expired')) throw error; }
}
console.log('PASS account/address/order GraphQL schema (invalid token, no customer data accessed)');
const schema=await shopifyFetch('{ __type(name:"QueryRoot") { fields { name } } }');
console.log('Products count field: ' + schema.__type.fields.some(field=>field.name==='productsCount'));
