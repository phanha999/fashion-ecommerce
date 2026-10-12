import { shopifyFetch } from './client';
import { readStoredSession } from './accountService';

function token() {
  const session = readStoredSession();
  if (!session) throw new Error('Please sign in again to manage your account.');
  return session.accessToken;
}
function checked(payload) {
  if (!payload) throw new Error('Shopify returned an invalid response.');
  if (payload.customerUserErrors?.length) throw new Error(payload.customerUserErrors.map(item => item.message).join(' '));
  return payload;
}
const addressFields = 'id firstName lastName company address1 address2 city province country zip phone formatted';
export async function getAccountDetails() {
  const accessToken = token();
  let after = null;
  let customer;
  const addresses = [];
  do {
    const data = await shopifyFetch(`query AccountDetails($token: String!, $after: String) {
      customer(customerAccessToken: $token) {
        id firstName lastName displayName email phone acceptsMarketing
        defaultAddress { id }
        addresses(first: 100, after: $after) { nodes { ${addressFields} } pageInfo { hasNextPage endCursor } }
      }
    }`, { token: accessToken, after });
    if (!data.customer) throw new Error('Your session has expired. Please sign in again.');
    customer = data.customer;
    addresses.push(...customer.addresses.nodes);
    const page = customer.addresses.pageInfo;
    if (page.hasNextPage && (!page.endCursor || page.endCursor === after)) throw new Error('Could not load your addresses.');
    after = page.hasNextPage ? page.endCursor : null;
  } while (after);
  return { ...customer, addresses };
}
export async function getOrders(after = null) {
  const data = await shopifyFetch(`query Orders($token: String!, $after: String) {
    customer(customerAccessToken: $token) {
      orders(first: 10, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id name processedAt financialStatus fulfillmentStatus statusUrl
          totalPrice { amount currencyCode }
          shippingAddress { formatted }
          lineItems(first: 250) { nodes { title quantity variant { title image { url altText } } } pageInfo { hasNextPage } }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }`, { token: token(), after });
  if (!data.customer) throw new Error('Your session has expired. Please sign in again.');
  return data.customer.orders;
}
export async function updateProfile(input) {
  const data = await shopifyFetch(`mutation UpdateProfile($token: String!, $input: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $token, customer: $input) {
      customer { id firstName lastName displayName email phone acceptsMarketing }
      customerUserErrors { field message }
    }
  }`, { token: token(), input });
  return checked(data.customerUpdate).customer;
}
export async function saveAddress(address, id) {
  const name = id ? 'customerAddressUpdate' : 'customerAddressCreate';
  const declarations = id ? ', $id: ID!' : '';
  const argument = id ? ', id: $id' : '';
  const data = await shopifyFetch(`mutation SaveAddress($token: String!, $address: MailingAddressInput!${declarations}) {
    ${name}(customerAccessToken: $token, address: $address${argument}) {
      customerAddress { id } customerUserErrors { field message }
    }
  }`, { token: token(), address, ...(id ? { id } : {}) });
  return checked(data[name]);
}
export async function deleteAddress(id) {
  const data = await shopifyFetch(`mutation DeleteAddress($token: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $token, id: $id) { deletedCustomerAddressId customerUserErrors { field message } }
  }`, { token: token(), id });
  return checked(data.customerAddressDelete);
}
export async function setDefaultAddress(id) {
  const data = await shopifyFetch(`mutation DefaultAddress($token: String!, $id: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $token, addressId: $id) { customer { id } customerUserErrors { field message } }
  }`, { token: token(), id });
  return checked(data.customerDefaultAddressUpdate);
}
