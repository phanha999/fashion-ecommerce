import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { searchProducts } from '../../services/shopify/productService';

const PAGE_SIZE = 24;
const LEGACY_CATEGORY_LABELS = {
  men: 'Clothing',
  women: 'Clothing',
  essentials: 'Clothing',
  shoes: 'Boots',
  accessories: 'Accessories',
};

function readFilterParams(searchParams) {
  return searchParams.getAll('filter').flatMap((serialized) => {
    try {
      return [JSON.parse(serialized)];
    } catch {
      return [];
    }
  });
}

function formatMoney(amount, currencyCode = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(amount);
}

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState({ products: [], filters: [], totalCount: 0, pageInfo: {} });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('title-ascending');
  const [status, setStatus] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceDraft, setPriceDraft] = useState(null);
  const loadMoreRequestId = useRef(0);

  const selectedFilters = useMemo(() => readFilterParams(searchParams), [searchParams]);
  const priceFilter = searchResults.filters.find((filter) => filter.type === 'PRICE_RANGE');
  const priceBounds = priceFilter?.values[0]?.input?.price || { min: 0, max: 0 };
  const priceDraftValues = priceDraft || { min: String(priceBounds.min), max: String(priceBounds.max) };
  const legacyCategory = searchParams.get('category');
  const activeFilters = selectedFilters;
  const requestFilters = useMemo(() => activeFilters.map((filter) => filter.input), [activeFilters]);
  const apiSort = sort === 'title-ascending' ? 'TITLE' : sort === 'price-low' || sort === 'price-high' ? 'PRICE' : 'RELEVANCE';
  const reverse = sort === 'price-high';

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      loadMoreRequestId.current += 1;
      setLoadingMore(false);
      setStatus((currentStatus) => currentStatus === 'loading' ? 'loading' : 'updating');
      setError('');
      try {
        const result = await searchProducts({
          query: search.trim(),
          filters: requestFilters,
          first: PAGE_SIZE,
          sortKey: apiSort,
          reverse,
        });
        if (!cancelled) {
          setSearchResults(result);
          setStatus('success');
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
          setStatus('error');
        }
      }
    }, search ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [apiSort, requestFilters, reverse, search]);

  useEffect(() => {
    if (!legacyCategory || selectedFilters.length > 0 || searchResults.filters.length === 0) return;

    const targetLabel = LEGACY_CATEGORY_LABELS[legacyCategory];
    const targetFilter = searchResults.filters.find((filter) => filter.id === 'filter.p.product_type');
    const targetValue = targetFilter?.values.find((value) => value.label.toLowerCase() === targetLabel?.toLowerCase());
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');

    if (targetFilter && targetValue) {
      nextParams.append('filter', JSON.stringify({
        filterId: targetFilter.id,
        valueId: targetValue.id,
        label: targetValue.label,
        input: targetValue.input,
      }));
    }

    setSearchParams(nextParams, { replace: true });
  }, [legacyCategory, searchParams, searchResults.filters, selectedFilters.length, setSearchParams]);

  const updateSelectedFilters = (nextFilters) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('filter');
    nextParams.delete('category');
    nextFilters.forEach((filter) => nextParams.append('filter', JSON.stringify(filter)));
    setSearchParams(nextParams);
  };

  const toggleFilterValue = (filter, value) => {
    const exists = activeFilters.some((selected) => selected.filterId === filter.id && selected.valueId === value.id);
    const nextFilters = exists
      ? activeFilters.filter((selected) => !(selected.filterId === filter.id && selected.valueId === value.id))
      : [...activeFilters, { filterId: filter.id, valueId: value.id, label: value.label, input: value.input }];
    updateSelectedFilters(nextFilters);
  };

  const applyPrice = () => {
    const selection = {
      filterId: priceFilter.id,
      valueId: 'custom-price-range',
      label: `${formatMoney(Number(priceDraftValues.min))} – ${formatMoney(Number(priceDraftValues.max))}`,
      input: { price: { min: Number(priceDraftValues.min), max: Number(priceDraftValues.max) } },
    };
    updateSelectedFilters([...activeFilters.filter((item) => item.filterId !== priceFilter.id), selection]);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearch('');
    setPriceDraft(null);
  };

  const removeFilter = (selection) => {
    updateSelectedFilters(activeFilters.filter((item) => !(item.filterId === selection.filterId && item.valueId === selection.valueId)));
  };

  const loadMore = async () => {
    const cursor = searchResults.pageInfo.endCursor;
    if (!cursor || loadingMore) return;

    const requestId = ++loadMoreRequestId.current;
    setLoadingMore(true);
    try {
      const result = await searchProducts({
        query: search.trim(),
        filters: requestFilters,
        first: PAGE_SIZE,
        after: cursor,
        sortKey: apiSort,
        reverse,
      });
      if (loadMoreRequestId.current !== requestId) return;

      setSearchResults((current) => {
        // Ignore a repeated/stale cursor response and never append a product twice.
        if (current.pageInfo.endCursor !== cursor) return current;
        const existingIds = new Set(current.products.map((product) => product.id));
        const nextProducts = result.products.filter((product) => !existingIds.has(product.id));
        return { ...result, products: [...current.products, ...nextProducts] };
      });
    } catch (requestError) {
      if (loadMoreRequestId.current === requestId) setError(requestError.message);
    } finally {
      if (loadMoreRequestId.current === requestId) setLoadingMore(false);
    }
  };

  const filterSidebar = (
    <aside className="w-full shrink-0 lg:w-[280px]" aria-label="Product filters">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-medium">Filters</h2>
        <button type="button" onClick={clearAllFilters} className="text-xs text-gray-600 underline-offset-4 hover:underline">Clear all</button>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-6">
          {activeFilters.map((filter) => (
            <button key={`${filter.filterId}-${filter.valueId}`} type="button" onClick={() => removeFilter(filter)} className="inline-flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs" aria-label={`Remove ${filter.label} filter`}>
              {filter.label}<span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      {searchResults.filters.map((filter) => (
        <section key={filter.id} role="group" aria-labelledby={`filter-heading-${filter.id}`} className="min-w-0 border-b border-gray-200 py-7">
          <h3 id={`filter-heading-${filter.id}`} className="mb-5 text-base font-medium">{filter.label}</h3>
          {filter.type === 'PRICE_RANGE' ? (
            <div>
              <div className="flex items-center gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Minimum price</span>
                  <input type="number" min={priceBounds.min} max={priceDraftValues.max || priceBounds.max} value={priceDraftValues.min} onChange={(event) => setPriceDraft((draft) => ({ ...(draft || priceDraftValues), min: event.target.value }))} className="w-full rounded border border-gray-300 px-2 py-2 text-sm" />
                </label>
                <span className="text-gray-400">–</span>
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Maximum price</span>
                  <input type="number" min={priceDraftValues.min || priceBounds.min} max={priceBounds.max} value={priceDraftValues.max} onChange={(event) => setPriceDraft((draft) => ({ ...(draft || priceDraftValues), max: event.target.value }))} className="w-full rounded border border-gray-300 px-2 py-2 text-sm" />
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500">Price range: {formatMoney(priceBounds.min)} – {formatMoney(priceBounds.max)}</p>
              <button type="button" onClick={applyPrice} disabled={!priceDraftValues.min || !priceDraftValues.max} className="mt-3 border border-black px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40">Apply price</button>
            </div>
          ) : filter.values.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filter.values.map((value) => {
                const checked = activeFilters.some((selected) => selected.filterId === filter.id && selected.valueId === value.id);
                return (
                  <label key={value.id} className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                    <input type="checkbox" checked={checked} onChange={() => toggleFilterValue(filter, value)} className="h-4 w-4 accent-black" />
                    <span className="flex-1">{value.label}</span>
                    <span className="text-xs text-gray-400">{value.count}</span>
                  </label>
                );
              })}
            </div>
          ) : <p className="text-xs text-gray-400">No available values.</p>}
        </section>
      ))}
    </aside>
  );

  const totalCount = searchResults.totalCount;
  const visibleProducts = searchResults.products;

  return (
    <main className="mx-auto max-w-[1920px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 2xl:px-16">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-gray-500"><span>Home</span><span className="mx-2">/</span><span className="text-gray-900">Search</span></nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
        <div className="hidden lg:block">{filterSidebar}</div>
        {filtersOpen && <div className="lg:hidden">{filterSidebar}</div>}

        <section className="min-w-0" aria-label="Products">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Shop all</h1>
            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-500" aria-live="polite">{totalCount.toLocaleString()} items</p>
              <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                <span className="sr-only">Sort products</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="max-w-40 bg-transparent outline-none">
                  <option value="title-ascending">Alphabetically, A-Z</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mb-6 flex gap-3 lg:hidden">
            <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="border border-gray-300 px-4 py-2 text-sm">{filtersOpen ? 'Hide filters' : `Filters${activeFilters.length ? ` (${activeFilters.length})` : ''}`}</button>
            <label className="min-w-0 flex-1 border-b border-gray-300 py-2">
              <span className="sr-only">Search products</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>
          <label className="mb-6 hidden border-b border-gray-300 py-2 lg:block">
            <span className="sr-only">Search products</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none" />
          </label>

          {status === 'loading' && <p className="py-20 text-center text-sm text-gray-500">Loading products and Shopify filters…</p>}
          {status === 'updating' && <p className="mb-4 text-xs text-gray-400" aria-live="polite">Updating results…</p>}
          {status === 'error' && <div className="py-20 text-center" role="alert"><h2 className="text-lg font-medium">Could not load Shopify results</h2><p className="mt-2 text-sm text-gray-500">{error}</p></div>}
          {status !== 'loading' && status !== 'error' && visibleProducts.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-[30px] xl:grid-cols-4 2xl:grid-cols-5">
                {visibleProducts.map((product) => <ProductCard key={product.id} product={product} imageRatio="natural" />)}
              </div>
              {searchResults.pageInfo.hasNextPage && <div className="mt-12 flex justify-center"><button type="button" onClick={loadMore} disabled={loadingMore} className="border border-black px-6 py-3 text-xs uppercase tracking-wider disabled:opacity-50">{loadingMore ? 'Loading…' : 'Load more'}</button></div>}
            </>
          )}
          {status !== 'loading' && status !== 'error' && visibleProducts.length === 0 && (
            <div className="py-20 text-center"><h2 className="text-lg font-medium">No products found</h2><p className="mt-2 text-sm text-gray-500">Try changing your search or filters.</p><button type="button" onClick={clearAllFilters} className="mt-5 border border-black px-5 py-3 text-xs uppercase tracking-wider hover:bg-black hover:text-white">Clear filters</button></div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Shop;



