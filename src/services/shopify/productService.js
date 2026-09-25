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

const ALPHABETICAL_PAGE_SIZE = 250;
const alphabeticalCache = new Map();

async function loadAlphabeticalResults(query, filters) {
  let after = null;
  let totalCount;
  let availableFilters;
  const productsById = new Map();

  do {
    const data = await shopifyFetch(SHOP_SEARCH_QUERY, {
      query,
      first: ALPHABETICAL_PAGE_SIZE,
      after,
      filters,
      sortKey: 'RELEVANCE',
      reverse: false,
    });
    const result = data.search;
    totalCount = result.totalCount;
    availableFilters = result.productFilters.map(mapFilter);
    result.nodes.map(mapProduct).forEach((product) => productsById.set(product.id, product));
    after = result.pageInfo.hasNextPage ? result.pageInfo.endCursor : null;
  } while (after);

  const products = [...productsById.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
  );

  return { products, filters: availableFilters, totalCount };
}

export async function searchProducts({
  query = '',
  filters = [],
  first = 24,
  after = null,
  sortKey = 'RELEVANCE',
  reverse = false,
} = {}) {
  if (sortKey === 'TITLE') {
    const cacheKey = JSON.stringify([query, filters]);
    let resultPromise = alphabeticalCache.get(cacheKey);

    if (!resultPromise) {
      resultPromise = loadAlphabeticalResults(query, filters);
      alphabeticalCache.clear();
      alphabeticalCache.set(cacheKey, resultPromise);
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
        endCursor: nextOffset < result.products.length ? `title-ascending:${nextOffset}` : null,
      },
    };
  }

  const data = await shopifyFetch(SHOP_SEARCH_QUERY, {
    query,
    first,
    after,
    filters,
    sortKey,
    reverse,
  });
  const result = data.search;

  return {
    products: result.nodes.map(mapProduct),
    filters: result.productFilters.map(mapFilter),
    totalCount: result.totalCount,
    pageInfo: result.pageInfo,
  };
}
const NEW_ARRIVALS_QUERY = `
  query NewArrivals($first: Int!, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
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
  const data = await shopifyFetch(NEW_ARRIVALS_QUERY, {
    first,
    sortKey: 'CREATED_AT',
    reverse: true,
  });

  return data.products.nodes.map((product) => ({
    ...mapProduct(product),
    isNew: true,
  }));
}