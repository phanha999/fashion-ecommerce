import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { products } from '../../components/products.data';

const categories = [
  { value: 'all', label: 'All products' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'accessories', label: 'Bags & accessories' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'new-arrivals', label: 'New arrivals' },
];

const categoryAliases = {
  men: 'clothing',
  women: 'clothing',
  essentials: 'clothing',
  new: 'new-arrivals',
};

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const requestedCategory = searchParams.get('category') || 'all';
  const activeCategory = categoryAliases[requestedCategory] || requestedCategory;

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' ||
        (activeCategory === 'new-arrivals'
          ? product.isNew
          : product.category === activeCategory);
      const searchableText = `${product.name} ${product.description}`.toLowerCase();

      return matchesCategory && searchableText.includes(normalizedSearch);
    });

    if (sort === 'price-low') return filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') return filtered.sort((a, b) => b.price - a.price);
    if (sort === 'name') return filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [activeCategory, search, sort]);

  const chooseCategory = (category) => {
    if (category === 'all') {
      setSearchParams({});
      return;
    }
    setSearchParams({ category });
  };

  const selectedCategory = categories.find((category) => category.value === activeCategory);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-gray-500">
        <span>Home</span><span className="mx-2">/</span><span className="text-gray-900">Shop</span>
      </nav>

      <header className="mb-8 border-b border-gray-200 pb-7">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">The collection</p>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Shop all</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
          Thoughtful everyday pieces, designed to be worn on repeat.
        </p>
      </header>

      <div className="mb-7 flex flex-col gap-5">
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Product categories">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              aria-pressed={activeCategory === category.value}
              onClick={() => chooseCategory(category.value)}
              className={`shrink-0 border px-4 py-2 text-xs transition ${
                activeCategory === category.value
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 text-gray-700 hover:border-black'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex min-w-0 items-center gap-2 border-b border-gray-300 pb-2 sm:w-64">
            <span className="sr-only">Search products</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </label>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="text-xs text-gray-500" aria-live="polite">
              {visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'}
              {selectedCategory && activeCategory !== 'all' ? ` · ${selectedCategory.label}` : ''}
            </p>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <span>Sort by</span>
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="max-w-40 bg-transparent py-2 text-xs text-gray-900 outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-[30px] lg:grid-cols-4">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <section className="py-20 text-center">
          <h2 className="text-lg font-medium">No products found</h2>
          <p className="mt-2 text-sm text-gray-500">
            {activeCategory === 'shoes'
              ? 'There are no shoes in this sample catalog yet.'
              : 'Try another search or category.'}
          </p>
          <button
            type="button"
            onClick={() => { setSearch(''); chooseCategory('all'); }}
            className="mt-5 border border-black px-5 py-3 text-xs uppercase tracking-wider transition hover:bg-black hover:text-white"
          >
            View all products
          </button>
        </section>
      )}
    </main>
  );
}

export default Shop;
