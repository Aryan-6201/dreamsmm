const API_URL =
  process.env.MICOSMM_API_URL || "https://micosmm.com/api/v2";

const API_KEY: string = process.env.MICOSMM_API_KEY || "";

if (!API_KEY) {
  throw new Error("MICOSMM_API_KEY is not configured.");
}

export async function addMicoSmmOrder({
  serviceId,
  link,
  quantity,
}: {
  serviceId: string;
  link: string;
  quantity: number;
}) {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "add",
    service: serviceId,
    link,
    quantity: String(quantity),
  });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`MicoSMM API returned HTTP ${response.status}.`);
  }

  const data = await response.json();

  if (data.error || data.order === undefined) {
    throw new Error(
      data.error || "MicoSMM did not return a provider order ID."
    );
  }

  return {
    providerOrderId: String(data.order),
  };
}

export async function getMicoSmmOrderStatus(
  providerOrderId: string
) {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "status",
    order: providerOrderId,
  });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`MicoSMM API returned HTTP ${response.status}.`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    status: data.status || "Unknown",
    startCount:
      data.start_count !== undefined
        ? Number(data.start_count)
        : null,
    remains:
      data.remains !== undefined
        ? Number(data.remains)
        : null,
    charge:
      data.charge !== undefined
        ? String(data.charge)
        : null,
  };
}