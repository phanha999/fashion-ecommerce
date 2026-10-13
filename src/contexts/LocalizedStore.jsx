import SiteProvider from './SiteProvider';
import CustomerAccountProvider from './CustomerAccountProvider';
import CartProvider from './CartProvider';
import { useLocalization } from './localizationContext';
import App from '../App';

export default function LocalizedStore() {
  const { revision } = useLocalization();
  // Reset loaded pages and providers together: old prices never mix with the new market.
  return <SiteProvider key={revision}><CustomerAccountProvider><CartProvider><App /></CartProvider></CustomerAccountProvider></SiteProvider>;
}
