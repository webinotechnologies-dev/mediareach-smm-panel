const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const existing = await prisma.provider.findFirst({
    where: { apiUrl: "https://peakerr.com/api/v2" },
  });

  if (existing) {
    await prisma.provider.update({
      where: { id: existing.id },
      data: {
        apiKey: "e9e1cd7846befb996e25b4303e22b251",
        status: "ACTIVE",
        balance: 0.0,
        currency: "USD",
      },
    });
    console.log("✅ Updated existing Peakerr provider in database");
  } else {
    await prisma.provider.create({
      data: {
        name: "Peakerr Wholesale API (Production Live)",
        apiUrl: "https://peakerr.com/api/v2",
        apiKey: "e9e1cd7846befb996e25b4303e22b251",
        status: "ACTIVE",
        isDefault: true,
        balance: 0.0,
        currency: "USD",
      },
    });
    console.log("✅ Created Peakerr provider record in database");
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
