"use client";

import { useEffect, useState } from "react";

type Settings = {
  payment_upi_id: string;
  payment_name: string;
  payment_qr: string;
  payment_description: string;
};

const DEFAULT_SETTINGS: Settings = {
  payment_upi_id: "aryan251@ybl",
  payment_name: "Aryan",
  payment_qr: "/qr.jpeg",
  payment_description: "Scan the QR code using any UPI app and complete your payment. After payment, enter the exact UTR / Transaction ID below and submit your deposit request.",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadSettings() {
    try {
      const response = await fetch("/api/admin/payment-settings", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load settings.");
        return;
      }

      setSettings(data.settings || DEFAULT_SETTINGS);
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function uploadQr(file: File) {
    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/payment-settings/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not upload QR image.");
        return;
      }

      setSettings((current) => ({
        ...current,
        payment_qr: data.payment_qr,
      }));

      setMessage("QR image uploaded successfully.");
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setUploading(false);
    }
  }
  async function saveSettings() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not save settings.");
        return;
      }

      setSettings(data.settings);
      setMessage("Payment settings updated successfully.");
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading payment settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Payment Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage the UPI details and QR code displayed on the funds page.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                UPI ID
              </label>

              <input
                value={settings.payment_upi_id}
                onChange={(e) =>
                  setSettings((current) => ({
                    ...current,
                    payment_upi_id: e.target.value,
                  }))
                }
                placeholder="example@upi"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Payment Name
              </label>

              <input
                value={settings.payment_name}
                onChange={(e) =>
                  setSettings((current) => ({
                    ...current,
                    payment_name: e.target.value,
                  }))
                }
                placeholder="Account holder name"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Payment Description / Instructions
              </label>

              <textarea
                value={settings.payment_description}
                onChange={(e) =>
                  setSettings((current) => ({
                    ...current,
                    payment_description: e.target.value,
                  }))
                }
                rows={5}
                placeholder="Enter payment instructions shown below the QR code..."
                className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              />

              <p className="mt-2 text-xs text-slate-500">
                This text will appear below the QR code on the Add Funds page.
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                QR Code
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-xl border border-teal-400/30 bg-teal-500/10 px-5 py-3 text-sm font-bold text-teal-300 transition hover:bg-teal-500/20">
                  {uploading ? "Uploading..." : "Upload New QR"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadQr(file);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>

                <span className="text-xs text-slate-400">
                  JPG, PNG or WEBP • Max 5 MB
                </span>
              </div>

              <p className="mt-2 break-all text-xs text-slate-400">
                Current QR: {settings.payment_qr}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-3 block text-sm font-medium">
                QR Preview
              </label>

              <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 p-6">
                {settings.payment_qr ? (
                  <img
                    src={settings.payment_qr}
                    alt="Payment QR"
                    className="h-60 w-60 rounded-2xl border border-white/10 bg-white p-2 object-contain shadow-2xl shadow-black/40"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <p className="text-sm text-slate-500">
                    No QR image configured.
                  </p>
                )}
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-6 rounded-xl border border-teal-400/20 bg-teal-500/10 px-4 py-3 text-sm font-medium text-teal-200">
              {message}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="rounded-xl bg-teal-500 px-6 py-3 font-bold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-400 hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Payment Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
