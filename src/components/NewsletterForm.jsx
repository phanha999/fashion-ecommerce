import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/siteContext';
import { useCustomerAccount } from '../contexts/customerAccountContext';
import { updateProfile } from '../services/shopify/accountDetailsService';
import { useNotifications } from '../contexts/notificationContext';
export default function NewsletterForm({ label = 'Subscribe' }) {
  const { notify } = useNotifications();
  const { site } = useSite();
  const { customer } = useCustomerAccount();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const domain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/+$/, '').trim();
  const action = (site?.primaryDomain?.url || 'https://' + domain) + '/contact#contact_form';
  async function submit(event) {
    if (!customer) return; // Shopify handles public newsletter forms, including anti-spam checks.
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try { await updateProfile({ acceptsMarketing: true }); setMessage('You are subscribed to news and offers.'); notify('You are subscribed to news and offers.'); }
    catch { setError('Could not save your subscription. Please try again.'); notify('Could not save your subscription. Please try again.', 'error'); }
    finally { setBusy(false); }
  }
  return <div>
    <form method="post" action={action} acceptCharset="UTF-8" onSubmit={submit} className="mt-8 space-y-4">
      <input type="hidden" name="form_type" value="customer" /><input type="hidden" name="utf8" value="✓" /><input type="hidden" name="contact[tags]" value="newsletter" />
      <div className="flex flex-col sm:flex-row"><input type="email" name="contact[email]" defaultValue={customer?.email || ''} readOnly={Boolean(customer)} required aria-label="Email address" placeholder="Your email address" className="min-w-0 flex-1 border border-gray-300 bg-white px-5 py-3" /><button disabled={busy} className="bg-gray-900 px-8 py-3 text-white disabled:opacity-50">{busy ? 'Saving…' : label}</button></div>
      <label className="flex items-start justify-center gap-2 text-left text-xs text-gray-600"><input type="checkbox" required className="mt-0.5" />I agree to receive email news and offers. I can unsubscribe at any time.</label>
      <p className="text-xs text-gray-500">{!customer && 'Shopify securely processes your subscription on the store website. '}<Link to="/policies/privacy-policy" className="underline">Privacy policy</Link></p>
    </form>
    {message && <p role="status" className="mt-4 text-sm text-green-700">{message}</p>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
  </div>;
}
