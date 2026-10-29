const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const existing = await prisma.provider.findFirst({
    where: { apiUrl: "https://indiansmartpanel.com/api/v2" },
  });

  if (existing) {
    await prisma.provider.update({
      where: { id: existing.id },
      data: {
        apiKey: "pwn91ghifeacreaukihjrq7f5574p8tw4qllc1iu",
        status: "ACTIVE",
        balance: 0.0,
        currency: "USD",
      },
    });
    console.log("✅ Updated existing IndianSmartPanel provider in database");
  } else {
    await prisma.provider.create({
      data: {
        name: "IndianSmartPanel (Production Live)",
        apiUrl: "https://indiansmartpanel.com/api/v2",
        apiKey: "pwn91ghifeacreaukihjrq7f5574p8tw4qllc1iu",
        status: "ACTIVE",
        isDefault: true,
        balance: 0.0,
        currency: "USD",
      },
    });
    console.log("✅ Created IndianSmartPanel provider record in database");
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
