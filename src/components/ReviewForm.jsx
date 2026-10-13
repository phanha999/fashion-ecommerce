import { t } from "../utils/translations";
import { useState } from 'react';
import { useSite } from '../contexts/siteContext';
export default function ReviewForm({ product }) {
  const { site } = useSite();
  const [rating, setRating] = useState('5');
  const [body, setBody] = useState('');
  const domain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return <details className="mt-6 border p-4"><summary className="cursor-pointer text-sm font-medium">{t("Submit a product review")}</summary>
    <form method="post" action={(site?.primaryDomain?.url || 'https://' + domain) + '/contact#contact_form'} acceptCharset="UTF-8" className="mt-5 space-y-4">
      <input type="hidden" name="form_type" value="contact" /><input type="hidden" name="utf8" value="✓" />
      <input type="hidden" name="contact[body]" value={'Product review: ' + product.title + ' (' + product.handle + ')\nRating: ' + rating + '/5\n' + body} />
      <label className="block text-sm">{t("Name")}<input required name="contact[name]" autoComplete="name" className="mt-1 w-full border p-3" /></label>
      <label className="block text-sm">{t("Email")}<input required name="contact[email]" type="email" autoComplete="email" className="mt-1 w-full border p-3" /></label>
      <label className="block text-sm">{t("Rating")}<select value={rating} onChange={event => setRating(event.target.value)} className="ml-3 border p-2">{[5,4,3,2,1].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label>
      <label className="block text-sm">{t("Your review")}<textarea required value={body} onChange={event => setBody(event.target.value)} rows="4" className="mt-1 w-full border p-3" /></label>
      <p className="text-xs text-gray-500">{t("Your review is sent to the store for moderation through Shopify. Your email is not published.")}</p>
      <button className="bg-gray-900 px-6 py-3 text-sm text-white">{t("Submit for review")}</button>
    </form>
  </details>;
}
