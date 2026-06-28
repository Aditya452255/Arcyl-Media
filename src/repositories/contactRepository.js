import prisma from "../config/db";

export class ContactRepository {
  static async create(data) {
    return prisma.contactSubmission.create({
      data,
    });
  }
}
