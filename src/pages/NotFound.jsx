import { t } from "../utils/translations";
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
export default function NotFound() {
  return <section className="mx-auto max-w-3xl px-4 py-24 text-center"><Seo title={t("Page not found")} noIndex /><h1 className="text-4xl font-bold">{t("Page not found")}</h1><p className="mt-5 text-gray-600">{t("This link may have changed or the page is no longer available.")}</p><Link to="/shop" className="mt-8 inline-block bg-gray-900 px-8 py-3 text-white">{t("Continue shopping")}</Link></section>;
}
