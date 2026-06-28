import AboutPageClient from "./AboutPageClient";
import { getCmsModuleCached, getSiteSettingsCached } from "../../lib/cms-queries";

export default async function AboutPage() {
  // Parallel fetch at render time using Next.js caching
  const [aboutData, techData, settingsData] = await Promise.all([
    getCmsModuleCached("about"),
    getCmsModuleCached("technology"),
    getSiteSettingsCached(),
  ]);

  return (
    <AboutPageClient
      about={aboutData}
      tech={techData}
      settings={settingsData}
    />
  );
}
