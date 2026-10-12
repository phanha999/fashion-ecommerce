import { useEffect, useState } from 'react';
import { getBanners } from '../../services/shopify/contentService';

function NewsletterSection() {
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getBanners({ handle: 'image-banner-kyhprri0' })
      .then(([shopifyBanner]) => {
        if (!cancelled) setBanner(shopifyBanner || null);
      })
      .catch((error) => {
        console.error('Could not load the Shopify newsletter banner:', error);
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
        aria-label="Loading newsletter"
        className="mx-auto max-w-[1920px] px-4 py-20 md:px-8 2xl:px-16"
      >
        <div className="grid min-h-[420px] animate-pulse bg-gray-100 lg:grid-cols-2" />
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
          Shopify newsletter banner could not be loaded. {loadError || 'No banner was returned.'}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1920px] px-4 py-20 md:px-8 2xl:px-16">
      <div className="grid overflow-hidden bg-gray-50 lg:grid-cols-2">
        <div className="relative min-h-[280px] bg-gray-100 sm:min-h-[380px] lg:min-h-[480px]">
          <img
            src={banner.image}
            alt={banner.imageAlt || banner.title || 'Newsletter'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-center px-6 py-12 text-center sm:px-10 lg:px-14">
          <div className="w-full max-w-xl">
            {banner.subtitle && (
              <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
                {banner.subtitle}
              </p>
            )}

            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              {banner.title}
            </h2>

            {banner.description && (
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600">
                {banner.description}
              </p>
            )}

            <form className="mx-auto mt-8 flex max-w-xl flex-col sm:flex-row">
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email address"
                aria-label="Email address"
                className="min-w-0 flex-1 border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
              />

              <button
                type="submit"
                className="shrink-0 bg-gray-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                {banner.buttonLabel || 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
