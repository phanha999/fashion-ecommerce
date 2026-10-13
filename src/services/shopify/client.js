const storeDomain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '')
  .trim()
  .replace(/^https?:\/\//, '')
  .replace(/\/+$/, '');
const storefrontToken = (import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '').trim();
const apiVersion = (import.meta.env.VITE_SHOPIFY_API_VERSION || '2026-07').trim();

export async function shopifyFetch(query, variables = {}) {
  if (!storeDomain || !storefrontToken) {
    throw new Error('Shopify config is missing. Check .env.local.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const requestKey = JSON.stringify([query, variables]);
    const earlyRequest = globalThis.__SHOPIFY_PREFETCH__?.get(requestKey);
    globalThis.__SHOPIFY_PREFETCH__?.delete(requestKey);
    const response = await (earlyRequest || fetch(`https://${storeDomain}/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    }));

    const payload = await response.json().catch(() => {
      throw new Error('Shopify returned an invalid response. Please try again.');
    });
    if (!response.ok || payload.errors?.length) {
      const message = payload.errors?.map((error) => error.message).join('; ');
      throw new Error(message || `Shopify request failed (${response.status})`);
    }

    if (!payload.data) throw new Error('Shopify returned no data. Please try again.');
    return payload.data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Shopify took too long to respond. Please try again.', { cause: error });
    if (error instanceof TypeError) throw new Error('Could not connect to Shopify. Check your connection and try again.', { cause: error });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
