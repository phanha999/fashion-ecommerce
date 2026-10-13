import { Link } from 'react-router-dom';
import { useSite } from '../contexts/siteContext';
import { storefrontLink } from '../utils/storefrontLink';

// Shopify URL fields may point to an app route or an external website.
function BannerLink({ to, children, ...props }) {
  const { site } = useSite();
  const destination = storefrontLink(to, [window.location.origin, import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '', site?.primaryDomain?.url || '']);
  if (!destination) return null;

  if (/^(https?:\/\/|mailto:|tel:)/i.test(destination)) {
    return <a href={destination} {...props}>{children}</a>;
  }

  return <Link to={destination} {...props}>{children}</Link>;
}

export default BannerLink;
