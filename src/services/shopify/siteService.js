import { shopifyFetch } from './client';

export async function getSiteInfo() {
  const data = await shopifyFetch(`query SiteInfo {
    shop {
      name description primaryDomain { url }
      settings: metafields(identifiers: [{namespace:"custom", key:"support_email"}, {namespace:"custom", key:"support_phone"}, {namespace:"custom", key:"support_address"}, {namespace:"custom", key:"announcement"}]) { key value }
      privacyPolicy { title body } refundPolicy { title body }
      shippingPolicy { title body } termsOfService { title body }
    }
    pages(first: 100) { nodes { handle title } }
    contact: page(handle: "contact") { body }
  }`);
  const text = (data.contact?.body || data.shop.privacyPolicy?.body || '').replace(/<[^>]*>/g, ' ');
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const settings = Object.fromEntries((data.shop.settings || []).filter(Boolean).map(item => [item.key, item.value]));
  return { ...data.shop, pages: data.pages.nodes, contactEmail: settings.support_email || email, contactPhone: settings.support_phone || '', contactAddress: settings.support_address || '', announcement: settings.announcement || '' };
}
export async function getContentPage(handle) {
  const data = await shopifyFetch(`query ContentPage($handle: String!) {
    page(handle: $handle) { id title body seo { title description } }
  }`, { handle });
  return data.page;
}
