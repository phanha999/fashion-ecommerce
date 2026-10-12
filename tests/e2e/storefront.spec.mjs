import { test, expect } from '@playwright/test';

const productId = 'gid://shopify/Product/1';
const variantId = 'gid://shopify/ProductVariant/1';
const product = { id: productId, handle: 'cotton-shirt', title: 'Cotton shirt', description: 'A comfortable cotton shirt.', vendor: 'Test brand', tags: [], availableForSale: true, seo: { title: 'Cotton shirt', description: 'Cotton shirt for everyday wear' }, featuredImage: { url: 'https://images.example/shirt.png', altText: 'Cotton shirt' }, images: { nodes: [{ url: 'https://images.example/shirt.png', altText: 'Front' }, { url: 'https://images.example/back.png', altText: 'Back' }] }, priceRange: { minVariantPrice: { amount: '25', currencyCode: 'USD' } }, variants: { nodes: [{ id: variantId, title: 'Medium / White', availableForSale: true, price: { amount: '25', currencyCode: 'USD' }, selectedOptions: [], image: null }], pageInfo: { hasNextPage: false } } };
const profile = { id: 'customer-1', firstName: 'Lan', lastName: 'Nguyen', displayName: 'Lan Nguyen', email: 'lan@example.com', phone: null, acceptsMarketing: false };
const address = { id: 'address-1', firstName: 'Lan', lastName: 'Nguyen', address1: '1 Test Street', city: 'Ho Chi Minh City', country: 'Vietnam', zip: '70000', formatted: ['Lan Nguyen', '1 Test Street', 'Ho Chi Minh City', 'Vietnam'] };
const order = { id: 'order-1', name: '#1001', processedAt: '2026-10-01T00:00:00Z', financialStatus: 'PAID', fulfillmentStatus: 'FULFILLED', totalPrice: { amount: '25', currencyCode: 'USD' }, shippingAddress: { formatted: ['1 Test Street'] }, statusUrl: 'https://checkout.example/order/1001', lineItems: { nodes: [{ title: 'Cotton shirt', quantity: 1, variant: { title: 'Medium / White' } }], pageInfo: { hasNextPage: false } } };
async function setup(page) {
  const state = { quantity: 0, codes: [], requests: [], addresses: [] };
  await page.route('https://images.example/**', route => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="150"><rect width="100" height="150" fill="#ddd"/></svg>' }));
  await page.route('https://checkout.example/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Shopify checkout</h1>' }));
  function cart() {
    return { id: 'gid://shopify/Cart/test?key=test', checkoutUrl: 'https://checkout.example/cart', totalQuantity: state.quantity, discountCodes: state.codes.map(code => ({ code, applicable: code === 'SAVE10' })), cost: { subtotalAmount: { amount: String(state.quantity * 25), currencyCode: 'USD' }, totalAmount: { amount: String(state.quantity * 25), currencyCode: 'USD' } }, lines: { nodes: state.quantity ? [{ id: 'line-1', quantity: state.quantity, cost: { totalAmount: { amount: String(state.quantity * 25), currencyCode: 'USD' } }, merchandise: { id: variantId, title: 'Medium / White', availableForSale: true, image: null, product } }] : [], pageInfo: { hasNextPage: false } } };
  }
  await page.route('**/api/*/graphql.json', async route => {
    const { query, variables = {} } = route.request().postDataJSON();
    state.requests.push({ query, variables });
    let data;
    if (query.includes('SiteInfo')) data = { shop: { name: 'Test store', description: 'Quality clothing', primaryDomain: { url: 'https://store.example' }, privacyPolicy: { title: 'Privacy policy', body: '<p>Our published privacy policy.</p>' }, refundPolicy: null, shippingPolicy: null, termsOfService: null }, pages: { nodes: [{ handle: 'contact', title: 'Contact' }, { handle: 'size-guide', title: 'Size guide' }, { handle: 'faqs', title: 'FAQ' }] }, contact: { body: '<p>help@store.example</p>' } };
    else if (query.includes('ContentPage')) data = { page: { id: 'page-1', title: 'Size guide', body: '<p>Choose your size.</p><script>window.bad=true</script><a href="javascript:alert(1)">Unsafe link</a>', seo: {} } };
    else if (query.includes('ProductDetail')) data = variables.id ? { node: product } : { product };
    else if (query.includes('Related')) data = { productRecommendations: [] };
    else if (query.includes('QuickProductSearch')) data = { search: { nodes: [product] } };
    else if (query.includes('ShopSearch')) data = { search: { totalCount: 1, productFilters: [], nodes: [product], pageInfo: { hasNextPage: false } } };
    else if (query.includes('ShopCatalog')) data = { products: { nodes: [product], pageInfo: { hasNextPage: false } } };
    else if (query.includes('mutation Login')) data = { customerAccessTokenCreate: { customerAccessToken: { accessToken: 'customer-token', expiresAt: new Date(Date.now() + 3600000).toISOString() }, customerUserErrors: [] } };
    else if (query.includes('CurrentCustomer')) data = { customer: profile };
    else if (query.includes('AccountDetails')) data = { customer: { ...profile, defaultAddress: state.addresses[0] || null, addresses: { nodes: state.addresses, pageInfo: { hasNextPage: false } } } };
    else if (query.includes('query Orders')) data = { customer: { orders: { nodes: [order], pageInfo: { hasNextPage: false } } } };
    else if (query.includes('mutation Register')) data = { customerCreate: { customer: { id: 'customer-1' }, customerUserErrors: [] } };
    else if (query.includes('mutation Recover')) data = { customerRecover: { customerUserErrors: [] } };
    else if (query.includes('UpdateProfile')) { Object.assign(profile, variables.input); data = { customerUpdate: { customer: profile, customerUserErrors: [] } }; }
    else if (query.includes('SaveAddress')) { state.addresses = [{ ...address, ...variables.address, formatted: [variables.address.address1, variables.address.city] }]; data = { [variables.id ? 'customerAddressUpdate' : 'customerAddressCreate']: { customerAddress: address, customerUserErrors: [] } }; }
    else if (query.includes('DeleteAddress')) { state.addresses = []; data = { customerAddressDelete: { deletedCustomerAddressId: 'address-1', customerUserErrors: [] } }; }
    else if (query.includes('DefaultAddress')) data = { customerDefaultAddressUpdate: { customer: profile, customerUserErrors: [] } };
    else if (query.includes('mutation Logout')) data = { customerAccessTokenDelete: { deletedCustomerAccessTokenId: 'token-1', userErrors: [] } };
    else if (query.includes('cartCreate')) { state.quantity = variables.input.lines[0].quantity; data = { cartCreate: { cart: cart(), userErrors: [] } }; }
    else if (query.includes('cartLinesAdd')) { state.quantity += variables.lines[0].quantity; data = { cartLinesAdd: { cart: cart(), userErrors: [] } }; }
    else if (query.includes('cartLinesUpdate')) { state.quantity = variables.lines[0].quantity; data = { cartLinesUpdate: { cart: cart(), userErrors: [] } }; }
    else if (query.includes('cartLinesRemove')) { state.quantity = 0; data = { cartLinesRemove: { cart: cart(), userErrors: [] } }; }
    else if (query.includes('cartBuyerIdentityUpdate')) data = { cartBuyerIdentityUpdate: { cart: cart(), userErrors: [] } };
    else if (query.includes('cartDiscountCodesUpdate')) { state.codes = variables.codes; data = { cartDiscountCodesUpdate: { cart: cart(), userErrors: [] } }; }
    else if (query.includes('query Cart')) data = { cart: state.quantity ? cart() : null };
    else data = {};
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data }) });
  });
  return state;
}
test('account login, orders, profile, addresses and logout', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await setup(page);
  await page.goto('/account');
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill('lan@example.com');
  await page.getByLabel('Password', { exact: true }).fill('password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hello, Lan' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '#1001' })).toBeVisible();
  await page.getByRole('button', { name: 'View details' }).click();
  await expect(page.getByRole('link', { name: 'Track order / delivery status' })).toBeVisible();
  await page.getByRole('button', { name: 'Profile', exact: true }).click();
  await page.getByLabel('First name').fill('Lan');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByRole('status')).toContainText('Profile updated');
  await page.getByRole('button', { name: 'Addresses', exact: true }).click();
  await page.getByRole('button', { name: 'Add address' }).click();
  for (const [label, value] of [['First name','Lan'],['Last name','Nguyen'],['Address','1 Test Street'],['City','Ho Chi Minh City'],['Country','Vietnam']]) await page.getByLabel(label, { exact:true }).fill(value);
  await page.getByRole('button', { name: 'Save address' }).click();
  await expect(page.getByText('DEFAULT ADDRESS')).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact:true }).click();
  await expect(page.getByText('No saved addresses.')).toBeVisible();
  await page.getByRole('button', { name:'Sign out', exact:true }).click();
  await expect(page.getByRole('heading', { name:'Sign in', exact:true })).toBeVisible();
  expect(errors).toEqual([]);
});
test('product gallery, wishlist, cart persistence, quantity, discounts and removal', async ({ page }) => {
  await setup(page);
  await page.goto('/products/cotton-shirt');
  await expect(page.getByRole('heading', { name:'Cotton shirt', exact:true })).toBeVisible();
  await page.getByRole('button', { name:'View product image 2' }).click();
  await page.getByLabel('Quantity').fill('2');
  await page.getByRole('button', { name:'Add to cart', exact:true }).click();
  await expect(page.getByRole('status')).toContainText('Added to your cart');
  await page.getByRole('link', { name:'View cart' }).click();
  await expect(page.getByRole('heading', { name:'Your cart' })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Quantity', { exact:true })).toHaveText('2');
  await page.getByRole('button', { name:'Increase quantity of Cotton shirt' }).click();
  await expect(page.getByLabel('Quantity', { exact:true })).toHaveText('3');
  await page.getByLabel('Discount code').fill('BADCODE');
  await page.getByRole('button', { name:'Apply', exact:true }).click();
  await expect(page.getByText('BADCODE (not applicable)')).toBeVisible();
  await page.getByRole('button', { name:'Remove', exact:true }).first().click();
  await expect(page.getByText('Your cart is empty.')).toBeVisible();
});
test('checkout attaches the signed-in customer and redirects to Shopify', async ({ page }) => {
  const state = await setup(page);
  await page.goto('/account');
  await page.getByLabel('Email', { exact:true }).fill('lan@example.com');
  await page.getByLabel('Password', { exact:true }).fill('password');
  await page.getByRole('button', { name:'Sign in', exact:true }).click();
  await expect(page.getByRole('heading', { name:'Hello, Lan' })).toBeVisible();
  await page.goto('/products/cotton-shirt');
  await page.getByRole('button', { name:'Add to cart', exact:true }).click();
  await page.getByRole('link', { name:'View cart' }).click();
  await page.getByRole('button', { name:'Checkout', exact:true }).click();
  await expect(page).toHaveURL('https://checkout.example/cart');
  const requests = state.requests.filter(item => item.query.includes('cartBuyerIdentityUpdate'));
  expect(requests.at(-1).variables.identity.customerAccessToken).toBe('customer-token');
});
test('mobile search, wishlist, Shopify pages, sanitization and 404', async ({ page }) => {
  const errors=[]; page.on('pageerror', error=>errors.push(error.message));
  await setup(page);
  await page.setViewportSize({width:375,height:812});
  await page.goto('/shop');
  await expect(page.getByRole('heading', {name:'Cotton shirt'})).toBeVisible();
  await page.getByRole('button', {name:'Save to wishlist'}).click();
  await page.getByRole('link', {name:'Wishlist', exact:true}).first().click();
  await expect(page.getByRole('heading', {name:'Your wishlist'})).toBeVisible();
  await expect(page.getByRole('heading', {name:'Cotton shirt'})).toBeVisible();
  await page.getByRole('button', {name:'Search', exact:true}).click();
  await page.getByRole('dialog').getByLabel('Search products').fill('shirt');
  await page.getByRole('link', {name:'View all results'}).click();
  await expect(page).toHaveURL(/q=shirt/);
  await page.goto('/pages/size-guide');
  await expect(page.getByText('Choose your size.')).toBeVisible();
  expect(await page.evaluate(()=>window.bad)).toBeUndefined();
  await expect(page.getByText('Unsafe link')).not.toHaveAttribute('href');
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', {name:'Page not found'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('signup, password recovery and Shopify public forms', async ({ page }) => {
  const state = await setup(page);
  await page.route('https://store.example/contact*', route => route.fulfill({ contentType:'text/html', body:'<h1>Form processed by Shopify</h1>' }));
  await page.goto('/account');
  await page.getByRole('button', {name:'Create an account', exact:true}).click();
  await page.getByLabel('First name', {exact:true}).fill('Lan');
  await page.getByLabel('Last name', {exact:true}).fill('Nguyen');
  await page.getByLabel('Email', {exact:true}).fill('lan@example.com');
  await page.getByLabel('Password', {exact:true}).fill('password');
  await page.getByLabel('Confirm password', {exact:true}).fill('wrong');
  await page.getByRole('button', {name:'Create account', exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Passwords do not match');
  expect(state.requests.some(item => item.query.includes('mutation Register'))).toBe(false);
  await page.getByLabel('Password', {exact:true}).fill('password');
  await page.getByLabel('Confirm password', {exact:true}).fill('password');
  await page.getByRole('button', {name:'Create account', exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Account created');
  await page.getByRole('button', {name:'Forgot password?'}).click();
  await page.getByLabel('Email', {exact:true}).fill('lan@example.com');
  await page.getByRole('button', {name:'Send reset email'}).click();
  await expect(page.getByRole('status')).toContainText('Shopify will send instructions');
  await page.goto('/pages/contact');
  await page.getByLabel('Name', {exact:true}).fill('Lan');
  await page.getByLabel('Email', {exact:true}).fill('lan@example.com');
  await page.getByLabel('Message', {exact:true}).fill('Test message');
  await page.getByRole('button', {name:'Send message'}).click();
  await expect(page.getByRole('heading', {name:'Form processed by Shopify'})).toBeVisible();
});

