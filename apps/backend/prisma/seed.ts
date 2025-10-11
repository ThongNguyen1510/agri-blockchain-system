import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running seed...');

  const user = await prisma.user.create({
    data: {
      email: 'seed@local',
      passwordHash: 'seeded-password',
      role: 'seller',
      walletAddress: '0x0000000000000000000000000000000000000000',
    },
  });

  const batch = await prisma.batch.create({
    data: {
      batchCode: 'BATCH-001',
      farmName: 'Demo Farm',
      createdBy: user.id,
    },
  });

  const product = await prisma.product.create({
    data: {
      batchId: batch.id,
      sellerId: user.id,
      name: 'Demo Product',
      description: 'Seeded product',
      priceWei: '1000000000000000000',
      stock: 100,
    },
  });

  console.log('Seed complete:', { userId: user.id, batchId: batch.id, productId: product.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
