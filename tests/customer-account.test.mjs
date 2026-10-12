import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/services/shopify/accountService.js', import.meta.url), 'utf8');
const key = 'velora_legacy_customer_session';
function setup(handler) {
  const storage = new Map();
  const calls = [];
  const context = vm.createContext({
    Date,
    sessionStorage: { getItem: name => storage.get(name) ?? null, setItem: (name, value) => storage.set(name, value), removeItem: name => storage.delete(name) },
    shopifyFetch: async (query, variables) => { calls.push({ query, variables }); return handler(query, variables); },
  });
  vm.runInContext(source.replace("import { shopifyFetch } from './client';", '').replaceAll('import.meta.env', '({ VITE_SHOPIFY_STORE_DOMAIN: "test.myshopify.com", VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: "public-token" })').replaceAll('export ', '') +
    ';globalThis.api = { loginCustomer, registerCustomer, recoverCustomer, logoutCustomer, getCustomerProfile, readStoredSession, getCustomerAccountConfigError };', context);
  return { api: context.api, storage, calls };
}
test('Legacy needs only existing Storefront config', () => {
  assert.equal(setup().api.getCustomerAccountConfigError(), '');
});
test('login saves token and expiry but never password', async () => {
  const app = setup(query => query.includes('mutation Login')
    ? { customerAccessTokenCreate: { customerAccessToken: { accessToken: 'customer-token', expiresAt: new Date(Date.now() + 3600000).toISOString() }, customerUserErrors: [] } }
    : { customer: { id: '1', email: 'lan@example.com' } });
  const customer = await app.api.loginCustomer({ email: ' lan@example.com ', password: 'secret' });
  assert.equal(customer.email, 'lan@example.com');
  assert.equal(app.calls[0].variables.input.email, 'lan@example.com');
  assert.equal(app.api.readStoredSession().accessToken, 'customer-token');
  assert.equal(app.storage.get(key).includes('secret'), false);
});
test('bad credentials surface Shopify errors without saving a session', async () => {
  const app = setup(() => ({ customerAccessTokenCreate: { customerUserErrors: [{ message: 'Unidentified customer' }] } }));
  await assert.rejects(app.api.loginCustomer({ email: 'x@example.com', password: 'wrong' }), /Unidentified customer/);
  assert.equal(app.storage.has(key), false);
});
test('invalid and expired sessions are discarded without an API call', async () => {
  const app = setup(() => { throw new Error('should not fetch'); });
  for (const value of ['invalid json', JSON.stringify({ accessToken: 'expired', expiresAt: Date.now() - 100 })]) {
    app.storage.set(key, value);
    assert.equal(await app.api.getCustomerProfile(), null);
  }
  assert.equal(app.calls.length, 0);
});
test('revoked token clears the stored session', async () => {
  const app = setup(() => ({ customer: null }));
  app.storage.set(key, JSON.stringify({ accessToken: 'revoked', expiresAt: Date.now() + 10000 }));
  assert.equal(await app.api.getCustomerProfile(), null);
  assert.equal(app.storage.has(key), false);
});
test('registration sends customer details and does not create a login session', async () => {
  const app = setup(() => ({ customerCreate: { customer: { id: 'new' }, customerUserErrors: [] } }));
  await app.api.registerCustomer({ firstName: ' Lan ', lastName: ' Nguyen ', email: 'lan@example.com', password: 'secret' });
  assert.equal(app.calls[0].variables.input.firstName, 'Lan');
  assert.equal(app.storage.has(key), false);
});
test('recovery propagates errors and accepts a successful response', async () => {
  const app = setup(() => ({ customerRecover: { customerUserErrors: [] } }));
  await app.api.recoverCustomer(' lan@example.com ');
  assert.equal(app.calls[0].variables.email, 'lan@example.com');
  const failure = setup(() => ({ customerRecover: { customerUserErrors: [{ message: 'Try again later' }] } }));
  await assert.rejects(failure.api.recoverCustomer('lan@example.com'), /Try again later/);
});
test('logout revokes customer token and clears local session even on network failure', async () => {
  for (const offline of [false, true]) {
    const app = setup(() => {
      if (offline) throw new Error('offline');
      return { customerAccessTokenDelete: { deletedCustomerAccessTokenId: 'id', userErrors: [] } };
    });
    app.storage.set(key, JSON.stringify({ accessToken: 'customer-token', expiresAt: Date.now() + 10000 }));
    if (offline) await assert.rejects(app.api.logoutCustomer(), /offline/);
    else await app.api.logoutCustomer();
    assert.equal(app.calls[0].variables.token, 'customer-token');
    assert.equal(app.storage.has(key), false);
  }
});