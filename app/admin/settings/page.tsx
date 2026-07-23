import AdminSiteSettings from "../settings/AdminSiteSettings"; //burası doğru ../settings/AdminSiteSettings olacak 
import AdminSideBar from "../adminComponents/adminSideBar";

export const metadata = {
  title: "Site Ayarları | Senzia Admin",
};

export default function SettingsPage() {
  return (
    <div className="h-screen bg-[#FAFAF8] flex overflow-hidden">
      <aside className="shrink-0"><AdminSideBar /></aside>
      <main className="flex-1 min-w-0 overflow-y-auto"><AdminSiteSettings /></main>
    </div>
  );
}