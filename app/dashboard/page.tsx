import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import OrderForm from "./OrderForm";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySession(token);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      balance: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const services = await prisma.service.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const formattedServices = services.map((service) => ({
    id: service.id,
    name: service.name,
    platform: service.platform,
    category: service.category,
    description: service.description,
    rate: service.rate.toString(),
    min: service.min,
    max: service.max,
  }));

  return (
    <main className="min-h-screen bg-white text-[#34495e]">
      <Sidebar />

      <div className="lg:ml-[250px]">
        <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-8">

          {/* BALANCE - small, not a huge card */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Balance
              </p>

              <p className="mt-1 text-xl font-bold text-[#34495e]">
                ₹{user.balance.toString()}
              </p>
            </div>

            <a
              href="/funds"
              className="rounded-xl bg-[#eeeafd] px-4 py-2.5 text-sm font-bold text-[#4b3ca7]"
            >
              + Add Funds
            </a>
          </div>

          {/* ORDER FORM ONLY */}
          <div className="rounded-[24px] bg-white">
            <OrderForm services={formattedServices} />
          </div>

        </div>
      </div>
    </main>
  );
}