import { shopifyFetch } from './client';
import { getLocalizationContext } from '../../utils/localization';

export async function getSiteInfo() {
  const data = await shopifyFetch(`query SiteInfo {
    shop {
      name description primaryDomain { url }
      settings: metafields(identifiers: [{namespace:"custom", key:"support_email"}, {namespace:"custom", key:"support_phone"}, {namespace:"custom", key:"support_address"}, {namespace:"custom", key:"announcement"}]) { key value }
      privacyPolicy { title body } refundPolicy { title body }
      shippingPolicy { title body } termsOfService { title body }
    }
    pages(first: 100) { nodes { handle title } }
    collections(first: 30, sortKey: TITLE) { nodes { id handle title image { url altText width height } } }
    mainMenu: menu(handle: "main-menu") {
      title items { id title url type items { id title url type items { id title url type } } }
    }
    footerMenu: menu(handle: "footer") {
      title items { id title url type items { id title url type items { id title url type } } }
    }
    contact: page(handle: "contact") { body }
    logo: metaobject(handle: {type: "logo", handle: "logo-wzgb4w2e"}) {
      fields {
        key
        reference { ... on MediaImage { image { url altText width height } } }
      }
    }
  }`);
  // Operational contact details must not change when editorial text is translated.
  const original = getLocalizationContext().language && getLocalizationContext().language !== 'EN'
    ? await shopifyFetch(`query StoreContact @inContext(language: EN) {
        shop { settings: metafields(identifiers: [{namespace:"custom", key:"support_email"}, {namespace:"custom", key:"support_phone"}, {namespace:"custom", key:"support_address"}]) { key value } privacyPolicy { body } }
        contact: page(handle: "contact") { body }
      }`)
    : data;
  const body = original.contact?.body || original.shop.privacyPolicy?.body || '';
  const text = body.replace(/<[^>]*>/g, ' ');
  const email = body.match(/href=["']mailto:([^"'\s?]+)["'?]/i)?.[1] || text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const settings = Object.fromEntries((data.shop.settings || []).filter(Boolean).map(item => [item.key, item.value]));
  for (const item of original.shop.settings || []) { if (item?.key.startsWith('support_')) settings[item.key] = item.value; }
  const logo = data.logo?.fields.find(field => field.key === 'image')?.reference?.image || null;
  return { ...data.shop, logo, mainMenu: data.mainMenu || null, footerMenu: data.footerMenu || null, collections: data.collections?.nodes || [], pages: data.pages.nodes, contactEmail: settings.support_email || email, contactPhone: settings.support_phone || '', contactAddress: settings.support_address || '', announcement: settings.announcement || '' };
}
export async function getContentPage(handle) {
  const data = await shopifyFetch(`query ContentPage($handle: String!) {
    page(handle: $handle) { id title body seo { title description } }
  }`, { handle });
  return data.page;
}
