import { revalidateTag, revalidatePath } from "next/cache";
import logger from "./logger";

export class CacheManager {
  /**
   * Triggers on-demand revalidation for all public page paths and the 'cms' fetch tag
   */
  static purgeCMSCache() {
    try {
      revalidateTag("cms");
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/services");
      revalidatePath("/portfolio");
      revalidatePath("/contact");
      logger.info("CMS cache tags and public paths revalidated successfully");
    } catch (err) {
      // In non-Next environments (like during db push/scripts) it might fail silently
      logger.warn({ err }, "On-demand revalidation skipped or failed");
    }
  }
}
