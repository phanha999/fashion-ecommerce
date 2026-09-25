import { useEffect, useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { getNewArrivalProducts } from '../../services/shopify/productService';

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const newArrivals = await getNewArrivalProducts();
        if (!cancelled) {
          setProducts(newArrivals);
          setStatus('success');
        }
      } catch (error) {
        console.error('Could not load new arrivals:', error);
        if (!cancelled) setStatus('error');
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="pb-20">
      <div className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gray-500">
              Latest
            </p>

            <h2 className="text-3xl font-semibold md:text-4xl">
              New Arrivals
            </h2>
          </div>

          <a
            href="/shop"
            className="hidden text-sm font-medium underline underline-offset-4 md:block"
          >
            View All
          </a>
        </div>

        {status === 'loading' && (
          <p className="py-10 text-center text-sm text-gray-500">Loading new arrivals…</p>
        )}
        {status === 'error' && (
          <p className="py-10 text-center text-sm text-gray-500" role="status">
            New arrivals are temporarily unavailable.
          </p>
        )}
        {status === 'success' && products.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">
            No new arrivals are available right now.
          </p>
        )}
        {status === 'success' && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:gap-[30px] md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default NewArrivals;