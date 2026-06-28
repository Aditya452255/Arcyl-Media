import { unstable_cache } from "next/cache";
import prisma from "../config/db";
import logger from "../utils/logger";

const mapping = {
  hero: "hero",
  about: "about",
  service: "service",
  portfolio: "portfolio",
  testimonial: "testimonial",
  faq: "fAQ",
  technology: "technology",
  teamMember: "teamMember",
  socialLink: "socialLink",
  footer: "footer",
};

/**
 * Retrieves cached, published items for standard CMS modules.
 * Gracefully falls back to empty arrays on database errors.
 */
export async function getCmsModuleCached(moduleName) {
  const prismaModel = mapping[moduleName];
  if (!prismaModel || !prisma[prismaModel]) return [];

  const fetchFn = unstable_cache(
    async () => {
      try {
        return await prisma[prismaModel].findMany({
          where: {
            isPublished: true,
            isDeleted: false,
          },
          orderBy: {
            displayOrder: "asc",
          },
        });
      } catch (err) {
        logger.error({ err, moduleName }, `Failed to fetch CMS module ${moduleName} from database`);
        return [];
      }
    },
    [`cms-${moduleName}`],
    { tags: ["cms", `cms-${moduleName}`], revalidate: 3600 }
  );

  try {
    return await fetchFn();
  } catch (err) {
    logger.warn({ err, moduleName }, `Cache resolution failed for ${moduleName}`);
    return [];
  }
}

/**
 * Retrieves cached global brand configurations.
 * Gracefully falls back to null on database errors.
 */
export async function getSiteSettingsCached() {
  const fetchFn = unstable_cache(
    async () => {
      try {
        return await prisma.siteSetting.findFirst();
      } catch (err) {
        logger.error({ err }, "Failed to fetch site settings from database");
        return null;
      }
    },
    ["cms-settings"],
    { tags: ["cms", "cms-settings"], revalidate: 3600 }
  );

  try {
    return await fetchFn();
  } catch (err) {
    logger.warn({ err }, "Cache resolution failed for site settings");
    return null;
  }
}
