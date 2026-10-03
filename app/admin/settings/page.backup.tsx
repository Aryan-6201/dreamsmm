"use client";

import { useEffect, useState } from "react";

type Settings = {
  payment_upi_id: string;
  payment_name: string;
  payment_qr: string;
};

const DEFAULT_SETTINGS: Settings = {
  payment_upi_id: "aryan251@ybl",
  payment_name: "Aryan",
  payment_qr: "/qr.jpeg",
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
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Payment Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the UPI details and QR code displayed on the funds page.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
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
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
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
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                QR Code
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-gray-50">
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

                <span className="text-xs text-gray-500">
                  JPG, PNG or WEBP • Max 5 MB
                </span>
              </div>

              <p className="mt-2 break-all text-xs text-gray-500">
                Current QR: {settings.payment_qr}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-3 block text-sm font-medium">
                QR Preview
              </label>

              <div className="flex min-h-64 items-center justify-center rounded-2xl border bg-gray-50 p-6">
                {settings.payment_qr ? (
                  <img
                    src={settings.payment_qr}
                    alt="Payment QR"
                    className="h-56 w-56 rounded-xl object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-500">
                    No QR image configured.
                  </p>
                )}
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-6 rounded-xl border px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="rounded-xl px-6 py-3 font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Payment Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
