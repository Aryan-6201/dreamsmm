import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.service.createMany({
    data: [
      {
        name: "Instagram Followers",
        platform: "Instagram",
        description: "High quality Instagram followers",
        rate: 1.5,
        min: 100,
        max: 10000,
        enabled: true,
        refill: false,
      },
      {
        name: "Instagram Likes",
        platform: "Instagram",
        description: "Instagram post likes",
        rate: 2,
        min: 50,
        max: 5000,
        enabled: true,
        refill: false,
      },
      {
        name: "Instagram Views",
        platform: "Instagram",
        description: "Instagram reel/video views",
        rate: 0.5,
        min: 100,
        max: 100000,
        enabled: true,
        refill: false,
      },
      {
        name: "YouTube Views",
        platform: "YouTube",
        description: "YouTube video views",
        rate: 3,
        min: 100,
        max: 10000,
        enabled: true,
        refill: false,
      },
    ],
  });

  console.log("Services created successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });