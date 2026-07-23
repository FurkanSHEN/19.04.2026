import AdminOrders from "../orders/adminorders";
import AdminSideBar from "../adminComponents/adminSideBar";

export default function OrdersPage() {
  return (
    <div className="h-screen bg-[#FAFAF8] flex overflow-hidden">
      <aside className="shrink-0"><AdminSideBar /></aside>
      <main className="flex-1 min-w-0 overflow-y-auto"><AdminOrders /></main>
    </div>
  );
}