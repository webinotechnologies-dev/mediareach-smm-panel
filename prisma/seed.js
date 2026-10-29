const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed...");

  // 1. Seed Admin User & Demo User
  const adminPassword = await bcrypt.hash("admin12345password", 10);
  const admin = await prisma.user.upsert({
    where: { email: "mediareachsmm@gmail.com" },
    update: {},
    create: {
      email: "mediareachsmm@gmail.com",
      username: "superadmin",
      passwordHash: adminPassword,
      role: "ADMIN",
      balance: 10000.0,
      apiKey: "smm_live_adm_" + Math.random().toString(36).substring(2, 15),
    },
  });
  console.log("✅ Admin seeded:", admin.email);

  const demoPassword = await bcrypt.hash("demo12345password", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@smmpanel.com" },
    update: {},
    create: {
      email: "demo@smmpanel.com",
      username: "demouser",
      passwordHash: demoPassword,
      role: "USER",
      balance: 500.0,
      apiKey: "smm_live_usr_" + Math.random().toString(36).substring(2, 15),
    },
  });
  console.log("✅ Demo customer seeded:", demoUser.email);

  // 2. Seed Providers
  const mockProvider = await prisma.provider.create({
    data: {
      name: "Mock Sandbox Engine (100% Free Sandbox Test)",
      apiUrl: "MOCK_PROVIDER",
      apiKey: "mock_api_key_sandbox_9981",
      balance: 50000.0,
      currency: "INR",
      status: "ACTIVE",
      isDefault: true,
    },
  });

  const indianSmartProvider = await prisma.provider.create({
    data: {
      name: "IndianSmartPanel (Production Live)",
      apiUrl: "https://indiansmartpanel.com/api/v2",
      apiKey: "pwn91ghifeacreaukihjrq7f5574p8tw4qllc1iu",
      balance: 0.0,
      currency: "USD",
      status: "ACTIVE",
      isDefault: true,
    },
  });

  const peakerrProvider = await prisma.provider.create({
    data: {
      name: "Peakerr Wholesale API (Production Live)",
      apiUrl: "https://peakerr.com/api/v2",
      apiKey: "e9e1cd7846befb996e25b4303e22b251",
      balance: 0.0,
      currency: "USD",
      status: "ACTIVE",
      isDefault: false,
    },
  });

  console.log("✅ Providers seeded");

  // 3. Seed Categories & Services
  const categoriesData = [
    {
      name: "Instagram Followers [High Quality]",
      platform: "INSTAGRAM",
      icon: "Instagram",
      sortOrder: 1,
      services: [
        {
          name: "Instagram Followers [Real Looking] [30-Day Auto Refill] [Speed: 20K/Day]",
          providerServiceId: "101",
          wholesaleRate: 38.0,
          sellRate: 75.0,
          minQuantity: 50,
          maxQuantity: 100000,
          speedBadge: "⚡ 5K-20K/Day",
          guaranteeBadge: "🛡️ 30-Day Auto Refill",
          qualityRating: 99,
          description: "High Quality Instagram followers with profile pictures, bios, and posts. Safe for all accounts. Link format: https://instagram.com/username",
        },
        {
          name: "Instagram Indian Followers [Real Active] [Non-Drop Guarantee] [VIP]",
          providerServiceId: "102",
          wholesaleRate: 65.0,
          sellRate: 120.0,
          minQuantity: 20,
          maxQuantity: 50000,
          speedBadge: "⚡ Instant (0-10 min)",
          guaranteeBadge: "🛡️ Lifetime Non-Drop",
          qualityRating: 98,
          description: "Targeted Indian profiles with active story updates. Best for brand collaboration accounts.",
        },
      ],
    },
    {
      name: "Instagram Likes & Reels Views",
      platform: "INSTAGRAM",
      icon: "Instagram",
      sortOrder: 2,
      services: [
        {
          name: "Instagram Likes [Super Instant] [HQ Accounts] [Non-Drop]",
          providerServiceId: "103",
          wholesaleRate: 8.5,
          sellRate: 20.0,
          minQuantity: 10,
          maxQuantity: 200000,
          speedBadge: "⚡ Instant Start (0-2 min)",
          guaranteeBadge: "🛡️ Non-Drop Guarantee",
          qualityRating: 100,
          description: "Start time: Instant. Delivery speed: 50k/hour. Safe for monetization & reach exploration.",
        },
        {
          name: "Instagram Reels Views + Reach + Impressions [Viral Algorithm Push]",
          providerServiceId: "104",
          wholesaleRate: 2.0,
          sellRate: 8.0,
          minQuantity: 100,
          maxQuantity: 10000000,
          speedBadge: "⚡ 1 Million/Day Speed",
          guaranteeBadge: "🛡️ Zero Drop",
          qualityRating: 99,
          description: "Helps push your reel to explore page with real impression metrics.",
        },
      ],
    },
    {
      name: "YouTube Views & Watch Time",
      platform: "YOUTUBE",
      icon: "Youtube",
      sortOrder: 3,
      services: [
        {
          name: "YouTube Views [High Retention 5-10 Min] [Monetizable] [Non-Drop]",
          providerServiceId: "201",
          wholesaleRate: 75.0,
          sellRate: 140.0,
          minQuantity: 500,
          maxQuantity: 1000000,
          speedBadge: "⚡ 5K-10K/Day",
          guaranteeBadge: "🛡️ Lifetime Guarantee",
          qualityRating: 97,
          description: "Safe for AdSense & channel monetization. Real traffic source through suggested videos & search.",
        },
        {
          name: "YouTube 4000 Hours Watch Time [60+ Min Video Required] [Monetization Pack]",
          providerServiceId: "202",
          wholesaleRate: 450.0,
          sellRate: 850.0,
          minQuantity: 1000,
          maxQuantity: 4000,
          speedBadge: "⚡ 2-4 Days Completion",
          guaranteeBadge: "🛡️ 100% Monetization Safe",
          qualityRating: 99,
          description: "1000 quantity = 1000 hours of watch time. Minimum video length should be 60 minutes.",
        },
        {
          name: "YouTube Subscribers [Non-Drop Real Profiles] [30-Day Refill]",
          providerServiceId: "203",
          wholesaleRate: 180.0,
          sellRate: 350.0,
          minQuantity: 50,
          maxQuantity: 50000,
          speedBadge: "⚡ 100-300/Day Natural",
          guaranteeBadge: "🛡️ 30-Day Refill Button",
          qualityRating: 96,
          description: "Natural organic-speed delivery to keep YouTube algorithm healthy and non-suspicious.",
        },
      ],
    },
    {
      name: "Telegram Members & Post Views",
      platform: "TELEGRAM",
      icon: "Send",
      sortOrder: 4,
      services: [
        {
          name: "Telegram Channel Members [Global HQ] [Zero Drop] [Fast]",
          providerServiceId: "301",
          wholesaleRate: 28.0,
          sellRate: 60.0,
          minQuantity: 50,
          maxQuantity: 100000,
          speedBadge: "⚡ 50K/Day Speed",
          guaranteeBadge: "🛡️ 30-Day Refill",
          qualityRating: 99,
          description: "Instant start. High quality accounts with names and avatars. Public or Private invite link accepted.",
        },
        {
          name: "Telegram Post Views [Last 10 Posts Auto-Views]",
          providerServiceId: "302",
          wholesaleRate: 3.5,
          sellRate: 12.0,
          minQuantity: 100,
          maxQuantity: 500000,
          speedBadge: "⚡ Instant",
          guaranteeBadge: "🛡️ Permanent Views",
          qualityRating: 100,
          description: "Add instant views to your recent posts for social proof.",
        },
      ],
    },
    {
      name: "Facebook Page Likes & Followers",
      platform: "FACEBOOK",
      icon: "Facebook",
      sortOrder: 5,
      services: [
        {
          name: "Facebook Page Likes + Followers [HQ Profiles] [30-Day Refill]",
          providerServiceId: "401",
          wholesaleRate: 55.0,
          sellRate: 110.0,
          minQuantity: 50,
          maxQuantity: 100000,
          speedBadge: "⚡ 5K/Day",
          guaranteeBadge: "🛡️ 30-Day Refill",
          qualityRating: 96,
          description: "Both Page Likes and Page Followers will increase simultaneously.",
        },
      ],
    },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        platform: cat.platform,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
    });

    for (const srv of cat.services) {
      await prisma.service.create({
        data: {
          name: srv.name,
          categoryId: category.id,
          providerId: mockProvider.id,
          providerServiceId: srv.providerServiceId,
          wholesaleRate: srv.wholesaleRate,
          sellRate: srv.sellRate,
          minQuantity: srv.minQuantity,
          maxQuantity: srv.maxQuantity,
          speedBadge: srv.speedBadge,
          guaranteeBadge: srv.guaranteeBadge,
          qualityRating: srv.qualityRating,
          description: srv.description,
          dripfeedSupported: false,
          cancelSupported: true,
          refillSupported: true,
          status: "ACTIVE",
        },
      });
    }
  }

  // 4. Seed a sample transaction for demo
  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: "DEPOSIT",
      amount: 500.0,
      balanceAfter: 500.0,
      method: "UPI_QR",
      status: "APPROVED",
      utrNumber: "UPI2026090019283",
      notes: "Welcome bonus demo balance",
    },
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
