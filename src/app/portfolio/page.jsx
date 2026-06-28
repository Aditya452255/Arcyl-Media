import PortfolioPageClient from "./PortfolioPageClient";
import { getCmsModuleCached, getSiteSettingsCached } from "../../lib/cms-queries";

export default async function PortfolioPage() {
  // Parallel fetch utilizing dynamic cached tags
  const [portfolioData, settingsData] = await Promise.all([
    getCmsModuleCached("portfolio"),
    getSiteSettingsCached(),
  ]);

  return (
    <PortfolioPageClient
      portfolio={portfolioData}
      settings={settingsData}
    />
  );
}
