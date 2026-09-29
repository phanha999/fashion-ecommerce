import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/shopify/contentService';

function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getCategories()
      .then((shopifyCategories) => {
        if (!cancelled) setCategories(shopifyCategories);
      })
      .catch((error) => {
        console.error('Could not load Shopify categories:', error);
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
    <section className="py-20">
      <div className="mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gray-500">
            Explore
          </p>

          <h2 className="text-3xl font-semibold md:text-4xl">
            Shop By Category
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
            Shopify categories chưa tải được. {loadError}
          </p>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Shopify chưa trả về Category entries có ảnh.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-[30px] md:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.link}
                className="group relative aspect-[3/4] overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.imageAlt}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/40" />

                <div className="absolute inset-0 flex items-end p-6">
                  <h3 className="text-xl font-medium text-white md:text-2xl">
                    {category.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CategorySection;

