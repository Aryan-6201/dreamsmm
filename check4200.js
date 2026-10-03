const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const service = await prisma.service.findUnique({
    where: { id: 4200 },
    select: {
      id: true,
      name: true,
      category: true,
      platform: true,
    },
  });

  console.log(JSON.stringify(service, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
