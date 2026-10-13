import StoreImage from '../StoreImage';
import { useEffect, useState } from 'react';
import NewsletterForm from '../NewsletterForm';
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
          <StoreImage
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

            <NewsletterForm label={banner.buttonLabel || 'Subscribe'} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
