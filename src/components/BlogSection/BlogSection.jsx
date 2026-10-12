import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { getBlogArticles } from '../../services/shopify/blogService';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function BlogSection() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getBlogArticles({ first: 10 })
      .then((shopifyArticles) => {
        if (!cancelled) setArticles(shopifyArticles);
      })
      .catch((error) => {
        console.error('Could not load Shopify blog articles:', error);
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
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          From Our Blog
        </p>
        <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
          Latest Articles
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600">
          Discover fashion tips, styling inspiration, and the latest trends from Velora.
        </p>
      </div>

      {isLoading ? (
        <div aria-label="Loading blog articles" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-[30px] lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="aspect-[4/3] animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : loadError ? (
        <p className="mx-auto max-w-3xl rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          Shopify blog articles could not be loaded. {loadError}
        </p>
      ) : articles.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          No published Shopify blog articles were found.
        </p>
      ) : (
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 30 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
            }}
          >
            {articles.map((article) => (
              <SwiperSlide key={article.id}>
                <article className="group pb-10">
                  <Link to={`/blogs/${article.blogHandle}/${article.handle}`}>
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      {article.image && (
                        <img
                          src={article.image}
                          alt={article.imageAlt}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="pt-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                        {article.tags[0] || article.blogTitle}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-gray-900">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {article.description}
                      </p>
                      <span className="mt-4 inline-block text-sm font-medium text-gray-900 underline underline-offset-4">
                        Read More
                      </span>
                    </div>
                  </Link>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
}

export default BlogSection;
