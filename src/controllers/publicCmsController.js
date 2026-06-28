import prisma from "../config/db";
import { TokenService } from "../services/tokenService";
import { ApiResponse } from "../utils/apiResponse";
import { NotFoundError } from "../utils/errors";

const mapModelName = (name) => {
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
  return mapping[name] || name;
};

const selectFields = {
  hero: {
    id: true,
    title: true,
    subtitle: true,
    ctaText: true,
    ctaLink: true,
    backgroundImage: true,
    displayOrder: true,
  },
  about: { id: true, title: true, content: true, image: true, displayOrder: true },
  service: { id: true, title: true, description: true, icon: true, slug: true, displayOrder: true },
  portfolio: {
    id: true,
    title: true,
    description: true,
    image: true,
    category: true,
    clientName: true,
    projectDate: true,
    ctaLink: true,
    slug: true,
    displayOrder: true,
  },
  testimonial: {
    id: true,
    author: true,
    company: true,
    role: true,
    content: true,
    image: true,
    rating: true,
    displayOrder: true,
  },
  faq: { id: true, question: true, answer: true, displayOrder: true },
  technology: { id: true, name: true, category: true, logo: true, displayOrder: true },
  teamMember: {
    id: true,
    name: true,
    role: true,
    bio: true,
    image: true,
    socialLinks: true,
    displayOrder: true,
  },
  socialLink: { id: true, platform: true, url: true, displayOrder: true },
  siteSetting: {
    id: true,
    logo: true,
    companyName: true,
    email: true,
    phone: true,
    address: true,
    businessHours: true,
    socialLinks: true,
    googleAnalyticsId: true,
    metaTitle: true,
    metaDescription: true,
    openGraphImage: true,
    favicon: true,
    themeSettings: true,
  },
  footer: { id: true, copyrightText: true, links: true },
};

export class PublicCmsController {
  /**
   * Helper that checks for admin session to allow draft previews
   */
  static checkAdminPreview(req) {
    const { searchParams } = new URL(req.url);
    const preview = searchParams.get("preview") === "true";
    if (!preview) return false;

    const cookies = req.headers.get("cookie") || "";
    const accessToken = cookies
      .split(";")
      .find((c) => c.trim().startsWith("accessToken="))
      ?.split("=")[1];
    if (!accessToken) return false;

    try {
      TokenService.verifyAccessToken(accessToken);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Public fetch dynamic items by CMS module type
   */
  static async getItems(req, modelName) {
    const prismaModel = mapModelName(modelName);
    if (!prisma[prismaModel]) {
      throw new NotFoundError(`CMS module '${modelName}' not recognized.`);
    }

    const select = selectFields[modelName];
    const previewMode = this.checkAdminPreview(req);

    const where = {};
    if (!["siteSetting", "footer"].includes(modelName)) {
      where.isDeleted = false;
      if (!previewMode) {
        where.isPublished = true;
      }
    }

    const orderBy = !["siteSetting", "footer"].includes(modelName)
      ? { displayOrder: "asc" }
      : undefined;

    const items = await prisma[prismaModel].findMany({
      where,
      orderBy,
      select,
    });

    return ApiResponse.success(`${modelName} items fetched successfully`, items, 200);
  }

  /**
   * Public settings fetcher
   */
  static async getSettings() {
    const select = selectFields.siteSetting;
    let settings = await prisma.siteSetting.findFirst({ select });
    if (!settings) {
      settings = {
        companyName: "Arcyl Media",
        email: "arcylmedia@gmail.com",
        themeSettings: { primaryColor: "#1a1a1a" },
      };
    }
    return ApiResponse.success("Site settings fetched successfully", settings, 200);
  }
}
