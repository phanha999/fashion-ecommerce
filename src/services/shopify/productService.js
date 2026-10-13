import { shopifyFetch } from './client';
import { getLocalizationCacheKey } from '../../utils/localization';
const SHOP_SEARCH_QUERY = `
  query ShopSearch(
    $query: String!
    $first: Int!
    $after: String
    $filters: [ProductFilter!]
    $sortKey: SearchSortKeys!
    $reverse: Boolean!
  ) {
    search(
      query: $query
      first: $first
      after: $after
      types: [PRODUCT]
      productFilters: $filters
      sortKey: $sortKey
      reverse: $reverse
    ) {
      totalCount
      pageInfo { hasNextPage endCursor }
      productFilters { id
        label
        type
        values { id label count input }
      }
      nodes {
        ... on Product {
          id handle
          availableForSale
          title
          description
          vendor
          tags
          featuredImage { url altText width height }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

function mapProduct(product) {
  const tags = product.tags.map((tag) => tag.toLowerCase());
  const price = product.priceRange.minVariantPrice;

  return {
    id: product.id,
    handle: product.handle,
    availableForSale: product.availableForSale,
    name: product.title,
    description: product.description,
    brand: product.vendor,
    color: tags.find((tag) => tag.startsWith('color:'))?.slice(6) || '',
    theme: tags.find((tag) => tag.startsWith('theme:'))?.slice(6) || '',
    price: Number(price.amount),
    currencyCode: price.currencyCode,
    image: product.featuredImage?.url || '',
    imageAlt: product.featuredImage?.altText || product.title,
    imageWidth: product.featuredImage?.width || null,
    imageHeight: product.featuredImage?.height || null,
    isNew: tags.includes('new-arrival'),
  };
}

function mapFilter(filter) {
  return {
    ...filter,
    values: filter.values.map((value) => ({
      ...value,
      input: typeof value.input === 'string' ? JSON.parse(value.input) : value.input,
    })),
  };
}

const CATALOG_QUERY = `
  query ShopCatalog($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: ID) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id handle title description vendor tags availableForSale
        featuredImage { url altText width height }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `
  query CollectionProducts($handle: String!, $first: Int!, $after: String, $filters: [ProductFilter!]) {
    collection(handle: $handle) {
      handle
      products(first: $first, after: $after, filters: $filters) {
        pageInfo { hasNextPage endCursor }
        filters { id label type values { id label count input } }
        nodes {
          id availableForSale title description vendor tags
          featuredImage { url altText width height }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;
const RESULT_PAGE_SIZE = 250;
const resultsCache = new Map();

const snapshotCache = new Map();
const SNAPSHOT_TTL = 30000;
async function loadSnapshot(query, otherFilters, sortKey, reverse, collection, useCollection, useCatalog) {
  let after = null;
  let availableFilters = [];
  const productsById = new Map();
  const seenCursors = new Set();

  // Search owns Shopify's configured facets, but an unfiltered catalog must
  // come from products: the search index can omit catalog products.
  const searchPage = (cursor, first = RESULT_PAGE_SIZE) => shopifyFetch(SHOP_SEARCH_QUERY, {
    query, first, after: cursor, filters: otherFilters,
    sortKey: sortKey === 'PRICE' ? 'PRICE' : 'RELEVANCE', reverse,
  });
  if (useCollection) {
    const data = await shopifyFetch(COLLECTION_PRODUCTS_QUERY, {
      handle: collection, first: 1, after: null, filters: otherFilters,
    });
    if (!data.collection) throw new Error(`Shopify collection "${collection}" was not found or is not available to the Storefront API.`);
    availableFilters = data.collection.products.filters.map(mapFilter);
  } else if (useCatalog) {
    const data = await searchPage(null, 1);
    availableFilters = data.search.productFilters.map(mapFilter);
  }

  do {
    const data = useCollection
      ? await shopifyFetch(COLLECTION_PRODUCTS_QUERY, { handle: collection, first: RESULT_PAGE_SIZE, after, filters: otherFilters })
      : useCatalog
        ? await shopifyFetch(CATALOG_QUERY, { first: RESULT_PAGE_SIZE, after })
        : await searchPage(after);
    if (useCollection && !data.collection) throw new Error(`Shopify collection "${collection}" was not found or is not available to the Storefront API.`);
    const result = useCollection ? data.collection.products : useCatalog ? data.products : data.search;
    if (!useCollection && !useCatalog && after === null) availableFilters = result.productFilters.map(mapFilter);
    result.nodes.map(mapProduct).forEach((product) => productsById.set(product.id, product));
    if (result.pageInfo.hasNextPage) {
      const cursor = result.pageInfo.endCursor;
      if (!cursor || seenCursors.has(cursor)) throw new Error('Shopify returned an invalid product page. Please try again.');
      seenCursors.add(cursor);
      after = cursor;
    } else {
      after = null;
    }
  } while (after);

  return { products: [...productsById.values()], filters: availableFilters };
}
async function loadResults(query, filters, sortKey, reverse, collection = '') {
  const availabilitySelections = new Set(filters
    .filter((filter) => typeof filter.available === 'boolean')
    .map((filter) => filter.available));
  const brandSelections = new Set(filters
    .filter((filter) => typeof filter.productVendor === 'string')
    .map((filter) => filter.productVendor));
  const otherFilters = filters.flatMap((filter) => {
    const remaining = { ...filter };
    delete remaining.available;
    delete remaining.productVendor;
    return Object.keys(remaining).length ? [remaining] : [];
  });
  const useCollection = Boolean(collection);
  const useCatalog = !useCollection && !query.trim() && otherFilters.length === 0;
  const snapshotKey = JSON.stringify([getLocalizationCacheKey(), collection, query, otherFilters, useCatalog || useCollection ? '' : sortKey, useCatalog || useCollection ? false : reverse]);
  let cached = snapshotCache.get(snapshotKey);
  if (!cached || cached.expiresAt <= Date.now()) {
    const promise = loadSnapshot(query, otherFilters, sortKey, reverse, collection, useCollection, useCatalog);
    cached = { promise, expiresAt: Date.now() + SNAPSHOT_TTL };
    if (snapshotCache.size >= 10) snapshotCache.delete(snapshotCache.keys().next().value);
    snapshotCache.set(snapshotKey, cached);
    promise.catch(() => { if (snapshotCache.get(snapshotKey)?.promise === promise) snapshotCache.delete(snapshotKey); });
  }
  const snapshot = await cached.promise;
  let availableFilters = snapshot.filters;
  const matchingProducts = snapshot.products.filter((product) => {
    if (!useCollection || !query.trim()) return true;
    const term = query.trim().toLocaleLowerCase();
    return [product.name, product.description, product.brand].some((value) => value.toLocaleLowerCase().includes(term));
  });
  const matchesBrand = (product) => brandSelections.size === 0 || brandSelections.has(product.brand);
  const matchesAvailability = (product) => availabilitySelections.size !== 1
    || availabilitySelections.has(product.availableForSale);
  const brandCounts = new Map();
  matchingProducts.filter(matchesAvailability).forEach((product) => {
    if (product.brand) brandCounts.set(product.brand, (brandCounts.get(product.brand) || 0) + 1);
  });
  // Keep Shopify's configured Brand heading, but build values from actual
  // vendors. This removes stale vendors and includes newly added vendors.
  availableFilters = availableFilters.map((filter) => filter.id === 'filter.p.vendor'
    ? { ...filter, values: [...brandCounts].sort(([a], [b]) => a.localeCompare(b)).map(([brand, count]) => ({
      id: filter.values.find((value) => value.input.productVendor === brand)?.id || `${filter.id}:${brand}`,
      label: brand,
      count,
      input: { productVendor: brand },
    })) }
    : filter);
  // Count products before applying this facet, so both options remain useful.
  // A product with any purchasable variant belongs only to In stock.
  availableFilters = availableFilters.map((filter) => filter.id === 'filter.v.availability'
    ? { ...filter, values: filter.values.map((value) => ({
      ...value,
      count: matchingProducts.filter((product) => matchesBrand(product)
        && product.availableForSale === value.input.available).length,
    })) }
    : filter);
  const products = matchingProducts.filter((product) => matchesBrand(product) && matchesAvailability(product));
  if (sortKey === 'TITLE') {
    products.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));
    if (reverse) products.reverse();
  } else if (sortKey === 'PRICE' && (useCatalog || useCollection)) {
    products.sort((a, b) => reverse ? b.price - a.price : a.price - b.price);
  }
  // Count actual unique products, not search.totalCount, which can disagree
  // with the complete returned result set.
  return { products, filters: availableFilters, totalCount: products.length };
}

export async function searchProducts({
  query = '', filters = [], first = 24, after = null,
  sortKey = 'RELEVANCE', reverse = false, collection = '',
} = {}) {
  const cacheKey = JSON.stringify([getLocalizationCacheKey(), collection, query, filters, sortKey, reverse]);
  let resultPromise = resultsCache.get(cacheKey);
  // Refresh first-page requests; load-more uses the same product snapshot.
  if (!after || !resultPromise) {
    resultPromise = loadResults(query, filters, sortKey, reverse, collection);
    resultsCache.clear();
    resultsCache.set(cacheKey, resultPromise);
    resultPromise.catch(() => {
      if (resultsCache.get(cacheKey) === resultPromise) resultsCache.delete(cacheKey);
    });
  }
  const result = await resultPromise;
  const offset = after ? Number(after.split(':').at(-1)) || 0 : 0;
  const nextOffset = offset + first;
  return {
    products: result.products.slice(offset, nextOffset),
    filters: result.filters,
    totalCount: result.totalCount,
    pageInfo: {
      hasNextPage: nextOffset < result.products.length,
      endCursor: nextOffset < result.products.length ? `products:${nextOffset}` : null,
    },
  };
}
const HOME_PRODUCTS_QUERY = `
  query HomeProducts($first: Int!, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        id handle availableForSale
        title
        description
        vendor
        tags
        featuredImage { url altText width height }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`;

export async function getNewArrivalProducts({ first = 24 } = {}) {
  const data = await shopifyFetch(HOME_PRODUCTS_QUERY, {
    first,
    sortKey: 'CREATED_AT',
    reverse: true,
  });

  return data.products.nodes.map((product) => ({
    ...mapProduct(product),
    isNew: true,
  }));
}

const BEST_SELLERS_COLLECTION_QUERY = `
  query BestSellersCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first, sortKey: BEST_SELLING) {
        nodes {
          id handle availableForSale
          title
          description
          vendor
          tags
          featuredImage { url altText width height }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

export async function getBestSellerProducts({ collectionHandle, first = 5 } = {}) {
  if (!collectionHandle) throw new Error('A Shopify collection handle is required to load best sellers.');

  const data = await shopifyFetch(BEST_SELLERS_COLLECTION_QUERY, {
    handle: collectionHandle,
    first,
  });

  if (!data.collection) {
    throw new Error(`Shopify collection "${collectionHandle}" was not found or is not available to the Storefront API.`);
  }

  return data.collection.products.nodes.map(mapProduct);
}



const QUICK_PRODUCT_SEARCH_QUERY = `
  query QuickProductSearch($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: [PRODUCT]) {
      nodes {
        ... on Product {
          id handle
          title
          featuredImage { url altText }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

export async function quickSearchProducts(query, first = 6) {
  const normalizedQuery = query?.trim();
  if (!normalizedQuery) return [];

  const data = await shopifyFetch(QUICK_PRODUCT_SEARCH_QUERY, {
    query: normalizedQuery,
    first,
  });

  return (data.search?.nodes || []).map((product) => ({
    id: product.id,
    handle: product.handle,
    title: product.title,
    image: product.featuredImage?.url || '',
    imageAlt: product.featuredImage?.altText || product.title,
    price: product.priceRange.minVariantPrice.amount,
    currencyCode: product.priceRange.minVariantPrice.currencyCode,
  }));
}

export async function getProductDetail(id) {
  const byId = id.startsWith('gid://shopify/Product/');
  const lookup = byId ? 'node(id: $id) { ... on Product {' : 'product(handle: $handle) {';
  const close = byId ? '} }' : '}';
  let after = null;
  let product;
  const variants = [];
  do {
    const data = await shopifyFetch(`query ProductDetail(${byId ? '$id: ID!' : '$handle: String!'}, $after: String) {
      ${lookup}
        id handle title description descriptionHtml vendor seo { title description }
        images(first: 100) { nodes { url altText } }
        reviews: metafield(namespace: "custom", key: "reviews") { value }
        featuredImage { url altText }
        variants(first: 250, after: $after) {
          nodes { id title availableForSale price { amount currencyCode } image { url altText } selectedOptions { name value } }
          pageInfo { hasNextPage endCursor }
        }
      ${close}
    }`, { ...(byId ? { id } : { handle: id }), after });
    const found = data.node || data.product;
    if (!found) throw new Error('This product was not found.');
    product = found;
    variants.push(...product.variants.nodes);
    const page = product.variants.pageInfo;
    if (page.hasNextPage && (!page.endCursor || page.endCursor === after)) throw new Error('Could not load product variants.');
    after = page.hasNextPage ? page.endCursor : null;
  } while (after);
  return { ...product, variants };
}
