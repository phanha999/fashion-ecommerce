import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  completeCustomerLogin,
  getCustomerAccountConfigError,
  getCustomerProfile,
  logoutCustomer,
  startCustomerLogin,
} from '../../services/shopify/accountService';

function Account() {
  const location = useLocation();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');
  const callbackPromise = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(location.search);

    async function loadAccount() {
      try {
        if (params.has('code') || params.has('error')) {
          if (!callbackPromise.current) {
            callbackPromise.current = completeCustomerLogin(location.search);
          }
          const profile = await callbackPromise.current;
          window.history.replaceState({}, document.title, location.pathname);
          if (!cancelled) setCustomer(profile);
        } else {
          const profile = await getCustomerProfile();
          if (!cancelled) setCustomer(profile);
        }
      } catch (accountError) {
        console.error('Could not load Shopify customer account:', accountError);
        if (!cancelled) setError(accountError.message || 'Your account could not be loaded.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAccount();
    return () => { cancelled = true; };
  }, [location.pathname, location.search]);

  async function handleSignIn() {
    setError('');
    setIsSigningIn(true);
    try {
      await startCustomerLogin();
    } catch (authError) {
      setError(authError.message || 'Could not start Shopify sign-in.');
      setIsSigningIn(false);
    }
  }

  async function handleLogout() {
    await logoutCustomer();
    setCustomer(null);
  }

  const configError = getCustomerAccountConfigError();

  return (
    <section className="mx-auto max-w-[1920px] px-4 py-16 md:px-8 md:py-24 2xl:px-16">
      <div className="mx-auto max-w-2xl">
        {isLoading ? (
          <div className="h-72 animate-pulse bg-gray-100" aria-label="Loading account" />
        ) : customer ? (
          <div className="border border-gray-200 p-6 sm:p-10">
            <p className="text-sm uppercase tracking-[0.25em] text-gray-500">Your Velora account</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">Hello, {customer.firstName || customer.displayName}</h1>
            <p className="mt-3 text-sm text-gray-600">{customer.emailAddress?.emailAddress}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="min-h-12 bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                Sign out
              </button>
              <Link to="/shop" className="inline-flex min-h-12 items-center border border-gray-300 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50">
                Continue shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 px-6 py-10 text-center sm:px-12 sm:py-14">
            <p className="text-sm uppercase tracking-[0.25em] text-gray-500">Your Velora account</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">Sign in or create an account</h1>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-gray-600">
              Continue securely with Shopify. Enter your email to receive a one-time sign-in code. New customers can create their account during this process.
            </p>

            {error && (
              <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-left text-sm text-red-800" role="alert">
                {error}
              </p>
            )}

            {!error && configError && (
              <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
                <p className="font-medium">Shopify sign-in setup is incomplete.</p>
                <p className="mt-1">{configError}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn || Boolean(configError)}
              className="mt-8 min-h-12 bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSigningIn ? 'Connecting to Shopify…' : 'Continue with Shopify'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Account;
