# Manage this React storefront from Shopify

## Content ownership

Products, inventory, variants, prices, collections, pages, policies, blogs, customer profiles, addresses, orders and discounts are read from Shopify. No Admin API secret belongs in the React app.

### Pages

Edit Shopify Content > Pages:
- contact: public contact information; the React page also includes Shopify's contact form.
- about-us: About page.
- faqs: Frequently asked questions.
- size-guide: size table.
- Any other published page is available at /pages/PAGE-HANDLE.

Pages must be available to the Storefront API.

### Policies

Edit Shopify Settings > Policies. The React policy pages read the shop policy fields.
At verification, privacyPolicy was available; refundPolicy, shippingPolicy and termsOfService were empty.
The site shows an honest unpublished state until you publish them.

### Store contact / announcement

Shop name and description come from Shopify's Shop object.
Create STORE metafield definitions under Settings > Custom data > Store, with Storefront public read access:
- custom.support_email — single line text.
- custom.support_phone — single line text.
- custom.support_address — multiline text.
- custom.announcement — single line text.

React uses these when provided. If support_email is absent, it uses an email found in the Shopify Contact page or Privacy policy. It does not invent a telephone number, address or promotion.

### Reviews

Create a PRODUCT JSON metafield custom.reviews with Storefront public read access.
Publish only moderated reviews with this shape:

[
  { "author": "Customer display name", "rating": 5, "body": "Their review text" }
]

The review submission form uses Shopify contact handling to send a moderation request to the store. Reviews are not automatically published, and the app does not claim that a review is a verified purchase. An installed review app can replace this manual workflow later.

### Newsletter and contact

Public forms use Shopify native /contact form handling, including spam challenges. They navigate to the hosted store to show Shopify's result. Ensure the Online Store channel has an active theme and that its customer/contact forms work.

Logged-in customers can opt into or out of marketing in Profile; newsletter sign-up updates acceptsMarketing for the current account.
Configure actual email campaigns in Shopify Email or your email provider. Capturing consent does not itself send campaigns.

### Account and checkout

Storefront token must allow unauthenticated_read_customers and unauthenticated_write_customers.
Legacy customer accounts must be enabled.
Orders, addresses and profile actions authenticate using the current customer's token. Checkout always refreshes the cart and attaches or detaches the customer's buyer identity immediately before redirecting.
Account sessions are per browser tab. Wishlist is local to this browser, not synced across devices.

## Before accepting live orders

These checks require Shopify Admin / a customer and cannot be certified from frontend code alone:
1. Configure payment provider and test mode, shipping zones/rates, taxes and inventory.
2. Confirm the storefront's Legacy login is active and customer API scopes are granted.
3. Use a designated test customer to verify signup, recovery email, address management and marketing consent.
4. Place a Shopify test order, verify payment result, admin order, notification email and account order history.
5. Check fulfilment/tracking, refund workflow and actual store policies.
6. Test public contact/newsletter forms and spam challenges on your hosted store.
7. Connect the frontend HTTPS domain and configure SPA fallback for product, account and content routes.
8. Generate the sitemap for the frontend domain: npm run sitemap -- https://YOUR-FRONTEND-DOMAIN
9. Run npm run verify, npm run test:e2e and npm audit.
10. Schedule sitemap regeneration/redeployment when published Shopify URLs change.

Analytics is not loaded by default. Configure your chosen provider and consent rules before enabling tracking.

## Remaining architecture trade-off

The catalog implementation preserves complete unique-product counts and vendor/availability facet counts from Shopify products, because Shopify's search index can omit products and Storefront has no productsCount query.
Base product pages are cached briefly and reused between filter/sort changes to reduce repeated full-catalog downloads. Very large catalogs should use a backend search/index service or a different count UX and true server cursor pagination.

SEO metadata and structured data are rendered by React. The sitemap helps discovery, but server rendering/prerendering is a separate hosting improvement for crawlers that do not execute JavaScript.

## Verification evidence

Unit tests mock Shopify errors, sessions, quantities and cart operations.
Browser tests mock Shopify responses and cover account/order/address/profile, wishlist, mobile search, cart persistence, discount code and checkout identity.
Live scripts verify Shopify read schemas and cart create/add/update/remove without creating an order or charging a payment.
