import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source = (await readFile(new URL('../src/services/shopify/accountDetailsService.js', import.meta.url), 'utf8')).split(String.fromCharCode(10)).filter(line => !line.startsWith('import ')).join(String.fromCharCode(10)).replaceAll('export ', '');
function setup(handler, session = { accessToken: 'customer-token' }) {
  const calls = [];
  const context = vm.createContext({ readStoredSession: () => session, shopifyFetch: async (query, variables) => { calls.push({ query, variables }); return handler(query, variables); } });
  vm.runInContext(source + ';globalThis.api={getAccountDetails,getOrders,updateProfile,saveAddress,deleteAddress,setDefaultAddress};', context);
  return { api: context.api, calls };
}
test('protected operations do not call Shopify when signed out', async () => {
  const app = setup(() => { throw new Error('must not fetch'); }, null);
  for (const action of [() => app.api.getAccountDetails(), () => app.api.getOrders(), () => app.api.updateProfile({}), () => app.api.saveAddress({}), () => app.api.deleteAddress('id')]) await assert.rejects(action(), /sign in again/);
  assert.equal(app.calls.length, 0);
});
test('address pagination accumulates all saved addresses', async () => {
  const app = setup((query, vars) => ({ customer: { id: 'customer-1', addresses: { nodes: [{ id: vars.after ? 'second' : 'first' }], pageInfo: { hasNextPage: !vars.after, endCursor: vars.after ? null : 'next' } } } }));
  const profile = await app.api.getAccountDetails();
  assert.equal(profile.addresses.length, 2);
  assert.equal(app.calls[1].variables.after, 'next');
});
test('profile and address mutations always authenticate the owning customer', async () => {
  const app = setup(query => {
    if (query.includes('UpdateProfile')) return { customerUpdate: { customer: { firstName: 'Lan' }, customerUserErrors: [] } };
    if (query.includes('customerAddressUpdate')) return { customerAddressUpdate: { customerAddress: { id: 'address-1' }, customerUserErrors: [] } };
    return { customerAddressCreate: { customerAddress: { id: 'address-1' }, customerUserErrors: [] } };
  });
  await app.api.updateProfile({ firstName: 'Lan' });
  await app.api.saveAddress({ address1: 'Street' });
  await app.api.saveAddress({ address1: 'New street' }, 'address-1');
  assert.equal(app.calls[2].variables.id, 'address-1');
  assert.equal(app.calls.every(call => call.variables.token === 'customer-token'), true);
});
test('Shopify validation errors are shown for invalid profile updates', async () => {
  const app = setup(() => ({ customerUpdate: { customerUserErrors: [{ message: 'Phone is invalid' }] } }));
  await assert.rejects(app.api.updateProfile({ phone: 'invalid' }), /Phone is invalid/);
});
test('expired account responses never render another customer', async () => {
  const app = setup(() => ({ customer: null }));
  await assert.rejects(app.api.getOrders(), /session has expired/);
  await assert.rejects(app.api.getAccountDetails(), /session has expired/);
});
