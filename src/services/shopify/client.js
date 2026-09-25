const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const storefrontToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2026-07';

export async function shopifyFetch(query, variables = {}) {
  if (!storeDomain || !storefrontToken) {
    throw new Error('Shopify config is missing. Check .env.local.');
  }

  const response = await fetch(`https://${storeDomain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.map((error) => error.message).join('; ');
    throw new Error(message || `Shopify request failed (${response.status})`);
  }

  return payload.data;
}
