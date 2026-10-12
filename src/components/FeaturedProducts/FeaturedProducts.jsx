import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BannerLink from '../BannerLink';
import { getNewArrivalProducts } from '../../services/shopify/productService';
import { getBanners } from '../../services/shopify/contentService';

function ProductItem({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex gap-4 sm:gap-[30px]"
    >

      <div className="w-32 sm:w-44 md:w-36 lg:w-44 h-32 sm:h-44 md:h-36 lg:h-44 shrink-0 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
            {product.description}
          </p>
        )}

        <p className="mt-2 text-sm text-gray-500">
          ${product.price}
        </p>
      </div>
    </Link>
  );
}

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');

  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const newArrivals = await getNewArrivalProducts({ first: 9 });
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

  useEffect(() => {
    let cancelled = false;

    getBanners({ handle: 'new-season' })
      .then((shopifyBanners) => {
        if (!cancelled) setBanners(shopifyBanners);
      })
      .catch((error) => {
        console.error('Could not load Shopify banners:', error);
        if (!cancelled) setLoadError(error.message || 'Unknown Shopify error.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16 pb-20">

      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Featured Collection
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Discover Our Products
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-[30px] lg:grid-cols-4">

        {isLoading ? (
          <div aria-label="Loading banners" className="h-[420px] animate-pulse bg-gray-100 sm:h-[500px] lg:h-[600px]"/>
        ) : loadError ? (
          <p className="mx-auto max-w-3xl rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            Shopify banners could not be loaded. {loadError}
          </p>
        ) : banners.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Shopify returned no banner entries with images.
          </p>
        ) : (
          <div>
            {banners.map((banner) => (
              <div key={banner.id} className="relative min-h-[420px] overflow-hidden md:min-h-[520px] lg:col-span-1 lg:min-h-[600px]">
                <img
                  src={banner.image}
                  alt={banner.imageAlt || ''}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/25" />

                <div className="absolute bottom-0 left-0 p-8 text-white">

                    {banner.subtitle && (
                      <p className="text-sm uppercase tracking-[0.2em]">
                        {banner.subtitle}
                      </p>
                    )}

                    <h2 className="mt-2 text-3xl font-bold">
                      {banner.title}
                    </h2>

                    <BannerLink
                      to={banner.link}
                      className="mt-5 inline-block border border-white px-6 py-3 text-sm transition hover:bg-white hover:text-black"
                    >
                      {banner.buttonLabel}
                    </BannerLink>

                </div>
              </div>
            ))}
          </div>
        )}

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
          <div className="grid grid-cols-1 gap-4 sm:gap-[30px] md:grid-cols-3 lg:col-span-3">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
