import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getCategory(service: {
  name: string;
  platform: string;
}) {
  const name = service.name.toLowerCase();
  const platform = service.platform.toLowerCase();

  if (platform === "instagram" || name.includes("instagram") || name.includes("instgram")) {
    if (name.includes("story")) return "Instagram Story Views";
    if (name.includes("comment")) return "Instagram Comments";
    if (name.includes("share")) return "Instagram Shares";
    if (name.includes("repost")) return "Instagram Reposts";
    if (name.includes("save")) return "Instagram Saves";
    if (name.includes("follower")) return "Instagram Followers";
    if (name.includes("like")) return "Instagram Likes";
    if (name.includes("view")) return "Instagram Views";
  }

  if (platform === "youtube" || name.includes("youtube") || name.includes("yt -") || name.startsWith("yt ")) {
    if (name.includes("subscriber")) return "YouTube Subscribers";
    if (name.includes("live")) return "YouTube Live Stream";
    if (name.includes("like")) return "YouTube Likes";
    if (name.includes("view")) return "YouTube Views";
  }

  if (platform === "facebook" || name.includes("facebook")) {
    if (name.includes("follower")) return "Facebook Followers";
    if (
      name.includes("like") ||
      name.includes("reaction") ||
      name.includes("love") ||
      name.includes("haha") ||
      name.includes("wow") ||
      name.includes("angry")
    ) return "Facebook Likes & Reactions";
    if (name.includes("view")) return "Facebook Views";
  }

  if (platform === "telegram" || name.includes("telegram")) {
    if (name.includes("member")) return "Telegram Members";
    if (name.includes("view")) return "Telegram Post Views";
  }

  if (platform === "tiktok" || name.includes("tiktok")) {
    if (name.includes("like")) return "TikTok Likes";
    if (name.includes("view")) return "TikTok Views";
    if (name.includes("follower")) return "TikTok Followers";
  }

  if (platform === "linkedin" || name.includes("linkedin")) {
    if (name.includes("follower")) return "LinkedIn Followers";
  }

  if (
    platform === "x" ||
    platform === "twitter" ||
    name.includes("twitter") ||
    name.includes("tweet")
  ) {
    if (name.includes("view")) return "X Views";
  }

  if (name.includes("whatsapp")) {
    if (name.includes("member")) return "WhatsApp Channel Members";
  }

  return null;
}

export async function POST() {
  const services = await prisma.service.findMany({
    select: {
      id: true,
      name: true,
      platform: true,
      category: true,
    },
  });

  const uncategorized = services.filter((service) => !service.category?.trim());

  let maxSort = 0;

  const lastCategory = await prisma.category.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  maxSort = lastCategory?.sortOrder ?? 0;

  const results = [];

  for (const service of uncategorized) {
    const categoryName = getCategory(service);

    if (!categoryName) {
      results.push({
        id: service.id,
        name: service.name,
        category: null,
        status: "skipped",
      });
      continue;
    }

    let category = await prisma.category.findFirst({
      where: {
        name: categoryName,
      },
    });

    if (!category) {
      maxSort++;

      category = await prisma.category.create({
        data: {
          name: categoryName,
          platform: service.platform || "Other",
          enabled: true,
          sortOrder: maxSort,
        },
      });
    }

    await prisma.service.update({
      where: { id: service.id },
      data: {
        category: category.name,
      },
    });

    results.push({
      id: service.id,
      name: service.name,
      category: category.name,
      status: "updated",
    });
  }

  return NextResponse.json({
    totalUncategorized: uncategorized.length,
    updated: results.filter((x) => x.status === "updated").length,
    skipped: results.filter((x) => x.status === "skipped").length,
    results,
  });
}
