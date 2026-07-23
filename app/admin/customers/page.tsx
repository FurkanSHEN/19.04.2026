import CustomersManagement from "../customers/Customersmanagment";
import AdminSideBar from "../adminComponents/adminSideBar";

export const metadata = {
  title: 'Müşteri Yönetimi | Senzia Admin',
  description: 'Tüm müşterileri yönetin ve takip edin',
};

export default function AdminCustomersPage() {
  return (
    <div className="h-screen bg-[#FAFAF8] flex overflow-hidden">
      <aside className="shrink-0"><AdminSideBar /></aside>
      <main className="flex-1 min-w-0 overflow-y-auto"><CustomersManagement /></main>
    </div>
  );
}