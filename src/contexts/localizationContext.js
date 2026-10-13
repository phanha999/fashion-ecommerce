import { createContext, useContext } from 'react';
export const LocalizationContext = createContext(null);
export const useLocalization = () => useContext(LocalizationContext);
