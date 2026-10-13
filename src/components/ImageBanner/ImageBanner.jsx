import StoreImage from '../StoreImage';
import { useEffect, useState } from 'react';
import BannerLink from '../BannerLink';
import { getBanners } from '../../services/shopify/contentService';

function ImageBanner() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getBanners({ handle: 'the-new-collection' })
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
    <section className="mx-auto max-w-[1920px] px-4 py-20 md:px-8 2xl:px-16">
      {isLoading ? (
        <div
          aria-label="Loading banners"
          className="h-[420px] animate-pulse bg-gray-100 sm:h-[500px] lg:h-[600px]"
        />
      ) : loadError ? (
        <p
          className="mx-auto max-w-3xl rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          Shopify banners could not be loaded. {loadError}
        </p>
      ) : banners.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          Shopify returned no banner entries with images.
        </p>
      ) : (
        <div className="space-y-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative h-[420px] overflow-hidden sm:h-[500px] lg:h-[600px]"
            >
              <StoreImage
                src={banner.image}
                alt={banner.imageAlt || ''}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white">
                <div>
                  {banner.subtitle && (
                    <p className="text-sm uppercase tracking-[0.3em]">
                      {banner.subtitle}
                    </p>
                  )}

                  <h2 className="mt-4 text-3xl font-bold sm:text-4xl md:text-6xl">
                    {banner.title}
                  </h2>

                  {banner.description && (
                    <p className="mx-auto mt-4 max-w-lg text-sm text-white/90 md:text-base">
                      {banner.description}
                    </p>
                  )}

                  <BannerLink
                    to={banner.link}
                    className="mt-8 inline-block bg-white px-8 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-900 hover:text-white"
                  >
                    {banner.buttonLabel}
                  </BannerLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ImageBanner;
