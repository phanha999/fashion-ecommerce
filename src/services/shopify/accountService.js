const storeDomain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '')
  .trim()
  .replace(/^https?:\/\//, '')
  .replace(/\/+$/, '');
const clientId = (import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || '').trim();
const redirectUri = (import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI || '').trim();
const SESSION_KEY = 'velora_customer_account_session';
const FLOW_KEY = 'velora_customer_account_oauth_flow';

async function getOpenIdConfiguration() {
  if (!storeDomain) throw new Error('Add VITE_SHOPIFY_STORE_DOMAIN to .env.local.');
  const response = await fetch(`https://${storeDomain}/.well-known/openid-configuration`);
  if (!response.ok) throw new Error(`Shopify authentication discovery failed (${response.status}).`);
  return response.json();
}

async function getCustomerApiUrl() {
  const response = await fetch(`https://${storeDomain}/.well-known/customer-account-api`);
  if (!response.ok) throw new Error(`Shopify Customer Account API discovery failed (${response.status}).`);
  const config = await response.json();
  if (!config.graphql_api) throw new Error('Shopify did not return a Customer Account API endpoint.');
  return config.graphql_api;
}

function randomBase64Url(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createCodeChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  let binary = '';
  new Uint8Array(digest).forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function readStoredSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (!session?.accessToken || session.expiresAt <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function getCustomerAccountConfigError() {
  if (!storeDomain) return 'Add VITE_SHOPIFY_STORE_DOMAIN to .env.local.';
  if (!clientId) return 'Add VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID to .env.local.';
  if (!redirectUri) return 'Add VITE_SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI to .env.local.';
  if (!redirectUri.startsWith('https://')) return 'Shopify requires an HTTPS callback URL. Use an HTTPS tunnel for local development.';
  return '';
}

export async function startCustomerLogin() {
  const configError = getCustomerAccountConfigError();
  if (configError) throw new Error(configError);

  const oidc = await getOpenIdConfiguration();
  const state = randomBase64Url();
  const nonce = randomBase64Url();
  const codeVerifier = randomBase64Url(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  sessionStorage.setItem(FLOW_KEY, JSON.stringify({ state, nonce, codeVerifier }));

  const authorizationUrl = new URL(oidc.authorization_endpoint);
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    scope: 'openid email customer-account-api:full',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString();
  window.location.assign(authorizationUrl.toString());
}

export async function completeCustomerLogin(search) {
  const params = new URLSearchParams(search);
  const authorizationError = params.get('error_description') || params.get('error');
  if (authorizationError) throw new Error(authorizationError);

  const code = params.get('code');
  const returnedState = params.get('state');
  if (!code || !returnedState) throw new Error('Shopify did not return an authorization code.');

  const flow = JSON.parse(sessionStorage.getItem(FLOW_KEY) || 'null');
  sessionStorage.removeItem(FLOW_KEY);
  if (!flow?.state || flow.state !== returnedState) {
    throw new Error('The Shopify sign-in response could not be verified. Please try again.');
  }

  const oidc = await getOpenIdConfiguration();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: flow.codeVerifier,
  });
  const response = await fetch(oidc.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const token = await response.json();
  if (!response.ok || !token.access_token || !token.id_token) {
    throw new Error(token.error_description || token.error || 'Shopify could not complete sign-in.');
  }

  const tokenPayload = JSON.parse(atob(token.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  if (tokenPayload.nonce !== flow.nonce) {
    throw new Error('The Shopify sign-in response failed nonce validation. Please try again.');
  }

  const session = {
    accessToken: token.access_token,
    idToken: token.id_token,
    expiresAt: Date.now() + Number(token.expires_in || 3600) * 1000,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return getCustomerProfile(session.accessToken);
}

export async function getCustomerProfile(accessToken = readStoredSession()?.accessToken) {
  if (!accessToken) return null;
  const endpoint = await getCustomerApiUrl();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({
      query: `query CurrentCustomer {
        customer {
          id
          displayName
          firstName
          lastName
          emailAddress { emailAddress }
        }
      }`,
    }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.map((error) => error.message).join('; ') || `Customer lookup failed (${response.status}).`);
  }
  return payload.data?.customer || null;
}

export async function logoutCustomer() {
  const session = readStoredSession();
  sessionStorage.removeItem(SESSION_KEY);
  if (!session?.idToken || !redirectUri) return;

  try {
    const oidc = await getOpenIdConfiguration();
    const logoutUrl = new URL(oidc.end_session_endpoint);
    logoutUrl.search = new URLSearchParams({
      id_token_hint: session.idToken,
      post_logout_redirect_uri: redirectUri,
    }).toString();
    window.location.assign(logoutUrl.toString());
  } catch {
    window.location.assign('/account');
  }
}
