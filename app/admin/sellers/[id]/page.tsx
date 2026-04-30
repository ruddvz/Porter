import { MOCK_SELLERS } from "@/lib/admin-mock";
import { AdminSellerDetail } from "./SellerDetailClient";

export function generateStaticParams() {
  return MOCK_SELLERS.map((s) => ({ id: s.id }));
}

export default function AdminSellerDetailPage({ params }: { params: { id: string } }) {
  return <AdminSellerDetail sellerId={params.id} />;
}
