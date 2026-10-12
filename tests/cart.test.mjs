import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/services/shopify/cartService.js', import.meta.url), 'utf8');
function setup(handler) {
  const calls = [];
  const context = vm.createContext({ shopifyFetch: async (query, variables) => {
    calls.push({ query, variables });
    return handler(query, variables);
  } });
  vm.runInContext(source.replace("import { shopifyFetch } from './client';", '').replaceAll('export ', '') +
    ';globalThis.api = { getCart, addCartLine, updateCartLine, removeCartLine, updateCartBuyer, updateCartDiscounts };', context);
  return { api: context.api, calls };
}
const variant = 'gid://shopify/ProductVariant/1';
test('invalid quantities and product IDs never reach Shopify', async () => {
  const app = setup(() => { throw new Error('must not fetch'); });
  for (const quantity of [0, -1, 1.5, 251, NaN]) {
    await assert.rejects(app.api.addCartLine(null, variant, quantity), /Quantity/);
  }
  await assert.rejects(app.api.addCartLine(null, 'gid://shopify/Product/1', 1), /variant/);
  assert.equal(app.calls.length, 0);
});
test('first add creates a cart, later adds use the existing cart ID', async () => {
  const app = setup(query => query.includes('cartCreate') ? { cartCreate: { cart: { id: 'cart-1' }, userErrors: [] } } : { cartLinesAdd: { cart: { id: 'cart-1' }, userErrors: [] } });
  const cart = await app.api.addCartLine(null, variant, 2);
  assert.equal(cart.id, 'cart-1');
  assert.equal(app.calls[0].variables.input.lines[0].merchandiseId, variant);
  assert.equal(app.calls[0].variables.input.lines[0].quantity, 2);
  await app.api.addCartLine(cart.id, variant, 1);
  assert.equal(app.calls[1].variables.cartId, 'cart-1');
});
test('Shopify stock errors propagate and adjustments stay visible', async () => {
  const failure = setup(() => ({ cartLinesAdd: { userErrors: [{ message: 'Sold out' }] } }));
  await assert.rejects(failure.api.addCartLine('cart-1', variant, 1), /Sold out/);
  const app = setup(() => ({ cartLinesAdd: { cart: { id: 'cart-1', totalQuantity: 1 }, warnings: [{ message: 'Quantity adjusted' }] } }));
  assert.equal((await app.api.addCartLine('cart-1', variant, 3)).warnings[0].message, 'Quantity adjusted');
});
test('update and remove send cart line IDs, not merchandise IDs', async () => {
  const app = setup(query => query.includes('cartLinesUpdate') ? { cartLinesUpdate: { cart: { id: 'cart-1' } } } : { cartLinesRemove: { cart: { id: 'cart-1' } } });
  await app.api.updateCartLine('cart-1', 'line-1', 3);
  assert.equal(app.calls[0].variables.lines[0].id, 'line-1');
  assert.equal(app.calls[0].variables.lines[0].quantity, 3);
  await app.api.removeCartLine('cart-1', 'line-1');
  assert.equal(app.calls[1].variables.lineIds[0], 'line-1');
});
test('expired cart lookup returns null so the provider can recreate it', async () => {
  const app = setup(() => ({ cart: null }));
  assert.equal(await app.api.getCart('expired'), null);
});
test('buyer identity can attach and detach the customer', async () => {
  const app = setup(() => ({ cartBuyerIdentityUpdate: { cart: { id: 'cart-1' }, userErrors: [] } }));
  await app.api.updateCartBuyer('cart-1', { customerAccessToken: 'customer-token' });
  await app.api.updateCartBuyer('cart-1', { customerAccessToken: null, email: null, phone: null });
  assert.equal(app.calls[0].variables.identity.customerAccessToken, 'customer-token');
  assert.equal(app.calls[1].variables.identity.customerAccessToken, null);
});
test('discount applicability comes from Shopify, not a frontend guess', async () => {
  const app = setup(() => ({ cartDiscountCodesUpdate: { cart: { id: 'cart-1', discountCodes: [{ code: 'INVALID', applicable: false }] }, userErrors: [] } }));
  const cart = await app.api.updateCartDiscounts('cart-1', ['INVALID']);
  assert.equal(cart.discountCodes[0].applicable, false);
});
test('cart pagination includes items after the first 250 lines', async () => {
  const app = setup(query => query.includes('MoreCartLines')
    ? { cart: { lines: { nodes: [{ id: 'line-251' }], pageInfo: { hasNextPage: false } } } }
    : { cart: { id: 'cart-1', lines: { nodes: [{ id: 'line-1' }], pageInfo: { hasNextPage: true, endCursor: 'cursor-250' } } } });
  const cart = await app.api.getCart('cart-1');
  assert.equal(cart.lines.nodes.length, 2);
  assert.equal(app.calls[1].variables.after, 'cursor-250');
});
