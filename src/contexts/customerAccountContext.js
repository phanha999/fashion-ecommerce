import { createContext, useContext } from 'react';

export const CustomerAccountContext = createContext(null);

export function useCustomerAccount() {
  const account = useContext(CustomerAccountContext);
  if (!account) throw new Error('CustomerAccountProvider is required.');
  return account;
}