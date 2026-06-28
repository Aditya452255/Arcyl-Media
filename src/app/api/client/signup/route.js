import { ApiResponse } from "../../../../utils/apiResponse";
import { ValidationError } from "../../../../utils/errors";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import prisma from "../../../../config/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const POST = withErrorHandler(async (req) => {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      "Validation failed",
      parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
    );
  }

  const { name, email, company, password } = parsed.data;

  // Check unique user email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new ValidationError("Email address is already registered.");
  }

  // Get CLIENT role ID
  const clientRole = await prisma.role.findFirst({
    where: { name: "CLIENT" },
  });
  if (!clientRole) {
    throw new ValidationError("Client role configuration not seeded in database.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Perform database write transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create client
    const client = await tx.client.create({
      data: {
        companyName: company,
        status: "ACTIVE",
      },
    });

    // 2. Create user credentials account
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        clientId: client.id,
      },
    });

    // 3. Map user role to CLIENT
    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: clientRole.id,
      },
    });

    // 4. Create client contact representative
    await tx.clientContact.create({
      data: {
        clientId: client.id,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "Rep",
        email,
        position: "Representative",
      },
    });

    return { userId: user.id, clientId: client.id };
  });

  return ApiResponse.success("Registration successful! You can now log in.", result, 201);
});
