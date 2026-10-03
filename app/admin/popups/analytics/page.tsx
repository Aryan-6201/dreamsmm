"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Analytics = {
  id: number;
  title: string;
  active: boolean;
  createdAt: string;
  views: number;
  clicks: number;
  dismisses: number;
  ctr: number;
};

export default function PopupAnalyticsPage() {
  const [data, setData] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/popups/analytics", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load analytics.");
      }

      setData(result.analytics || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load popup analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totals = useMemo(() => {
    const views = data.reduce((sum, item) => sum + item.views, 0);
    const clicks = data.reduce((sum, item) => sum + item.clicks, 0);
    const dismisses = data.reduce((sum, item) => sum + item.dismisses, 0);

    return {
      views,
      clicks,
      dismisses,
      ctr: views > 0 ? Number(((clicks / views) * 100).toFixed(2)) : 0,
    };
  }, [data]);

  const topPopup = useMemo(() => {
    return [...data].sort((a, b) => b.views - a.views)[0] || null;
  }, [data]);

  return (
    <main className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,.7)]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-600">
                  DreamSMM Control Center
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                Popup Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track popup views, clicks, dismissals and conversion.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadAnalytics}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:text-cyan-700"
              >
                Refresh
              </button>

              <Link
                href="/admin/popups"
                className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                Popup Manager
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-7 lg:px-8">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Views"
            value={totals.views}
            icon="◉"
            description="Popup impressions"
          />

          <StatCard
            label="Total Clicks"
            value={totals.clicks}
            icon="↗"
            description="CTA interactions"
          />

          <StatCard
            label="Dismissals"
            value={totals.dismisses}
            icon="×"
            description="Users who closed"
          />

          <StatCard
            label="Overall CTR"
            value={`${totals.ctr}%`}
            icon="%"
            description="Clicks ÷ views"
          />
        </div>

        {topPopup && (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,.06)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-600">
                    Most Viewed
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {topPopup.title}
                  </h2>
                </div>

                <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-right">
                  <div className="text-2xl font-black text-cyan-700">
                    {topPopup.views}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">
                    Views
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-100 sm:grid-cols-4">
              <MiniMetric label="Views" value={topPopup.views} />
              <MiniMetric label="Clicks" value={topPopup.clicks} />
              <MiniMetric label="Dismissed" value={topPopup.dismisses} />
              <MiniMetric label="CTR" value={`${topPopup.ctr}%`} />
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,.06)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-black text-slate-950">
              Popup Performance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Individual performance for every popup.
            </p>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">📊</div>
              <h3 className="mt-3 text-lg font-black text-slate-900">
                No analytics yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Create a popup and let users interact with it.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Popup
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Views
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Clicks
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Dismissed
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      CTR
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((popup) => (
                    <tr
                      key={popup.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900">
                          {popup.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          #{popup.id} ·{" "}
                          {new Date(popup.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${
                            popup.active
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {popup.active ? "Live" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-5 font-bold text-slate-800">
                        {popup.views}
                      </td>

                      <td className="px-4 py-5 font-bold text-slate-800">
                        {popup.clicks}
                      </td>

                      <td className="px-4 py-5 font-bold text-slate-800">
                        {popup.dismisses}
                      </td>

                      <td className="px-4 py-5">
                        <span className="inline-flex rounded-xl bg-cyan-50 px-3 py-1.5 text-sm font-black text-cyan-700">
                          {popup.ctr}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: string | number;
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_15px_50px_rgba(15,23,42,.05)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </div>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-lg font-black text-cyan-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="px-5 py-4">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-lg font-black text-slate-900">{value}</div>
    </div>
  );
}