import { shopifyFetch } from './client';

const SESSION_KEY = 'velora_legacy_customer_session';

export function getCustomerAccountConfigError() {
  if (!import.meta.env.VITE_SHOPIFY_STORE_DOMAIN?.trim()) return 'Shopify store domain is missing.';
  if (!import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim()) return 'Shopify public Storefront token is missing.';
  return '';
}

export function readStoredSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (!session?.accessToken || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function checkErrors(payload) {
  if (!payload) throw new Error('Shopify returned an invalid response.');
  const errors = payload.customerUserErrors || payload.userErrors || [];
  if (errors.length) throw new Error(errors.map(error => error.message).join(' '));
  return payload;
}

export async function getCustomerProfile(accessToken = readStoredSession()?.accessToken) {
  if (!accessToken) return null;
  const data = await shopifyFetch(`query CurrentCustomer($token: String!) {
    customer(customerAccessToken: $token) { id firstName lastName displayName email phone }
  }`, { token: accessToken });
  if (!data.customer && readStoredSession()?.accessToken === accessToken) sessionStorage.removeItem(SESSION_KEY);
  return data.customer || null;
}

export async function loginCustomer({ email, password }) {
  const data = await shopifyFetch(`mutation Login($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }`, { input: { email: email.trim(), password } });
  const { customerAccessToken } = checkErrors(data.customerAccessTokenCreate);
  const expiresAt = Date.parse(customerAccessToken?.expiresAt);
  if (!customerAccessToken?.accessToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new Error('Shopify could not create a valid sign-in session.');
  }
  const session = { accessToken: customerAccessToken.accessToken, expiresAt };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Discard sessions from the previous OTP implementation.
  sessionStorage.removeItem('velora_customer_account_session');
  sessionStorage.removeItem('velora_customer_account_oauth_flow');
  const customer = await getCustomerProfile(session.accessToken);
  if (!customer) throw new Error('Your session is no longer valid. Please sign in again.');
  return customer;
}

export async function registerCustomer({ firstName, lastName, email, password }) {
  const data = await shopifyFetch(`mutation Register($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id }
      customerUserErrors { code field message }
    }
  }`, { input: { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password } });
  const result = checkErrors(data.customerCreate);
  if (!result.customer) throw new Error('Shopify could not create your account.');
}

export async function recoverCustomer(email) {
  const data = await shopifyFetch(`mutation Recover($email: String!) {
    customerRecover(email: $email) { customerUserErrors { code field message } }
  }`, { email: email.trim() });
  checkErrors(data.customerRecover);
}

export async function logoutCustomer() {
  const session = readStoredSession();
  sessionStorage.removeItem(SESSION_KEY);
  if (!session) return;
  const data = await shopifyFetch(`mutation Logout($token: String!) {
    customerAccessTokenDelete(customerAccessToken: $token) { deletedCustomerAccessTokenId userErrors { field message } }
  }`, { token: session.accessToken });
  checkErrors(data.customerAccessTokenDelete);
}