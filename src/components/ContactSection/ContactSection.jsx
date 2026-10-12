import { useEffect, useState } from 'react';
import BannerLink from '../BannerLink';
import { getBanners } from '../../services/shopify/contentService';

function ContactSection() {
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
        console.error('Could not load the Shopify contact banner:', error);
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
        aria-label="Loading contact section"
        className="mx-auto max-w-7xl px-6 py-20"
      >
        <div className="mx-auto h-[280px] max-w-4xl animate-pulse bg-gray-100" />
      </section>
    );
  }

  if (loadError || !banner) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p
          className="mx-auto max-w-3xl rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          Shopify contact banner could not be loaded. {loadError || 'No banner was returned.'}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        {banner.subtitle && (
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            {banner.subtitle}
          </p>
        )}

        <h2 className="mt-3 text-4xl font-bold text-gray-900 md:text-5xl">
          {banner.title}
        </h2>

        {banner.description && (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600 md:text-base">
            {banner.description}
          </p>
        )}

        <div className="mx-auto mt-8 h-[280px] max-w-4xl overflow-hidden bg-gray-100">
          <img
            src={banner.image}
            alt={banner.imageAlt || banner.title || 'Contact our support team'}
            className="h-full w-full object-cover"
          />
        </div>

        <BannerLink
          to={banner.link}
          className="mt-8 inline-block bg-gray-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          {banner.buttonLabel || 'Contact Us'}
        </BannerLink>
      </div>
    </section>
  );
}

export default ContactSection;
