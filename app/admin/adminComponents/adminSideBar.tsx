// components/admin/AdminSidebar.tsx
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminSideBar() {
  const router = useRouter();
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function handleCikis() {
  await supabase.auth.signOut();
  router.push('/giris');
}

  const menuGroups = [
    {
      title: "Ana Menü",
       items: [
        {name: "Yönetim Paneli" , href: "/admin" , icon: "⚙️" }
      ]
    },
    
    {
      title: "OPERASYON",
      items: [
        { name: "Ürün Onayları", href: "/admin/approval", icon: "📝" },
        { name: "Satıcılar (Vendors)", href: "/admin/vendors", icon: "🏢" },
        { name: "Sipariş & Üretim", href: "/admin/orders", icon: "🚚" },
        { name: "Müşteriler", href: "/admin/customers", icon: "👥" },
      ]
    },
    {
      title: "İÇERİK & VİTRİN",
      items: [
        { name: "Carousel Yönetimi", href: "/admin/carousel", icon: "🖼️" },
        { name: "From House (Müşteri Kareleri)", href: "/admin/from-house", icon: "🏠" },
        { name: "İletişim Mesajları", href: "/admin/messages", icon: "📩" },
      ]
    },
    {
      title: "SİSTEM",
      items: [
        { name: "Finans & İstatistik", href: "/admin/stats", icon: "📊" },
        { name: "Site Ayarları", href: "/admin/settings", icon: "⚙️" },
        { name: "Güvenlik & Yedekleme", href: "/admin/security", icon: "🔐" },
      ]
    }
  ];


  return (
    <aside className="w-72 bg-white border-r border-[#E8E7E0] h-screen sticky top-0 p-8 flex flex-col gap-10">
      <div>
        <h1 className="text-xl font-serif tracking-widest border-b pb-4 mb-2">SENZIA ADMIN</h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Kontrol Paneli v2.2</p>
      </div>

      <nav className="flex-1 space-y-8">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="flex items-center gap-3 py-2 px-3 text-sm text-gray-600 hover:bg-[#FAFAF8] hover:text-black rounded-lg transition-all"
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="pt-6 border-t border-[#E8E7E0]">
         <button
          onClick={handleCikis}
          className="flex items-center gap-3 text-sm text-red-400 hover:text-red-600 transition-colors"
        >
          🚪 Çıkış Yap
        </button>
      </div>
    </aside>
  );
}