import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { UserRole } from "../src/users/user-role.enum";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: "admin@agrochain.local",
      password: "Admin123!",
      role: UserRole.Admin,
      walletAddress: "0xAdminDemo000000000000000000000000000000",
    },
    {
      email: "seller@agrochain.local",
      password: "Seller123!",
      role: UserRole.Seller,
      walletAddress: "0xSellerDemo000000000000000000000000000000",
    },
    {
      email: "buyer@agrochain.local",
      password: "Buyer123!",
      role: UserRole.Buyer,
      walletAddress: "0xBuyerDemo000000000000000000000000000000",
    },
    {
      email: "testseller1@gmail.com",
      password: "password123",
      role: UserRole.Seller,
      walletAddress: "0xTestSeller1000000000000000000000000000000",
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const email = user.email.toLowerCase();
    await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        walletAddress: user.walletAddress,
      },
      create: {
        email,
        passwordHash,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  }

  console.log("Seed data applied successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });