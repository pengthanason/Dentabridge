import { notFound } from "next/navigation";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import AppHeader from "@/components/AppHeader";
import ReceiveCheck from "@/components/ReceiveCheck";

export default function ReceivePage({ params }: { params: { no: string } }) {
  const order = MOCK_ORDERS.find((o) => o.no === decodeURIComponent(params.no));
  if (!order) notFound();

  return (
    <div>
      <AppHeader title="Receive order" back />
      <ReceiveCheck
        orderNo={order.no}
        seller={order.seller}
        items={order.items.map((it) => ({ name: it.name, qty: it.qty }))}
      />
    </div>
  );
}
