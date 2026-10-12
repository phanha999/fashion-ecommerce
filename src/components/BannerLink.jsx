import { Link } from 'react-router-dom';

// Shopify URL fields may point to an app route or an external website.
function BannerLink({ to, children, ...props }) {
  if (!to) return null;

  if (/^(https?:\/\/|\/\/|mailto:|tel:)/i.test(to)) {
    return <a href={to} {...props}>{children}</a>;
  }

  return <Link to={to} {...props}>{children}</Link>;
}

export default BannerLink;
