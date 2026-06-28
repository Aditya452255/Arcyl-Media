import ServicesPageClient from "./ServicesPageClient";
import { getCmsModuleCached, getSiteSettingsCached } from "../../lib/cms-queries";

export default async function ServicesPage() {
  // Retrieve services and site settings in parallel with caching tags enabled
  const [servicesData, settingsData] = await Promise.all([
    getCmsModuleCached("service"),
    getSiteSettingsCached(),
  ]);

  return (
    <ServicesPageClient
      services={servicesData}
      settings={settingsData}
    />
  );
}
