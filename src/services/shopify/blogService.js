import { shopifyFetch } from './client';

const ARTICLE_FIELDS = `
  id
  handle
  title
  excerpt
  content
  contentHtml
  publishedAt
  tags
  image { url altText }
  authorV2 { name }
`;

const BLOG_ARTICLES_QUERY = `
  query BlogArticles($blogsFirst: Int!, $articlesFirst: Int!) {
    blogs(first: $blogsFirst) {
      nodes {
        title
        handle
        articles(first: $articlesFirst, reverse: true) {
          nodes {
            ${ARTICLE_FIELDS}
          }
        }
      }
    }
  }
`;

const BLOG_ARTICLE_QUERY = `
  query BlogArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      title
      handle
      articleByHandle(handle: $articleHandle) {
        ${ARTICLE_FIELDS}
      }
    }
  }
`;

function mapArticle(article, blog) {
  return {
    id: article.id,
    handle: article.handle,
    blogHandle: blog.handle,
    blogTitle: blog.title,
    title: article.title,
    description: article.excerpt || article.content.slice(0, 180),
    content: article.content,
    contentHtml: article.contentHtml || '',
    image: article.image?.url || '',
    imageAlt: article.image?.altText || article.title,
    publishedAt: article.publishedAt,
    author: article.authorV2?.name || '',
    tags: article.tags || [],
  };
}

export async function getBlogArticles({ first = 10, blogsFirst = 10 } = {}) {
  const data = await shopifyFetch(BLOG_ARTICLES_QUERY, {
    blogsFirst,
    articlesFirst: first,
  });

  return (data.blogs?.nodes || [])
    .flatMap((blog) => (blog.articles?.nodes || []).map((article) => mapArticle(article, blog)))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, first);
}

export async function getBlogArticle(blogHandle, articleHandle) {
  if (!blogHandle?.trim() || !articleHandle?.trim()) {
    throw new Error('A Shopify blog handle and article handle are required.');
  }

  const data = await shopifyFetch(BLOG_ARTICLE_QUERY, {
    blogHandle: blogHandle.trim(),
    articleHandle: articleHandle.trim(),
  });
  const blog = data.blog;
  const article = blog?.articleByHandle;

  return blog && article ? mapArticle(article, blog) : null;
}
