import { useEffect, useState } from 'react';
import { getBrands } from '../../services/shopify/contentService';

function TopBrands() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getBrands()
      .then((shopifyCategories) => {
        if (!cancelled) setBrands(shopifyCategories);
      })
      .catch((error) => {
        console.error('Could not load Shopify Brands:', error);
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
    <section className="pb-20">
      <div className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">

        <div className="mb-10 text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            Our Selection
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            Top Brands
          </h2>
        </div>

        {isLoading ? (
          <div
            aria-label="Loading categories"
            className="grid grid-cols-2 gap-4 sm:gap-[30px] md:grid-cols-4"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="aspect-[3/4] animate-pulse bg-gray-100"
              />
            ))}
          </div>
        ) : loadError ? (
          <p
            className="mx-auto max-w-3xl rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            Shopify brands chưa tải được. {loadError}
          </p>
        ) : brands.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Shopify chưa trả về Category entries có ảnh.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-[30px] md:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="group relative aspect-square overflow-hidden"
              >
                <img
                  src={brand.backgroundImage}
                  alt={brand.altBackgroundImage}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />

                <div className="relative flex h-full items-center justify-center p-8">
                  <img
                    src={brand.image}
                    alt={brand.imageAlt}
                    className="max-h-14 max-w-[150px] object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default TopBrands;
