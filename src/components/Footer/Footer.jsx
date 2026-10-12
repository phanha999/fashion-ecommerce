import { Link } from 'react-router-dom';
import { useSite } from '../../contexts/siteContext';
function Footer() {
  const { site } = useSite();
  const available = new Set(site?.pages.map(page => page.handle) || []);
  const groups = [
    ['Shop', [['All products', '/shop'], ['Men', '/shop?collection=men'], ['Women', '/shop?collection=women'], ['Shoes', '/shop?collection=shoes']]],
    ['Account', [['Your account', '/account'], ['Your cart', '/cart'], ['Wishlist', '/wishlist']]],
    ['Customer care', [['Contact', '/pages/contact'], ...(available.has('faqs') ? [['FAQ', '/pages/faqs']] : []), ...(available.has('size-guide') ? [['Size guide', '/pages/size-guide']] : [])]],
    ['Policies', [['Shipping', '/policies/shipping-policy'], ['Returns', '/policies/refund-policy'], ['Privacy', '/policies/privacy-policy'], ['Terms', '/policies/terms-of-service']]],
  ];
  return <footer className="border-t border-gray-200 bg-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
      <div><h2 className="font-semibold">{site?.name || 'Our store'}</h2><p className="mt-4 text-sm leading-6 text-gray-500">{site?.description || 'Explore our collections and find your next favourite.'}</p>{available.has('about-us') && <Link to="/pages/about-us" className="mt-4 inline-block text-sm underline">About us</Link>}{site?.contactEmail && <a href={'mailto:' + site.contactEmail} className="mt-4 block break-all text-sm underline">{site.contactEmail}</a>}</div>
      {groups.map(([title, links]) => <div key={title}><h3 className="font-semibold">{title}</h3><ul className="mt-4 space-y-3 text-sm text-gray-600">{links.map(([label, url]) => <li key={url}><Link to={url} className="hover:underline">{label}</Link></li>)}</ul></div>)}
    </div>
    <p className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} {site?.name || 'Our store'}. All rights reserved.</p>
  </footer>;
}
export default Footer;
