const API_URL =
  process.env.VIPSMM_API_URL || "https://vipsmmpro.com/api/v2";

const API_KEY = process.env.VIPSMM_API_KEY || "";

if (!API_KEY) {
  throw new Error("VIPSMM_API_KEY is not configured.");
}

export type VipsmmService = {
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

async function vipsmmRequest(body: URLSearchParams) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `VIPSMMPro API returned HTTP ${response.status}.`
    );
  }

  return response.json();
}

export async function getVipsmmServices(): Promise<VipsmmService[]> {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "services",
  });

  const data = await vipsmmRequest(body);

  if (!Array.isArray(data)) {
    throw new Error(
      data?.error || "VIPSMMPro returned an invalid service list."
    );
  }

  return data;
}

export async function getVipsmmService(
  serviceId: string
): Promise<VipsmmService> {
  const id = serviceId.trim();

  if (!id) {
    throw new Error("VIPSMMPro service ID is required.");
  }

  const services = await getVipsmmServices();

  const service = services.find(
    (item) => String(item.service) === id
  );

  if (!service) {
    throw new Error(
      `VIPSMMPro service ${id} was not found.`
    );
  }

  return service;
}

export async function addVipsmmOrder({
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

  const data = await vipsmmRequest(body);

  if (data.error || data.order === undefined) {
    throw new Error(
      data.error ||
        "VIPSMMPro did not return an order ID."
    );
  }

  return {
    providerOrderId: String(data.order),
  };
}

export async function getVipsmmOrderStatus(
  providerOrderId: string
) {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "status",
    order: providerOrderId,
  });

  const data = await vipsmmRequest(body);

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

export async function getVipsmmBalance() {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "balance",
  });

  const data = await vipsmmRequest(body);

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    balance: Number(data.balance),
    currency: String(data.currency || ""),
  };
}

