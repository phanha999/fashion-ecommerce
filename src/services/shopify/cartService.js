import { shopifyFetch } from './client';

const lineFields = `id quantity cost { totalAmount { amount currencyCode } }
  merchandise { ... on ProductVariant {
    id title availableForSale image { url altText }
    product { id title featuredImage { url altText } }
  } }`;
const fields = `fragment CartFields on Cart {
  id checkoutUrl totalQuantity
  discountCodes { code applicable }
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first: 250) { nodes { ${lineFields} } pageInfo { hasNextPage endCursor } }
}`;
async function completeLines(cart) {
  if (!cart?.lines) return cart;
  while (cart.lines.pageInfo.hasNextPage) {
    const after = cart.lines.pageInfo.endCursor;
    const data = await shopifyFetch(`query MoreCartLines($id: ID!, $after: String!) {
      cart(id: $id) { lines(first: 250, after: $after) { nodes { ${lineFields} } pageInfo { hasNextPage endCursor } } }
    }`, { id: cart.id, after });
    if (!data.cart) throw new Error('This cart is no longer available.');
    const page = data.cart.lines;
    if (page.pageInfo.hasNextPage && (!page.pageInfo.endCursor || page.pageInfo.endCursor === after)) throw new Error('Could not load all cart items.');
    cart = { ...cart, lines: { ...page, nodes: [...cart.lines.nodes, ...page.nodes] } };
  }
  return cart;
}
async function result(payload) {
  if (!payload) throw new Error('Shopify returned an invalid cart response.');
  if (payload.userErrors?.length) throw new Error(payload.userErrors.map(error => error.message).join(' '));
  if (!payload.cart) throw new Error('This cart is no longer available. Please refresh it.');
  return completeLines({ ...payload.cart, warnings: payload.warnings || [] });
}
export function validateQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 250) throw new Error('Quantity must be between 1 and 250.');
}
export async function getCart(id) {
  const data = await shopifyFetch(`query Cart($id: ID!) { cart(id: $id) { ...CartFields } } ${fields}`, { id });
  return completeLines(data.cart);
}
export async function addCartLine(cartId, merchandiseId, quantity, buyerIdentity) {
  validateQuantity(quantity);
  if (!merchandiseId?.startsWith('gid://shopify/ProductVariant/')) throw new Error('Choose a product variant first.');
  const lines = [{ merchandiseId, quantity }];
  if (!cartId) {
    const data = await shopifyFetch(`mutation CreateCart($input: CartInput!) {
      cartCreate(input: $input) { cart { ...CartFields } userErrors { field message } warnings { message } }
    } ${fields}`, { input: { lines, ...(buyerIdentity ? { buyerIdentity } : {}) } });
    return result(data.cartCreate);
  }
  const data = await shopifyFetch(`mutation AddCartLine($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } warnings { message } }
  } ${fields}`, { cartId, lines });
  return result(data.cartLinesAdd);
}
export async function updateCartLine(cartId, id, quantity) {
  validateQuantity(quantity);
  const data = await shopifyFetch(`mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } warnings { message } }
  } ${fields}`, { cartId, lines: [{ id, quantity }] });
  return result(data.cartLinesUpdate);
}
export async function removeCartLine(cartId, id) {
  const data = await shopifyFetch(`mutation RemoveCartLine($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { field message } warnings { message } }
  } ${fields}`, { cartId, lineIds: [id] });
  return result(data.cartLinesRemove);
}
export async function updateCartBuyer(cartId, buyerIdentity) {
  const data = await shopifyFetch(`mutation Buyer($cartId: ID!, $identity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $identity) { cart { ...CartFields } userErrors { field message } warnings { message } }
  } ${fields}`, { cartId, identity: buyerIdentity });
  return result(data.cartBuyerIdentityUpdate);
}
export async function updateCartDiscounts(cartId, discountCodes) {
  const data = await shopifyFetch(`mutation Discounts($cartId: ID!, $codes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $codes) { cart { ...CartFields } userErrors { field message } warnings { message } }
  } ${fields}`, { cartId, codes: discountCodes });
  return result(data.cartDiscountCodesUpdate);
}
