import BannerLink from '../BannerLink';
import { useSite } from '../../contexts/siteContext';
import StoreImage from '../StoreImage';
function Footer() {
  const { site } = useSite();
  return <footer className="border-t border-gray-200 bg-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
      <div><h2 className="font-semibold">{site?.logo?.url ? <StoreImage src={site.logo.url} alt={site.logo.altText || site.name} width={site.logo.width} height={site.logo.height} maxWidth={240} sizes="114px" className="h-auto w-[114px] object-contain" /> : site?.name || 'Our store'}</h2><p className="mt-4 text-sm leading-6 text-gray-500">{site?.description || 'Explore our collections and find your next favourite.'}</p>{site?.contactEmail && <a href={'mailto:' + site.contactEmail} className="mt-4 block break-all text-sm underline">{site.contactEmail}</a>}</div>
      {site?.footerMenu && <nav aria-label="Footer navigation" className="sm:col-span-1 lg:col-span-4"><h2 className="font-semibold">{site.footerMenu.title}</h2><MenuLinks items={site.footerMenu.items} /></nav>}
    </div>
    <p className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} {site?.name || 'Our store'}. All rights reserved.</p>
  </footer>;
}
export default Footer;

function MenuLinks({ items, nested = false }) {
  return <ul className={nested ? 'mt-3 space-y-2 border-l border-gray-200 pl-4 text-sm font-normal' : 'mt-4 grid gap-5 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4'}>{items.map(item => <li key={item.id}><BannerLink to={item.url} className="inline-flex min-h-9 items-center hover:underline">{item.title}</BannerLink>{item.items?.length > 0 && <MenuLinks items={item.items} nested />}</li>)}</ul>;
}