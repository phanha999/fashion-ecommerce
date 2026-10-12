import Seo from '../../components/Seo';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlogArticle } from '../../services/shopify/blogService';

function BlogArticle() {
  const { blogHandle, articleHandle } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getBlogArticle(blogHandle, articleHandle)
      .then((shopifyArticle) => {
        if (!cancelled) setArticle(shopifyArticle);
      })
      .catch((error) => {
        console.error('Could not load the Shopify blog article:', error);
        if (!cancelled) setLoadError(error.message || 'Unknown Shopify error.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [blogHandle, articleHandle]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <Seo title={article?.title || 'Journal'} description={article?.description || ''} image={article?.image} />
      <Link to="/blogs" className="text-sm text-gray-600 underline underline-offset-4">
        Back to home
      </Link>

      {isLoading ? (
        <div className="mt-8 h-96 animate-pulse bg-gray-100" aria-label="Loading article" />
      ) : loadError ? (
        <p className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          Shopify article could not be loaded. {loadError}
        </p>
      ) : !article ? (
        <p className="mt-8 text-gray-600">This article could not be found.</p>
      ) : (
        <article className="mt-8">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            {article.blogTitle}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 md:text-5xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString()}
            </time>
            {article.author && <span>By {article.author}</span>}
          </div>
          {article.image && (
            <img
              src={article.image}
              alt={article.imageAlt}
              className="mt-8 max-h-[600px] w-full object-cover"
            />
          )}
          {article.description && (
            <p className="mt-8 text-lg leading-8 text-gray-700">
              {article.description}
            </p>
          )}
          <div className="mt-8 whitespace-pre-line text-base leading-8 text-gray-700">
            {article.content}
          </div>
        </article>
      )}
    </main>
  );
}

export default BlogArticle;
