"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  platform: string;
  icon: string;
  iconStyle: string;
  glowEnabled: boolean;
  glowIntensity: number;
  badge: string | null;
  description: string | null;
  enabled: boolean;
  sortOrder: number;
};

const emptyForm = {
  name: "",
  platform: "Instagram",
  icon: "Sparkles",
  iconStyle: "outline",
  glowEnabled: true,
  glowIntensity: 50,
  badge: "",
  description: "",
  enabled: true,
  sortOrder: 0,
};

const icons = [
  "Sparkles",
  "Heart",
  "Users",
  "UserPlus",
  "Eye",
  "MessageCircle",
  "Share2",
  "Bookmark",
  "Play",
  "Send",
];

const platforms = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Facebook",
  "Telegram",
  "Twitter",
  "Spotify",
  "LinkedIn",
  "Reddit",
  "Other",
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCategories() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load categories.");
      }

      setCategories(data.categories || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editCategory(category: Category) {
    setEditingId(category.id);

    setForm({
      name: category.name,
      platform: category.platform,
      icon: category.icon,
      iconStyle: category.iconStyle,
      glowEnabled: category.glowEnabled,
      glowIntensity: category.glowIntensity,
      badge: category.badge || "",
      description: category.description || "",
      enabled: category.enabled,
      sortOrder: category.sortOrder,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveCategory(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Category name is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            editingId
              ? {
                  id: editingId,
                  ...form,
                }
              : form
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save category."
        );
      }

      setMessage(
        editingId
          ? "Category updated successfully."
          : "Category created successfully."
      );

      resetForm();
      await loadCategories();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(category: Category) {
    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: category.id,
            enabled: !category.enabled,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update category."
        );
      }

      await loadCategories();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update category."
      );
    }
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/categories?id=${category.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to delete category."
        );
      }

      setMessage(`Category "${category.name}" deleted.`);
      await loadCategories();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete category."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#070a11] text-white">
      <header className="border-b border-white/[0.07] bg-[#090c14]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Dream<span className="text-blue-500">SMM</span>
            </h1>
            <p className="text-[11px] text-gray-500">
              Category Management
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 hover:bg-white/[0.08] hover:text-white"
          >
            ← Admin
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Control Center
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Categories
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Manage category icons, glow, badges and display order.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            {message}
          </div>
        )}

        <section className="rounded-2xl border border-white/[0.07] bg-[#0b0f18] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {editingId
                  ? "Edit Category"
                  : "Create Category"}
              </h3>

              <p className="mt-1 text-xs text-gray-600">
                Configure how the category appears on the dashboard.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={saveCategory}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Field label="Category Name">
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                placeholder="Instagram Followers"
                className="admin-input"
              />
            </Field>

            <Field label="Platform">
              <select
                value={form.platform}
                onChange={(event) =>
                  setForm({
                    ...form,
                    platform: event.target.value,
                  })
                }
                className="admin-input"
              >
                {platforms.map((platform) => (
                  <option key={platform}>{platform}</option>
                ))}
              </select>
            </Field>

            <Field label="Icon">
              <select
                value={form.icon}
                onChange={(event) =>
                  setForm({
                    ...form,
                    icon: event.target.value,
                  })
                }
                className="admin-input"
              >
                {icons.map((icon) => (
                  <option key={icon}>{icon}</option>
                ))}
              </select>
            </Field>

            <Field label="Icon Style">
              <select
                value={form.iconStyle}
                onChange={(event) =>
                  setForm({
                    ...form,
                    iconStyle: event.target.value,
                  })
                }
                className="admin-input"
              >
                <option value="outline">Outline</option>
                <option value="solid">Solid</option>
              </select>
            </Field>

            <Field label="Badge">
              <input
                value={form.badge}
                onChange={(event) =>
                  setForm({
                    ...form,
                    badge: event.target.value,
                  })
                }
                placeholder="HOT"
                className="admin-input"
              />
            </Field>

            <Field label="Sort Order">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm({
                    ...form,
                    sortOrder: Number(event.target.value),
                  })
                }
                className="admin-input"
              />
            </Field>

            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Describe this category..."
                  className="admin-input resize-none"
                />
              </Field>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <label className="flex cursor-pointer items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Glow Effect
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Show a glowing category icon.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.glowEnabled}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      glowEnabled: event.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-blue-500"
                />
              </label>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <label className="block">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">
                    Glow Intensity
                  </span>

                  <span className="text-sm text-blue-400">
                    {form.glowIntensity}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.glowIntensity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      glowIntensity: Number(
                        event.target.value
                      ),
                    })
                  }
                  className="mt-4 w-full accent-blue-500"
                />
              </label>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <label className="flex cursor-pointer items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Category Active
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Show this category to customers.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      enabled: event.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-blue-500"
                />
              </label>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Category"
                    : "Create Category"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Existing Categories
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                {categories.length} categories configured.
              </p>
            </div>

            <button
              onClick={loadCategories}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/[0.07] bg-[#0b0f18] p-8 text-center text-sm text-gray-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b0f18] p-10 text-center">
              <p className="font-semibold">
                No categories yet
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Create your first category above.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0b0f18] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-bold text-blue-400 ${
                        category.glowEnabled
                          ? "shadow-[0_0_24px_rgba(59,130,246,0.25)]"
                          : ""
                      }`}
                    >
                      {category.icon.slice(0, 2)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {category.name}
                        </h4>

                        {category.badge && (
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                            {category.badge}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-gray-600">
                        {category.platform} ·{" "}
                        {category.icon} · Order{" "}
                        {category.sortOrder}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        toggleCategory(category)
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        category.enabled
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {category.enabled
                        ? "Active"
                        : "Disabled"}
                    </button>

                    <button
                      onClick={() =>
                        editCategory(category)
                      }
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/[0.05]"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteCategory(category)
                      }
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.75rem 0.875rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }

        .admin-input:focus {
          border-color: rgba(59, 130, 246, 0.6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
        }

        .admin-input::placeholder {
          color: rgb(75, 85, 99);
        }

        select.admin-input option {
          background: #0b0f18;
          color: white;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}