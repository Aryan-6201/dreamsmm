import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#faf9ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-purple-600 p-8 text-white shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-100">
            DreamSMM Blog
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Tips, Guides & Social Media Growth
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium text-violet-100">
            Learn more about social media growth, Instagram, YouTube and
            digital marketing.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-violet-100 bg-white p-12 text-center shadow-sm">
            <div className="text-4xl">✍️</div>
            <h2 className="mt-4 text-xl font-black text-slate-800">
              No articles yet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              New articles will appear here soon.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 text-5xl">
                    📝
                  </div>
                )}

                <div className="p-6">
                  {post.category && (
                    <span className="text-xs font-black uppercase tracking-wider text-violet-600">
                      {post.category}
                    </span>
                  )}

                  <h2 className="mt-2 text-xl font-black text-slate-800">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {post.excerpt}
                    </p>
                  )}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-700"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
