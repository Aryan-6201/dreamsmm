"use client";

import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  published: boolean;
  authorName: string | null;
  createdAt: string;
  publishedAt: string | null;
};

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "",
  published: false,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadPosts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/blog", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load posts.");
      }

      setPosts(data.posts || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load blog posts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function makeSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
  }

  function editPost(post: Post) {
    setEditingId(post.id);

    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      coverImage: post.coverImage || "",
      category: post.category || "",
      published: post.published,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function savePost() {
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    if (!form.content.trim()) {
      setError("Content is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/blog", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not save post."
        );
      }

      setMessage(
        editingId
          ? "Post updated successfully."
          : "Post created successfully."
      );

      resetForm();
      await loadPosts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save post."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id: number) {
    if (!confirm("Delete this blog post permanently?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not delete post."
        );
      }

      setMessage("Post deleted.");
      await loadPosts();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete post."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-purple-600 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-200">
                Content Management
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Blog
              </h1>

              <p className="mt-2 max-w-xl text-sm font-medium text-violet-100">
                Create, publish and manage DreamSMM blog posts.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs text-violet-200">
                Total Posts
              </p>
              <p className="text-2xl font-black">
                {posts.length}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">
            {message}
          </div>
        )}

        {/* Editor */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {editingId ? "Edit Post" : "Create New Post"}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {editingId
                  ? `Editing post #${editingId}`
                  : "Write a new article for your customers."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">

            {/* Title */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Title
              </label>

              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;

                  setForm((current) => ({
                    ...current,
                    title,
                    slug:
                      editingId || current.slug
                        ? current.slug
                        : makeSlug(title),
                  }));
                }}
                placeholder="How to grow your Instagram account"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Slug
              </label>

              <input
                value={form.slug}
                onChange={(e) =>
                  updateField("slug", makeSlug(e.target.value))
                }
                placeholder="how-to-grow-instagram"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Category
              </label>

              <input
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value)
                }
                placeholder="Instagram"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {/* Excerpt */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Short Description
              </label>

              <textarea
                value={form.excerpt}
                onChange={(e) =>
                  updateField("excerpt", e.target.value)
                }
                rows={3}
                placeholder="A short description shown on the blog listing..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {/* Cover */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Cover Image URL
              </label>

              <input
                value={form.coverImage}
                onChange={(e) =>
                  updateField("coverImage", e.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {/* Content */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Content
              </label>

              <textarea
                value={form.content}
                onChange={(e) =>
                  updateField("content", e.target.value)
                }
                rows={14}
                placeholder="Write your article here..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 font-medium outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Plain text is supported for now. The public blog will preserve line breaks.
              </p>
            </div>

            {/* Publish */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
              <div>
                <p className="text-sm font-black text-slate-800">
                  Publish this post
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Published posts will appear on the public blog.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateField("published", !form.published)
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  form.published
                    ? "bg-violet-600"
                    : "bg-slate-300"
                }`}
                aria-label="Toggle published"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    form.published
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={savePost}
              disabled={saving}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Post"
                  : "Create Post"}
            </button>
          </div>
        </section>

        {/* Posts */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Your Posts
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Manage your existing articles.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPosts}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm font-semibold text-slate-400">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-14 text-center">
              <div className="text-4xl">✍️</div>
              <h3 className="mt-3 font-black text-slate-700">
                No posts yet
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Create your first blog post above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-black text-slate-800">
                        {post.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                          post.published
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {post.published
                          ? "Published"
                          : "Draft"}
                      </span>

                      {post.category && (
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-black text-violet-700">
                          {post.category}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      /blog/{post.slug}
                    </p>

                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editPost(post)}
                      className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-black text-violet-600 hover:bg-violet-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
