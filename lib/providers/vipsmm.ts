const API_URL =
  process.env.VIPSMM_API_URL || "https://vipsmm.net/api/v2";

const API_KEY: string = process.env.VIPSMM_API_KEY || "";

if (!API_KEY) {
  throw new Error("VIPSMM_API_KEY is not configured.");
}

type VipSmmService = {
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

async function vipRequest(body: URLSearchParams) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`VIPSMM API returned HTTP ${response.status}.`);
  }

  return response.json();
}

/**
 * Add an order to VIPSMM
 */
export async function addVipSmmOrder({
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

  const data = await vipRequest(body);

  if (data.error || data.order === undefined) {
    throw new Error(
      data.error || "VIPSMM did not return a provider order ID."
    );
  }

  return {
    providerOrderId: String(data.order),
  };
}

/**
 * Get VIPSMM order status
 */
export async function getVipSmmOrderStatus(
  providerOrderId: string
) {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "status",
    order: providerOrderId,
  });

  const data = await vipRequest(body);

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
 * Get ALL services from VIPSMM
 */
export async function getVipSmmServices(): Promise<VipSmmService[]> {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "services",
  });

  const data = await vipRequest(body);

  if (!Array.isArray(data)) {
    throw new Error(
      data?.error || "VIPSMM returned an invalid service list."
    );
  }

  return data;
}

/**
 * Get ONE service by VIPSMM service ID
 */
export async function getVipSmmService(
  serviceId: string
): Promise<VipSmmService> {
  if (!serviceId.trim()) {
    throw new Error("VIPSMM service ID is required.");
  }

  const services = await getVipSmmServices();

  const service = services.find(
    (item) => String(item.service) === serviceId.trim()
  );

  if (!service) {
    throw new Error(
      `VIPSMM service ${serviceId} was not found.`
    );
  }

  return service;
}
/**
 * Create a refill request on VIPSMM
 */
export async function createVipSmmRefill(providerOrderId: string) {
  if (!providerOrderId.trim()) {
    throw new Error("VIPSMM provider order ID is required.");
  }

  const body = new URLSearchParams({
    key: API_KEY,
    action: "refill",
    order: providerOrderId.trim(),
  });

  const data = await vipRequest(body);

  if (data.error) {
    throw new Error(data.error);
  }

  if (data.refill === undefined || data.refill === null) {
    throw new Error(
      "VIPSMM did not return a refill request ID."
    );
  }

  return {
    refillId: String(data.refill),
  };
}
