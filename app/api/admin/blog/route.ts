import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

export async function GET() {
  const admin = await getAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const admin = await getAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const title = String(body.title || "").trim();
    const slug = String(body.slug || "").trim();
    const content = String(body.content || "").trim();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug and content are required." },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: body.excerpt
          ? String(body.excerpt).trim()
          : null,
        content,
        coverImage: body.coverImage
          ? String(body.coverImage).trim()
          : null,
        category: body.category
          ? String(body.category).trim()
          : null,
        published: Boolean(body.published),
        authorId: admin.id,
        authorName: admin.name || admin.email,
        publishedAt: body.published ? new Date() : null,
      },
    });

    return NextResponse.json(
      { success: true, post },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create blog post error:", error);

    return NextResponse.json(
      { error: "Could not create blog post." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const admin = await getAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid post ID." },
        { status: 400 }
      );
    }

    const published = Boolean(body.published);

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: String(body.title || "").trim(),
        slug: String(body.slug || "").trim(),
        excerpt: body.excerpt
          ? String(body.excerpt).trim()
          : null,
        content: String(body.content || "").trim(),
        coverImage: body.coverImage
          ? String(body.coverImage).trim()
          : null,
        category: body.category
          ? String(body.category).trim()
          : null,
        published,
        publishedAt: published
          ? body.publishedAt
            ? new Date(body.publishedAt)
            : new Date()
          : null,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Update blog post error:", error);

    return NextResponse.json(
      { error: "Could not update blog post." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await getAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid post ID." },
        { status: 400 }
      );
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete blog post error:", error);

    return NextResponse.json(
      { error: "Could not delete blog post." },
      { status: 500 }
    );
  }
}
