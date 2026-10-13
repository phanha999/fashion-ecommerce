# React + Shopify storefront

Shopify is the source for products, inventory, collections, content, policies, customer accounts, addresses and orders. React is the storefront.

## Start

npm install
npm run dev

Copy .env.example to .env.local and configure the public Storefront token. The existing project uses ap-panndo.myshopify.com.

Legacy accounts need unauthenticated_read_customers and unauthenticated_write_customers. No Customer Account Client ID or OAuth callback URL is used.

## Features

- Catalog search, sorting, Shopify filters and URL-preserved selections.
- Product URLs by handle (older encoded Shopify IDs remain supported).
- Product gallery, variants, related products and published reviews.
- Legacy email/password login, registration and password recovery.
- Account orders/details/tracking links, profile and marketing preferences.
- Saved address create/edit/delete/default.
- Shopify cart, quantity controls, removal, discounts and guest or authenticated checkout.
- Cart restoration, expiry handling, focus refresh, browser-tab synchronization and retry.
- Wishlist saved on this browser.
- Shopify content pages, policies, blog index and article pages.
- Native Shopify newsletter/contact forms and review moderation submissions.
- Page metadata, product structured data, sitemap generator and robots exclusions.
- Keyboard search dialog, mobile layout, 404 and application error boundary.

Read docs/SHOPIFY-OPERATIONS.md for Shopify content setup and remaining admin checks.

Manage navigation in Shopify Admin → Content → Menus. The header reads `main-menu` and the footer reads `footer`, including up to three levels of links in the saved order. Items with children become mega menus: hover on desktop above 1024px, with keyboard/click support; tablet and mobile use a Menu button and a drawer with expandable groups. Rename, reorder, add or remove items in Shopify, save, then reload the storefront. Collection/product/page links open their React routes; external, email and telephone links keep their destinations. Theme-specific `?view=` links do not switch layouts in this React storefront. Collection images can appear inside matching mega menus when configured in Shopify.

## Verify

Run npm run verify to check lint and the production build.

## Deploy

Use HTTPS hosting with the included route rewrites. Set public Shopify environment variables during build. Never expose an Admin token, private Storefront token or client secret.

Vercel and Netlify configuration files are included. Both use `npm run build:deploy`, which generates a fresh sitemap before building. Set `VITE_SITE_URL` to the real frontend HTTPS origin in the host's build environment. On Vercel, leaving it empty uses the system production URL or deployment URL when system environment variables are exposed. Deployment environment variables take precedence over local environment files. A domain is not needed for local development or `npm run verify`.

Generate sitemap/robots for the actual frontend domain before building:
npm run sitemap -- https://YOUR-FRONTEND-DOMAIN
npm run build:optimized

Publish dist/ using your chosen hosting provider. Shipping/refund/terms policies and payment/shipping/tax configuration remain managed in Shopify.



## Motion, notifications and performance

Cart, wishlist, account changes and connection changes use dismissible live notifications. Motion uses transform/opacity, native scrolling and IntersectionObserver; reduced-motion preferences disable animation. Offscreen homepage sections and route code load on demand.

Responsive Shopify images avoid downloading full-size originals. The optimized build preloads the first home/shop image and starts matching public Shopify reads before the React bundle finishes loading. Account/cart requests are never prefetched, and live prices remain sourced from Shopify.
