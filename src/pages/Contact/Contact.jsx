import { useEffect, useState } from 'react';
import { useSite } from '../../contexts/siteContext';
import { getContentPage } from '../../services/shopify/siteService';
import SafeHtml from '../../components/SafeHtml';
import Seo from '../../components/Seo';
export default function Contact() {
  const { site } = useSite();
  const [page, setPage] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getContentPage('contact').then(value => { if (!cancelled) setPage(value); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const domain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return <main className="mx-auto max-w-3xl px-4 py-12"><Seo title={'Contact | ' + (site?.name || 'Store')} description="Get in touch with our store." /><h1 className="mb-8 text-3xl font-bold">{page?.title || 'Contact us'}</h1>
    {page?.body && <SafeHtml html={page.body} />}
    <div className="my-6 space-y-2 text-sm">{site?.contactEmail && <p><a className="underline" href={'mailto:' + site.contactEmail}>{site.contactEmail}</a></p>}{site?.contactPhone && <p><a className="underline" href={'tel:' + site.contactPhone}>{site.contactPhone}</a></p>}{site?.contactAddress && <p>{site.contactAddress}</p>}</div>
    <form method="post" action={(site?.primaryDomain?.url || 'https://' + domain) + '/contact#contact_form'} acceptCharset="UTF-8" className="space-y-5">
      <input type="hidden" name="form_type" value="contact" /><input type="hidden" name="utf8" value="✓" />
      <label className="block text-sm">Name<input name="contact[name]" required autoComplete="name" className="mt-2 w-full border p-3" /></label>
      <label className="block text-sm">Email<input name="contact[email]" type="email" required autoComplete="email" className="mt-2 w-full border p-3" /></label>
      <label className="block text-sm">Message<textarea name="contact[body]" rows="6" required className="mt-2 w-full border p-3" /></label>
      <p className="text-xs text-gray-500">Shopify securely processes your message on the store website and may ask for spam verification.</p>
      <button className="bg-gray-900 px-8 py-3 text-white">Send message</button>
    </form>
  </main>;
}
