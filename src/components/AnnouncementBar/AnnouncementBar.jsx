import { useSite } from '../../contexts/siteContext';
export default function AnnouncementBar() {
  const { site } = useSite();
  if (!site?.announcement) return null;
  return <div role="region" aria-label="Store announcement" className="bg-gray-950 px-4 py-3 text-center text-xs text-white">{site.announcement}</div>;
}
