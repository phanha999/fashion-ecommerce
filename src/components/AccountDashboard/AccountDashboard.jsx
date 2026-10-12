import { useEffect, useState } from 'react';
import { getAccountDetails, getOrders, updateProfile, saveAddress, deleteAddress, setDefaultAddress } from '../../services/shopify/accountDetailsService';
import { useCustomerAccount } from '../../contexts/customerAccountContext';

const field = 'mt-1 w-full border border-gray-300 p-3';
const button = 'border border-gray-300 px-4 py-2 text-sm disabled:opacity-50';
const addressInputs = [['firstName', 'First name'], ['lastName', 'Last name'], ['company', 'Company'], ['address1', 'Address'], ['address2', 'Apartment / unit'], ['city', 'City'], ['province', 'State / province'], ['country', 'Country'], ['zip', 'Postal code'], ['phone', 'Phone']];
const requiredFields = new Set(['firstName', 'lastName', 'address1', 'city', 'country']);
function money(value) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: value.currencyCode }).format(Number(value.amount));
}
export default function AccountDashboard() {
  const { customer, refreshCustomer } = useCustomerAccount();
  const [details, setDetails] = useState(null);
  const [orders, setOrders] = useState(null);
  const [tab, setTab] = useState('orders');
  const [editing, setEditing] = useState(null);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [expanded, setExpanded] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getAccountDetails().then(value => { if (!cancelled) setDetails(value); }).catch(failure => { if (!cancelled) setError(failure.message); });
    return () => { cancelled = true; };
  }, [customer.id, revision]);
  useEffect(() => {
    let cancelled = false;
    getOrders().then(value => { if (!cancelled) setOrders(value); }).catch(failure => { if (!cancelled) setError(failure.message); });
    return () => { cancelled = true; };
  }, [customer.id, revision]);

  async function perform(action, message) {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try { await action(); setNotice(message); }
    catch (failure) { setError(failure.message || 'Please try again.'); }
    finally { setBusy(false); }
  }
  function profileSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    perform(async () => {
      await updateProfile({ firstName: values.firstName.trim(), lastName: values.lastName.trim(), phone: values.phone.trim() || null, acceptsMarketing: values.acceptsMarketing === 'on' });
      await refreshCustomer();
      setRevision(value => value + 1);
    }, 'Profile updated.');
  }
  function addressSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    perform(async () => {
      await saveAddress(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])), editing.id);
      setEditing(null); setRevision(value => value + 1);
    }, 'Address saved.');
  }
  return (
    <section className="mt-10 border-t border-gray-200 pt-6">
      <div className="flex flex-wrap gap-3" aria-label="Account sections">
        {['orders', 'profile', 'addresses'].map(item => <button key={item} onClick={() => { setTab(item); setError(''); setNotice(''); }} className={button + (tab === item ? ' bg-gray-900 text-white' : '')}>{item.charAt(0).toUpperCase() + item.slice(1)}</button>)}
      </div>
      {error && <p role="alert" className="mt-4 bg-red-50 p-3 text-sm text-red-800">{error} <button type="button" className="underline" onClick={() => setRevision(value => value + 1)}>Try again</button></p>}
      {notice && <p role="status" className="mt-4 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      {tab === 'orders' && <div className="mt-6">
        {!orders ? <p>Loading orders…</p> : !orders.nodes.length ? <p className="text-gray-500">You have no orders yet.</p> : orders.nodes.map(order => (
          <article key={order.id} className="mb-4 border border-gray-200 p-4">
            <div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">{order.name}</h2><span>{money(order.totalPrice)}</span></div>
            <p className="mt-2 text-sm text-gray-500">{new Date(order.processedAt).toLocaleDateString()} · {order.financialStatus?.replaceAll('_', ' ')} · {order.fulfillmentStatus?.replaceAll('_', ' ')}</p>
            <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="mt-3 text-sm underline">{expanded === order.id ? 'Hide details' : 'View details'}</button>
            {expanded === order.id && <div className="mt-4 space-y-3">
              {order.lineItems.nodes.map((line, index) => <div key={index} className="flex gap-3">{line.variant?.image && <img className="h-16 w-12 object-cover" src={line.variant.image.url} alt={line.variant.image.altText || line.title} />}<p className="text-sm">{line.title}<br />{line.variant?.title !== 'Default Title' ? line.variant?.title : ''} · Qty {line.quantity}</p></div>)}
              {order.lineItems.pageInfo.hasNextPage && <p className="text-sm">View all items on the order status page below.</p>}
              {order.shippingAddress && <p className="text-sm">Ship to: {order.shippingAddress.formatted.join(', ')}</p>}
              {order.statusUrl?.startsWith('https://') && <a href={order.statusUrl} target="_blank" rel="noreferrer" className="inline-block text-sm underline">Track order / delivery status</a>}
            </div>}
          </article>
        ))}
        {orders?.pageInfo.hasNextPage && <button disabled={busy} className={button} onClick={() => perform(async () => {
          const next = await getOrders(orders.pageInfo.endCursor);
          setOrders(previous => ({ ...next, nodes: [...previous.nodes, ...next.nodes.filter(order => !previous.nodes.some(item => item.id === order.id))] }));
        }, '')}>Load more orders</button>}
      </div>}
      {tab === 'profile' && !details && <p className="mt-6">Loading profile…</p>}
      {tab === 'profile' && details && <form key={revision} onSubmit={profileSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">First name<input name="firstName" defaultValue={details.firstName || ''} autoComplete="given-name" className={field} /></label>
        <label className="block text-sm">Last name<input name="lastName" defaultValue={details.lastName || ''} autoComplete="family-name" className={field} /></label>
        <label className="block text-sm">Phone (international format)<input name="phone" type="tel" defaultValue={details.phone || ''} autoComplete="tel" className={field} /></label>
        <label className="flex items-center gap-3 text-sm"><input name="acceptsMarketing" type="checkbox" defaultChecked={details.acceptsMarketing} />Receive news and offers by email</label>
        <button disabled={busy} className={button}>{busy ? 'Saving…' : 'Save profile'}</button>
      </form>}
      {tab === 'addresses' && <div className="mt-6">
        {!details ? <p>Loading addresses…</p> : <>
          {details.addresses.length === 0 && <p className="mb-4 text-gray-500">No saved addresses.</p>}
          {details.addresses.map(address => <div key={address.id} className="mb-4 border border-gray-200 p-4">
            {address.id === details.defaultAddress?.id && <p className="mb-2 text-xs font-semibold">DEFAULT ADDRESS</p>}
            <p className="text-sm leading-6">{address.formatted.join(', ')}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button disabled={busy} className={button} onClick={() => setEditing(address)}>Edit</button>
              {address.id !== details.defaultAddress?.id && <button disabled={busy} className={button} onClick={() => perform(async () => { await setDefaultAddress(address.id); setRevision(value => value + 1); }, 'Default address updated.')}>Set default</button>}
              <button disabled={busy} className={button} onClick={() => { if (window.confirm('Delete this saved address?')) perform(async () => { await deleteAddress(address.id); setRevision(value => value + 1); }, 'Address deleted.'); }}>Delete</button>
            </div>
          </div>)}
          {!editing && <button className={button} onClick={() => setEditing({})}>Add address</button>}
          {editing && <form key={editing.id || 'new'} onSubmit={addressSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            {addressInputs.map(([name, label]) => <label key={name} className="text-sm">{label}<input name={name} defaultValue={editing[name] || ''} required={requiredFields.has(name)} className={field} /></label>)}
            <div className="flex gap-3 sm:col-span-2"><button disabled={busy} className={button}>{busy ? 'Saving…' : 'Save address'}</button><button type="button" disabled={busy} className={button} onClick={() => setEditing(null)}>Cancel</button></div>
          </form>}
        </>}
      </div>}
    </section>
  );
}
