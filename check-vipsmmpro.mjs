import { PrismaClient } from "./app/generated/prisma/client.ts";

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
    where: {
      providerName: {
        contains: "VIPSMMPro",
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      name: true,
      category: true,
      providerName: true
    }
  });

  console.log("\n=== VIPSMMPro SERVICES ===");
  console.log("Total:", services.length);

  const categories = {};
  for (const s of services) {
    const c = s.category || "(No Category)";
    categories[c] = (categories[c] || 0) + 1;
  }

  console.log("\n=== CATEGORIES ===");
  console.table(categories);

  console.log("\n=== SERVICES ===");
  console.table(services);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
