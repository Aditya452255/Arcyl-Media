import prisma from "../config/db";

export class SearchService {
  /**
   * Performs a parallel case-insensitive search across 8 operational databases
   */
  static async searchAll(query) {
    if (!query || query.trim().length === 0) {
      return {
        employees: [],
        leads: [],
        services: [],
        portfolio: [],
        faqs: [],
        testimonials: [],
        media: [],
        settings: [],
      };
    }

    const term = query.trim();

    const [
      employees,
      leads,
      services,
      portfolio,
      faqs,
      testimonials,
      media,
      settings,
    ] = await Promise.all([
      // 1. Employees search
      prisma.employee.findMany({
        where: {
          isDeleted: false,
          OR: [
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { designation: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      // 2. Leads search
      prisma.lead.findMany({
        where: {
          isArchived: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { company: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      // 3. Services search
      prisma.service.findMany({
        where: {
          isDeleted: false,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      // 4. Portfolio search
      prisma.portfolio.findMany({
        where: {
          isDeleted: false,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { category: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      // 5. FAQs search
      prisma.fAQ.findMany({
        where: {
          isDeleted: false,
          OR: [
            { question: { contains: term, mode: "insensitive" } },
            { answer: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      // 6. Testimonials search
      prisma.testimonial.findMany({
        where: {
          isDeleted: false,
          OR: [
            { author: { contains: term, mode: "insensitive" } },
            { content: { contains: term, mode: "insensitive" } },
            { company: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      // 7. Media search
      prisma.mediaAsset.findMany({
        where: {
          isDeleted: false,
          OR: [
            { altText: { contains: term, mode: "insensitive" } },
            { collectionName: { contains: term, mode: "insensitive" } },
            { folder: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      // 8. Org settings search
      prisma.organizationSetting.findMany({
        where: {
          OR: [
            { companyName: { contains: term, mode: "insensitive" } },
            { address: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 1,
      }),
    ]);

    return {
      employees,
      leads,
      services,
      portfolio,
      faqs,
      testimonials,
      media,
      settings,
    };
  }
}
