import { useEffect, useState } from 'react';
import BannerLink from '../BannerLink';
import { getBanners } from '../../services/shopify/contentService';

function AppBanner() {
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getBanners({ handle: 'velora-app' })
      .then(([shopifyBanner]) => {
        if (!cancelled) setBanner(shopifyBanner || null);
      })
      .catch((error) => {
        console.error('Could not load the Shopify app banner:', error);
        if (!cancelled) setLoadError(error.message || 'Unknown Shopify error.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <section
        aria-label="Loading app banner"
        className="mx-auto max-w-[1920px] px-4 py-20 md:px-8 2xl:px-16"
      >
        <div className="h-[420px] animate-pulse bg-gray-100 sm:h-[500px] lg:h-[700px]" />
      </section>
    );
  }

  if (loadError || !banner) {
    return (
      <section className="mx-auto max-w-[1920px] px-4 py-20 md:px-8 2xl:px-16">
        <p
          className="mx-auto max-w-3xl rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          Shopify app banner could not be loaded. {loadError || 'No banner was returned.'}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1920px] px-4 py-20 md:px-8 2xl:px-16">
      <div className="relative overflow-hidden bg-gray-100">
        <div className="grid lg:min-h-[700px] lg:grid-cols-2">
          <div className="relative min-h-[350px] overflow-hidden lg:min-h-0">
            <img
              src={banner.image}
              alt={banner.imageAlt || 'Velora mobile app'}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="flex items-center px-8 py-12 md:px-14 lg:px-16">
            <div className="max-w-md">
              <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
                {banner.subtitle || 'Velora App'}
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                {banner.title || 'Fashion at Your Fingertips'}
              </h2>

              <p className="mt-5 text-sm leading-6 text-gray-600 md:text-base">
                {banner.description || 'Discover new collections, exclusive offers and effortless shopping wherever you go.'}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <BannerLink
                  to={banner.link}
                  className="flex items-center gap-2 bg-black px-5 py-3 text-white transition hover:bg-gray-800"
                >
                  <span className="text-xl"></span>

                  <span className="text-left">
                    <span className="block text-[10px] uppercase text-gray-400">
                      Download on the
                    </span>

                    <span className="block text-sm font-medium">
                      App Store 
                    </span>
                  </span>
                </BannerLink>

                <BannerLink
                  to={banner.link_2}
                  className="flex items-center gap-2 bg-black px-5 py-3 text-white transition hover:bg-gray-800"
                >
                  <span className="text-xl">▶</span>

                  <span className="text-left">
                    <span className="block text-[10px] uppercase text-gray-400">
                      Get it on
                    </span>

                    <span className="block text-sm font-medium">
                      Google Play
                    </span>
                  </span>
                </BannerLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AppBanner;
