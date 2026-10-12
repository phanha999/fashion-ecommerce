import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const env = Object.fromEntries((await readFile('.env.local', 'utf8')).split(String.fromCharCode(10)).filter(line => line && !line.startsWith('#')).map(line => {
  const index = line.indexOf('=');
  return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')];
}));
async function shopifyFetch(query, variables = {}) {
  const response = await fetch('https://' + env.VITE_SHOPIFY_STORE_DOMAIN + '/api/' + env.VITE_SHOPIFY_API_VERSION + '/graphql.json', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.map(error => error.message).join('; ') || 'Shopify API failed.');
  return payload.data;
}
const source = await readFile('src/services/shopify/cartService.js', 'utf8');
const context = vm.createContext({ shopifyFetch });
vm.runInContext(source.replace("import { shopifyFetch } from './client';", '').replaceAll('export ', '') +
  ';globalThis.api = { getCart, addCartLine, updateCartLine, removeCartLine, updateCartBuyer, updateCartDiscounts };', context);
const { api } = context;
const data = await shopifyFetch('{ products(first: 20) { nodes { variants(first: 20) { nodes { id availableForSale } } } } }');
const variant = data.products.nodes.flatMap(product => product.variants.nodes).find(item => item.availableForSale);
if (!variant) throw new Error('No available variant for the cart check.');
let cart;
try {
  cart = await api.addCartLine(null, variant.id, 1);
  assert.equal(cart.totalQuantity, 1);
  console.log('PASS Shopify cartCreate with a real variant');
  cart = await api.addCartLine(cart.id, variant.id, 1);
  assert.equal(cart.totalQuantity, 2);
  console.log('PASS Shopify cartLinesAdd');
  const line = cart.lines.nodes[0];
  cart = await api.updateCartLine(cart.id, line.id, 1);
  assert.equal(cart.totalQuantity, 1);
  console.log('PASS Shopify cartLinesUpdate');
  const restored = await api.getCart(cart.id);
  assert.equal(restored.totalQuantity, 1);
  assert.equal(new URL(restored.checkoutUrl).protocol, 'https:');
  console.log('PASS Shopify cart read and checkout URL');
  cart = await api.updateCartBuyer(cart.id, { customerAccessToken: null, email: null, phone: null });
  console.log('PASS guest checkout identity / customer detach');
  cart = await api.updateCartDiscounts(cart.id, ['CODEX_DIAGNOSTIC_INVALID_CODE']);
  assert.equal(cart.discountCodes.find(code => code.code === 'CODEX_DIAGNOSTIC_INVALID_CODE')?.applicable, false);
  cart = await api.updateCartDiscounts(cart.id, []);
  console.log('PASS discount validation and removal');
} finally {
  if (cart?.lines.nodes.length) {
    for (const line of cart.lines.nodes) cart = await api.removeCartLine(cart.id, line.id);
    assert.equal(cart.totalQuantity, 0);
    console.log('PASS Shopify cartLinesRemove; test cart emptied');
  }
}