import { useSite } from '../../contexts/siteContext';
import Seo from '../../components/Seo';
import { useState } from 'react';
import AccountDashboard from '../../components/AccountDashboard/AccountDashboard';
import { Link } from 'react-router-dom';
import { getCustomerAccountConfigError, registerCustomer, recoverCustomer } from '../../services/shopify/accountService';
import { useCustomerAccount } from '../../contexts/customerAccountContext';

const inputClass = 'mt-2 w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900';
const buttonClass = 'min-h-12 bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50';

export default function Account() {
  const { site } = useSite();
  const { customer, isLoading, isSigningIn, isSigningOut, error, clearError, login, logout } = useCustomerAccount();
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const configError = getCustomerAccountConfigError();
  const pending = busy || isSigningIn || isSigningOut;

  function switchMode(next) {
    setMode(next);
    setFormError('');
    setMessage('');
    clearError();
  }

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setBusy(true);
    setFormError('');
    setMessage('');
    clearError();
    try {
      if (mode === 'register') {
        if (values.password !== values.confirmPassword) throw new Error('Passwords do not match.');
        await registerCustomer(values);
        form.reset();
        setMode('login');
        setMessage('Account created. Sign in with your email and password. If Shopify sends an activation email, activate your account first.');
      } else if (mode === 'recover') {
        await recoverCustomer(values.email);
        form.reset();
        setMessage('If this email is eligible for password recovery, Shopify will send instructions. Check your inbox and spam folder.');
      } else if (await login(values)) {
        form.reset();
      } else {
        form.elements.password.value = '';
      }
    } catch (failure) {
      setFormError(failure.message || 'Please try again.');
      if (form.elements.password) form.elements.password.value = '';
      if (form.elements.confirmPassword) form.elements.confirmPassword.value = '';
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1920px] px-4 py-16 md:px-8 md:py-24">
      <Seo title="Your account" description="" noIndex />
      <div className="mx-auto max-w-3xl border border-gray-200 p-6 sm:p-10">
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">Your {site?.name || 'store'} account</p>
        {(error || formError) && <p role="alert" className="mt-5 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{formError || error}</p>}
        {message && !customer && <p role="status" className="mt-5 border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
        {isLoading ? (
          <div className="mt-6 h-72 animate-pulse bg-gray-100" aria-label="Loading account" />
        ) : customer ? (
          <>
            <h1 className="mt-4 text-3xl font-bold">Hello, {customer.firstName || customer.displayName || 'there'}</h1>
            <dl className="mt-6 space-y-4 text-sm">
              <div><dt className="text-gray-500">Name</dt><dd>{customer.displayName}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd>{customer.email}</dd></div>
              {customer.phone && <div><dt className="text-gray-500">Phone</dt><dd>{customer.phone}</dd></div>}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={logout} disabled={pending} className={buttonClass}>{isSigningOut ? 'Signing out…' : 'Sign out'}</button>
              <Link to="/shop" className="text-sm underline">Continue shopping</Link>
            </div>
            {customer && <AccountDashboard />}
          </>
        ) : (
          <>
            <h1 className="mt-4 text-3xl font-bold">{mode === 'register' ? 'Create an account' : mode === 'recover' ? 'Reset your password' : 'Sign in'}</h1>
            <p className="mt-3 text-sm text-gray-600">{mode === 'recover' ? 'Enter your email to receive password reset instructions.' : 'Use your email and password to access your account.'}</p>
            {configError && <p role="alert" className="mt-4 bg-amber-50 p-4 text-sm text-amber-900">{configError}</p>}
            <form key={mode} onSubmit={submit} className="mt-6 space-y-5">
              {mode === 'register' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">First name<input name="firstName" autoComplete="given-name" required disabled={pending} className={inputClass} /></label>
                  <label className="text-sm">Last name<input name="lastName" autoComplete="family-name" required disabled={pending} className={inputClass} /></label>
                </div>
              )}
              <label className="block text-sm">Email<input name="email" type="email" autoComplete="email" required disabled={pending} className={inputClass} /></label>
              {mode !== 'recover' && <label className="block text-sm">Password<input name="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 5 : undefined} required disabled={pending} className={inputClass} /></label>}
              {mode === 'register' && <label className="block text-sm">Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" required disabled={pending} className={inputClass} /></label>}
              <button type="submit" disabled={pending || Boolean(configError)} className={buttonClass + ' w-full'}>{pending ? 'Please wait…' : mode === 'register' ? 'Create account' : mode === 'recover' ? 'Send reset email' : 'Sign in'}</button>
            </form>
            <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm">
              {mode !== 'login' && <button type="button" disabled={pending} onClick={() => switchMode('login')} className="underline">Back to sign in</button>}
              {mode === 'login' && <><button type="button" disabled={pending} onClick={() => switchMode('register')} className="underline">Create an account</button><button type="button" disabled={pending} onClick={() => switchMode('recover')} className="underline">Forgot password?</button></>}
            </div>
            {customer && <AccountDashboard />}
          </>
        )}
      </div>
    </section>
  );
}