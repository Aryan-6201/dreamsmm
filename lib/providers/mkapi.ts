const API_URL =
  process.env.MKAPI_API_URL || "https://mkapiservices.com/api/v2";

const API_KEY = process.env.MKAPI_API_KEY || "";

if (!API_KEY) {
  throw new Error("MKAPI_API_KEY is not configured.");
}

export type MkapiService = {
  service: string | number;
  name: string;
  type?: string;
  category?: string;
  description?: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  refill?: boolean | string;
};

async function mkapiRequest(body: URLSearchParams) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const text = await response.text();

  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `MKAPI returned HTTP ${response.status}: ${text.slice(0, 300)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      `MKAPI returned HTTP ${response.status}: ${
        data?.error || data?.message || "API error"
      }`
    );
  }

  if (data?.error) {
    throw new Error(`MKAPI error: ${data.error}`);
  }

  return data;
}

export async function getMkapiServices(): Promise<MkapiService[]> {
  const data = await mkapiRequest(
    new URLSearchParams({
      key: API_KEY,
      action: "services",
    })
  );

  if (!Array.isArray(data)) {
    throw new Error("MKAPI returned an invalid service list.");
  }

  return data;
}

export async function getMkapiService(serviceId: string) {
  const id = serviceId.trim();

  const services = await getMkapiServices();

  const service = services.find(
    (item) => String(item.service) === id
  );

  if (!service) {
    throw new Error(`MKAPI service ${id} was not found.`);
  }

  return service;
}

export async function addMkapiOrder({
  serviceId,
  link,
  quantity,
}: {
  serviceId: string;
  link: string;
  quantity: number;
}) {
  const data = await mkapiRequest(
    new URLSearchParams({
      key: API_KEY,
      action: "add",
      service: serviceId,
      link,
      quantity: String(quantity),
    })
  );

  if (data.order === undefined) {
    throw new Error(data.error || "MKAPI did not return an order ID.");
  }

  return {
    providerOrderId: String(data.order),
  };
}

export async function getMkapiOrderStatus(
  providerOrderId: string
) {
  const data = await mkapiRequest(
    new URLSearchParams({
      key: API_KEY,
      action: "status",
      order: providerOrderId,
    })
  );

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

export async function getMkapiBalance() {
  const data = await mkapiRequest(
    new URLSearchParams({
      key: API_KEY,
      action: "balance",
    })
  );

  return {
    balance: Number(data.balance),
    currency: String(data.currency || ""),
  };
}