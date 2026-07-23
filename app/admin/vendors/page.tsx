import VendorsManagement from "./VendorsManagement";
import AdminSideBar from "../adminComponents/adminSideBar";

export const metadata = {
  title: 'Vendor Yönetimi | Senzia Admin',
  description: 'Tüm satıcıları yönetin',
};


export default function AdminVendorsPage() {
  return (
    <div className="h-screen bg-[#FAFAF8] flex overflow-hidden">
      <aside className="shrink-0"><AdminSideBar /></aside>
      <main className="flex-1 min-w-0 overflow-y-auto"><VendorsManagement /></main>
    </div>
  );
}