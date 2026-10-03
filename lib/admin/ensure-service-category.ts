import { prisma } from "@/lib/prisma";

export function normalizeCategoryName(
  value: string | null | undefined
) {
  return (value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

export async function ensureServiceCategory(
  categoryName: string | null | undefined,
  platform: string | null | undefined
) {
  const name = normalizeCategoryName(categoryName);

  const finalPlatform =
    normalizeCategoryName(platform) || "Other";

  const finalName =
    name || finalPlatform || "Other Services";

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      platform: true,
      enabled: true,
      sortOrder: true,
    },
  });

  const existing = categories.find(
    (category) =>
      normalizeCategoryName(category.name).toLowerCase() ===
      finalName.toLowerCase()
  );

  if (existing) {
    return existing;
  }

  return prisma.category.create({
    data: {
      name: finalName,
      platform: finalPlatform,
      enabled: true,
      sortOrder: 0,
    },
  });
}
