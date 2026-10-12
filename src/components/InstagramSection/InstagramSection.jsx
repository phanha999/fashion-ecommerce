import { useEffect, useState } from 'react';
import { getInstagrams } from '../../services/shopify/contentService';

function InstagramSection() {
  const [instagrams, setInstagrams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getInstagrams()
      .then((shopifyCategories) => {
        if (!cancelled) setInstagrams(shopifyCategories);
      })
      .catch((error) => {
        console.error('Could not load Shopify instagrams:', error);
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
    <section>
        {isLoading ? (
          <div
            aria-label="Loading categories"
            className="grid grid-cols-2 gap-4 sm:gap-[30px] md:grid-cols-4"
          >
            {Array.from({ length: 6 }, (_, index) => (
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
            Shopify instagrams could not be loaded. {loadError}
          </p>
        ) : instagrams.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Shopify returned no brand entries with images.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {instagrams.map((instagram) => (
              <a
                key={instagram.id}
                href={instagram.link}
                className="group relative aspect-square overflow-hidden"
              >
                <img
                  src={instagram.image}
                  alt="Velora Instagram"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/30">
                  <span className="text-2xl text-white opacity-0 transition group-hover:opacity-100">
                    ♡
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
    </section>
  );
}

export default InstagramSection;
