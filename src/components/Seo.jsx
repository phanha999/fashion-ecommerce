export default function Seo({ title, description = '', image, noIndex = false, product }) {
  const canonical = window.location.origin + window.location.pathname;
  return <>
    <title>{title}</title>
    <meta name="description" content={description.slice(0, 160)} />
    <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description.slice(0, 160)} />
    <meta property="og:type" content={product ? 'product' : 'website'} />
    <meta property="og:url" content={canonical} />
    {image && <meta property="og:image" content={image} />}
    <link rel="canonical" href={canonical} />
  </>;
}
