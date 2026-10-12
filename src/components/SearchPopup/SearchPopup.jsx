import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { quickSearchProducts } from '../../services/shopify/productService';

function SearchPopup({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const frameId = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => setShouldRender(false), 220);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    inputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    let cancelled = false;

    if (!isOpen || normalizedQuery.length < 2) {
      setProducts([]);
      setError('');
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError('');
    const timeoutId = window.setTimeout(() => {
      quickSearchProducts(normalizedQuery)
        .then((results) => {
          if (!cancelled) setProducts(results);
        })
        .catch((searchError) => {
          if (!cancelled) setError(searchError.message || 'Search is temporarily unavailable.');
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, query]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-[10vh] transition-opacity duration-200 ease-out motion-reduce:transition-none ${isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-popup-title"
        className={`w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-2xl transition-all duration-200 ease-out motion-reduce:transition-none ${isVisible ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-3 scale-[0.98] opacity-0'}`}
      >
        <div className="flex items-center gap-3 border-b border-gray-200 px-5">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" className="shrink-0 text-gray-500">
            <circle cx="8.5" cy="8.5" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="m13 13 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <h2 id="search-popup-title" className="sr-only">Search products</h2>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="h-16 min-w-0 flex-1 text-base text-gray-900 outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5">
          {query.trim().length < 2 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Type at least 2 characters to search products.
            </p>
          ) : isLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">Searching Shopify products…</p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-700" role="alert">{error}</p>
          ) : products.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No matching products found.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/products/${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3 hover:bg-gray-50"
                  >
                    <div className="h-16 w-14 shrink-0 overflow-hidden bg-gray-100">
                      {product.image && (
                        <img src={product.image} alt={product.imageAlt} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                      {product.title}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: product.currencyCode,
                      }).format(Number(product.price))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default SearchPopup;
