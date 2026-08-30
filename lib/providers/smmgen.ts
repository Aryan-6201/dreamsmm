const API_URL =
  process.env.SMMGEN_API_URL || "https://smmgen.com/api/v2";

const API_KEY: string = process.env.SMMGEN_API_KEY || "";

if (!API_KEY) {
  throw new Error("SMMGEN_API_KEY is not configured.");
}

type SmmGenService = {
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

async function smmGenRequest(body: URLSearchParams) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`SMMGen API returned HTTP ${response.status}.`);
  }

  return response.json();
}

export async function getSmmGenServices(): Promise<SmmGenService[]> {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "services",
  });

  const data = await smmGenRequest(body);

  if (!Array.isArray(data)) {
    throw new Error(
      data?.error || "SMMGen returned an invalid service list."
    );
  }

  return data;
}

export async function getSmmGenService(
  serviceId: string
): Promise<SmmGenService> {
  const id = serviceId.trim();

  if (!id) {
    throw new Error("SMMGen service ID is required.");
  }

  const services = await getSmmGenServices();

  const service = services.find(
    (item) => String(item.service) === id
  );

  if (!service) {
    throw new Error(`SMMGen service ${id} was not found.`);
  }

  return service;
}

export async function addSmmGenOrder({
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

  const data = await smmGenRequest(body);

  if (data.error || data.order === undefined) {
    throw new Error(
      data.error || "SMMGen did not return a provider order ID."
    );
  }

  return {
    providerOrderId: String(data.order),
  };
}

export async function getSmmGenOrderStatus(
  providerOrderId: string
) {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "status",
    order: providerOrderId,
  });

  const data = await smmGenRequest(body);

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

export async function getSmmGenBalance() {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "balance",
  });

  const data = await smmGenRequest(body);

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    balance:
      data.balance !== undefined
        ? String(data.balance)
        : null,
    currency:
      data.currency !== undefined
        ? String(data.currency)
        : null,
  };
}
