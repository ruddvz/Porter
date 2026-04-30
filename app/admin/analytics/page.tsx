"use client";

import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import {
  MOCK_DAILY_ORDERS,
  MOCK_PAYMENT_SPLIT,
  MOCK_SELLER_REVENUE,
  MOCK_SIGNUPS,
  MOCK_SELLERS,
} from "@/lib/admin-mock";
import {
  AdminDailyOrdersChart,
  AdminPaymentPieChart,
  AdminSellerRevenueChart,
  AdminSignupsChart,
} from "@/components/admin/AdminCharts";

export default function AdminAnalyticsPage() {
  const totalSellers = MOCK_SELLERS.length;
  const totalOrders = MOCK_SELLERS.reduce((s, x) => s + x.ordersAllTime, 0);
  const totalRev = MOCK_SELLERS.reduce((s, x) => s + x.revenueAllTime, 0);

  return (
    <div className="space-y-space-6">
      <div className="grid grid-cols-2 gap-space-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total sellers (all time)" value={totalSellers} />
        <StatCard label="Total orders (all time)" value={totalOrders} />
        <StatCard label="Total revenue processed" value={(totalRev / 100000).toFixed(1) + "L"} prefix="₹" />
        <StatCard label="Avg orders / seller / mo" value="42" />
        <StatCard label="Top city by volume" value="Vadodara" />
        <StatCard label="Top payment method" value="Razorpay" />
      </div>

      <div className="grid gap-space-6 lg:grid-cols-2">
        <Card padding="lg">
          <h2 className="mb-space-3 text-title text-porter-text-primary">Daily orders (30 days)</h2>
          <AdminDailyOrdersChart data={MOCK_DAILY_ORDERS} />
        </Card>
        <Card padding="lg">
          <h2 className="mb-space-3 text-title text-porter-text-primary">Revenue per seller (top 10, mock scale)</h2>
          <AdminSellerRevenueChart data={MOCK_SELLER_REVENUE} />
        </Card>
        <Card padding="lg">
          <h2 className="mb-space-3 text-title text-porter-text-primary">Payment method split</h2>
          <AdminPaymentPieChart data={MOCK_PAYMENT_SPLIT} />
        </Card>
        <Card padding="lg">
          <h2 className="mb-space-3 text-title text-porter-text-primary">New seller signups (90 days)</h2>
          <AdminSignupsChart data={MOCK_SIGNUPS} />
        </Card>
      </div>
    </div>
  );
}
