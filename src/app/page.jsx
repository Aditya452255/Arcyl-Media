import Hero from "../components/sections/Hero";
import Services from "../components/sections/Services";
import Expertise from "../components/sections/Expertise";
import Portfolio from "../components/sections/Portfolio";
import TechStack from "../components/sections/TechStack";
import FAQ from "../components/sections/FAQ";
import CTA from "../components/sections/CTA";
import { getCmsModuleCached, getSiteSettingsCached } from "../lib/cms-queries";

export default async function Home() {
  // Retrieve all public data sets in parallel at build/render time
  const [
    heroData,
    servicesData,
    aboutData,
    portfolioData,
    techData,
    faqData,
    settingsData,
  ] = await Promise.all([
    getCmsModuleCached("hero"),
    getCmsModuleCached("service"),
    getCmsModuleCached("about"),
    getCmsModuleCached("portfolio"),
    getCmsModuleCached("technology"),
    getCmsModuleCached("faq"),
    getSiteSettingsCached(),
  ]);

  return (
    <>
      <Hero data={heroData} />
      <Services data={servicesData} />
      <Expertise data={aboutData} />
      <Portfolio data={portfolioData} />
      <TechStack data={techData} />
      <FAQ data={faqData} />
      <CTA settings={settingsData} />
    </>
  );
}
