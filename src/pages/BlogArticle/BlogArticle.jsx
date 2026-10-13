import { getIntlLocale } from "../../utils/localization";
import { t } from "../../utils/translations";
import StoreImage from '../../components/StoreImage';
import Seo from '../../components/Seo';
import SafeHtml from '../../components/SafeHtml';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlogArticle } from '../../services/shopify/blogService';

function BlogArticle() {
  const { blogHandle, articleHandle } = useParams();
  const [result, setResult] = useState(null);
  const [revision, setRevision] = useState(0);
  const target = `${blogHandle}/${articleHandle}`;
  const current = result?.target === target && result.revision === revision ? result : null;
  const article = current?.article;
  const isLoading = !current;
  const loadError = current?.error;

  useEffect(() => {
    let cancelled = false;

    getBlogArticle(blogHandle, articleHandle)
      .then((shopifyArticle) => {
        if (!cancelled) setResult({ target, revision, article: shopifyArticle });
      })
      .catch((error) => {
        if (!cancelled) setResult({ target, revision, error: error.message || 'Please try again.' });
      });

    return () => {
      cancelled = true;
    };
  }, [blogHandle, articleHandle, target, revision]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <Seo title={article?.title || t("Journal")} description={article?.description || ''} image={article?.image} />
      <Link to="/blogs" className="text-sm text-gray-600 underline underline-offset-4">
        {t("Back to journal")}
      </Link>

      {isLoading ? (
        <div className="mt-8 h-96 animate-pulse bg-gray-100" aria-label="Loading article" />
      ) : loadError ? (
        <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <p>Shopify article could not be loaded. {loadError}</p>
          <button className="mt-4 underline" onClick={() => setRevision(value => value + 1)}>{t("Try again")}</button>
        </div>
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
              {new Date(article.publishedAt).toLocaleDateString(getIntlLocale())}
            </time>
            {article.author && <span>By {article.author}</span>}
          </div>
          {article.image && (
            <StoreImage
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
          {article.contentHtml ? <div className="mt-8"><SafeHtml html={article.contentHtml} /></div> : <div className="mt-8 whitespace-pre-line text-base leading-8 text-gray-700">{article.content}</div>}
        </article>
      )}
    </section>
  );
}

export default BlogArticle;
