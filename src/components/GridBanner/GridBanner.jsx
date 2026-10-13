import StoreImage from '../StoreImage';
import { useEffect, useState } from 'react';
import BannerLink from '../BannerLink';
import { getCollection } from '../../services/shopify/contentService';
import './GridBanner.scss';

function GridBanner() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getCollection()
      .then((shopifyCollections) => {
        if (!cancelled) setCollections(shopifyCollections);
      })
      .catch((error) => {
        console.error('Could not load Shopify collections:', error);
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
    <section className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Explore Velora
        </p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Shop By Collection
        </h2>
      </div>

      {isLoading ? (
        <div
          aria-label="Loading collections"
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
          Shopify collections could not be loaded. {loadError}
        </p>
      ) : collections.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          Shopify returned no collection entries with images.
        </p>
      ) : (
        <div className="grid-banner-grid mx-auto mb-12 md:mb-14 xl:mb-16">
          {collections.map((collection, index) => {
            const layoutClass =
              index === 0 || index === 3
                ? 'grid-banner-featured'
                : 'grid-banner-small'; 

            return (
              <BannerLink
                key={collection.id}
                to={collection.link}
                className={`group relative block overflow-hidden ${layoutClass}`}
              >
                <StoreImage
                  src={collection.image}
                  alt={collection.imageAlt || collection.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 transition duration-300 group-hover:bg-black/40" />

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold">
                    {collection.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/90">
                    {collection.description}
                  </p>

                  <span className="mt-4 inline-block text-sm font-medium underline underline-offset-4">
                    Shop now
                  </span>
                </div>
              </BannerLink>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default GridBanner;
