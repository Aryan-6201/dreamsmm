const API_URL =
  process.env.MICOSMM_API_URL || "https://micosmm.com/api/v2";

const API_KEY: string = process.env.MICOSMM_API_KEY || "";

if (!API_KEY) {
  throw new Error("MICOSMM_API_KEY is not configured.");
}

type MicoSmmService = {
  service: string | number;
  name: string;
  type?: string;
  category?: string;
  description?: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  refill?: boolean | string;
  cancel?: boolean | string;
};

async function micoRequest(body: URLSearchParams) {
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

  return response.json();
}

/**
 * Add an order to MicoSMM
 */
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

  const data = await micoRequest(body);

  if (data.error || data.order === undefined) {
    throw new Error(
      data.error || "MicoSMM did not return a provider order ID."
    );
  }

  return {
    providerOrderId: String(data.order),
  };
}

/**
 * Get MicoSMM order status
 */
export async function getMicoSmmOrderStatus(
  providerOrderId: string
) {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "status",
    order: providerOrderId,
  });

  const data = await micoRequest(body);

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

/**
 * Get ALL services from MicoSMM
 */
export async function getMicoSmmServices(): Promise<MicoSmmService[]> {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "services",
  });

  const data = await micoRequest(body);

  if (!Array.isArray(data)) {
    throw new Error(
      data?.error || "MicoSMM returned an invalid service list."
    );
  }

  return data;
}

/**
 * Get ONE service by MicoSMM service ID
 *
 * Example:
 * getMicoSmmService("12345")
 */
export async function getMicoSmmService(
  serviceId: string
): Promise<MicoSmmService> {
  if (!serviceId.trim()) {
    throw new Error("MicoSMM service ID is required.");
  }

  const services = await getMicoSmmServices();

  const service = services.find(
    (item) => String(item.service) === serviceId.trim()
  );

  if (!service) {
    throw new Error(
      `MicoSMM service ${serviceId} was not found.`
    );
  }

  return service;
}