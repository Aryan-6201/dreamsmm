const API_URL =
  process.env.VIPSMM_API_URL || "https://vipsmmpro.com/api/v2";

const API_KEY: string = process.env.VIPSMM_API_KEY || "";

if (!API_KEY) {
  throw new Error("VIPSMM_API_KEY is not configured.");
}

export type VipSmmService = {
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

  const data = await response.json();

  if (data?.error) {
    throw new Error(String(data.error));
  }

  return data;
}

export async function getVipSmmServices(): Promise<VipSmmService[]> {
  const body = new URLSearchParams({
    key: API_KEY,
    action: "services",
  });

  const data = await vipRequest(body);

  if (!Array.isArray(data)) {
    throw new Error("VIPSMM returned an invalid service list.");
  }

  return data;
}

export async function getVipSmmService(
  serviceId: string
): Promise<VipSmmService> {
  const id = serviceId.trim();

  if (!id) {
    throw new Error("VIPSMM service ID is required.");
  }

  const services = await getVipSmmServices();

  const service = services.find(
    (item) => String(item.service) === id
  );

  if (!service) {
    throw new Error(`VIPSMM service ${id} was not found.`);
  }

  return service;
}

export async function addVipSmmOrder({
  serviceId,
  link,
  quantity,
  runs,
  interval,
}: {
  serviceId: string;
  link: string;
  quantity: number;
  runs?: number;
  interval?: number;
}) {
  const params: Record<string, string> = {
    key: API_KEY,
    action: "add",
    service: serviceId,
    link,
    quantity: String(quantity),
  };

  if (runs !== undefined) params.runs = String(runs);
  if (interval !== undefined) params.interval = String(interval);

  const data = await vipRequest(
    new URLSearchParams(params)
  );

  if (data.order === undefined) {
    throw new Error(
      "VIPSMM did not return a provider order ID."
    );
  }

  return {
    providerOrderId: String(data.order),
  };
}

export async function getVipSmmOrderStatus(
  providerOrderId: string
) {
  const data = await vipRequest(
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
    currency: data.currency || null,
  };
}

export async function getVipSmmBalance() {
  const data = await vipRequest(
    new URLSearchParams({
      key: API_KEY,
      action: "balance",
    })
  );

  return {
    balance: Number(data.balance),
    currency: data.currency || null,
  };
}

export async function createVipSmmRefill(
  orderId: string
) {
  const data = await vipRequest(
    new URLSearchParams({
      key: API_KEY,
      action: "refill",
      order: orderId,
    })
  );

  return {
    refillId: String(data.refill),
  };
}

export async function getVipSmmRefillStatus(
  refillId: string
) {
  const data = await vipRequest(
    new URLSearchParams({
      key: API_KEY,
      action: "refill_status",
      refill: refillId,
    })
  );

  return {
    status: data.status || "Unknown",
  };
}

export async function cancelVipSmmOrders(
  orderIds: string[]
) {
  const data = await vipRequest(
    new URLSearchParams({
      key: API_KEY,
      action: "cancel",
      orders: orderIds.join(","),
    })
  );

  return data;
}
