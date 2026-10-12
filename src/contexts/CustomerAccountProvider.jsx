import { useEffect, useRef, useState } from 'react';
import { CustomerAccountContext } from './customerAccountContext';
import { getCustomerProfile, loginCustomer, logoutCustomer, readStoredSession } from '../services/shopify/accountService';

export default function CustomerAccountProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState('');
  const revision = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const version = revision.current;
    getCustomerProfile()
      .then(profile => { if (!cancelled && version === revision.current) setCustomer(profile); })
      .catch(failure => { if (!cancelled && version === revision.current) setError(failure.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!customer) return;
    let timer;
    function checkExpiry() {
      const session = readStoredSession();
      if (!session) {
        revision.current += 1;
        setCustomer(null);
        setError('Your session has expired. Please sign in again.');
      } else {
        window.clearTimeout(timer);
        timer = window.setTimeout(checkExpiry, Math.min(session.expiresAt - Date.now(), 2147483647));
      }
    }
    timer = window.setTimeout(checkExpiry, 1000);
    window.addEventListener('focus', checkExpiry);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', checkExpiry);
    };
  }, [customer]);

  async function login(credentials) {
    const version = ++revision.current;
    setError('');
    setIsSigningIn(true);
    try {
      const profile = await loginCustomer(credentials);
      if (version === revision.current) setCustomer(profile);
      return true;
    } catch (failure) {
      if (version === revision.current) setError(failure.message || 'Could not sign in.');
      return false;
    } finally {
      setIsSigningIn(false);
    }
  }

  async function logout() {
    revision.current += 1;
    setError('');
    setIsSigningOut(true);
    setCustomer(null);
    try {
      await logoutCustomer();
    } catch {
      setError('You signed out locally, but Shopify could not revoke the session. Please check your connection.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <CustomerAccountContext.Provider value={{ customer, isLoading, isSigningIn, isSigningOut, error, refreshCustomer: async () => { const profile = await getCustomerProfile(); setCustomer(profile); return profile; }, clearError: () => setError(''), login, logout }}>
      {children}
    </CustomerAccountContext.Provider>
  );
}