import { shopifyFetch } from './client';

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
      productFilters {
        id
        label
        type
        values { id label count input }
      }
      nodes {
        ... on Product {
          id
          availableForSale
          title
          description
          productType
          vendor
          tags
          featuredImage { url altText width height }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

function normalizeCategory(productType, tags) {
  const taggedCategory = tags.find((tag) => tag.startsWith('category:'))?.slice(9);
  if (taggedCategory) return taggedCategory;

  const type = productType.trim().toLowerCase();
  if (['accessory', 'accessories', 'bag', 'bags'].includes(type)) return 'accessories';
  if (['shoe', 'shoes', 'boot', 'boots', 'sneaker', 'sneakers'].includes(type)) return 'shoes';
  if (['clothing', 'clothes', 'dress', 'dresses', 'sweater', 'sweaters'].includes(type)) return 'clothing';
  return type;
}

function mapProduct(product) {
  const tags = product.tags.map((tag) => tag.toLowerCase());
  const price = product.priceRange.minVariantPrice;

  return {
    id: product.id,
    availableForSale: product.availableForSale,
    name: product.title,
    description: product.description,
    category: normalizeCategory(product.productType, tags),
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
        id title description productType vendor tags availableForSale
        featuredImage { url altText width height }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`;

const RESULT_PAGE_SIZE = 250;
const resultsCache = new Map();

async function loadResults(query, filters, sortKey, reverse) {
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
  const useCatalog = !query.trim() && otherFilters.length === 0;
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
  if (useCatalog) {
    const data = await searchPage(null, 1);
    availableFilters = data.search.productFilters.map(mapFilter);
  }

  do {
    const data = useCatalog
      ? await shopifyFetch(CATALOG_QUERY, { first: RESULT_PAGE_SIZE, after })
      : await searchPage(after);
    const result = useCatalog ? data.products : data.search;
    if (!useCatalog && after === null) availableFilters = result.productFilters.map(mapFilter);
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

  const matchingProducts = [...productsById.values()];
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
  } else if (sortKey === 'PRICE' && useCatalog) {
    products.sort((a, b) => reverse ? b.price - a.price : a.price - b.price);
  }
  // Count actual unique products, not search.totalCount, which can disagree
  // with the complete returned result set.
  return { products, filters: availableFilters, totalCount: products.length };
}

export async function searchProducts({
  query = '', filters = [], first = 24, after = null,
  sortKey = 'RELEVANCE', reverse = false,
} = {}) {
  const cacheKey = JSON.stringify([query, filters, sortKey, reverse]);
  let resultPromise = resultsCache.get(cacheKey);
  // Refresh first-page requests; load-more uses the same product snapshot.
  if (!after || !resultPromise) {
    resultPromise = loadResults(query, filters, sortKey, reverse);
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
        id
        title
        description
        productType
        vendor
        tags
        featuredImage { url altText width height }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`;

export async function getNewArrivalProducts({ first = 8 } = {}) {
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

export async function getBestSellerProducts({ first = 5 } = {}) {
  const data = await shopifyFetch(HOME_PRODUCTS_QUERY, {
    first,
    sortKey: 'BEST_SELLING',
    reverse: false,
  });

  return data.products.nodes.map(mapProduct);
}
