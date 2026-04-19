// components/vendor/VendorsSideBar.tsx

import Link from 'next/link';

export default function VendorsSideBar() {
  const menuGroups = [
    {
      title: "MAĞAZA YÖNETİMİ",
      items: [
        { name: "Genel Bakış", href: "/vendor/dashboard", icon: "📊" },
        { name: "Ürünlerim", href: "/vendor/products", icon: "🪑" },
        { name: "Yeni Ürün Ekle", href: "/vendor/products/new", icon: "➕" },
      ]
    },
    {
      title: "SİPARİŞ & ÜRETİM",
      items: [
        { name: "Aktif Siparişler", href: "/vendor/orders", icon: "📦" },
        { name: "Üretim Takibi", href: "/vendor/production", icon: "🛠️" }, // Üretim aşamaları (Döşeme, İskelet vb.)
        { name: "Lojistik & Teslimat", href: "/vendor/logistics", icon: "🚚" },
      ]
    },
    {
      title: "MÜŞTERİ & PRESTİJ",
      items: [
        { name: "Mesajlarım", href: "/vendor/messages", icon: "📩" },
        { name: "Gelen Yorumlar", href: "/vendor/reviews", icon: "⭐" },
        { name: "From House Kareleri", href: "/vendor/from-house", icon: "🏠" },
      ]
    },
    {
      title: "FİNANS",
      items: [
        { name: "Kazançlarım", href: "/vendor/finance", icon: "💰" },
        { name: "Güven Skoru & Hak Ediş", href: "/vendor/trust-score", icon: "🛡️" },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-[#E8E7E0] h-screen sticky top-0 p-8 flex flex-col gap-10">
      {/* Satıcı Logo/Başlık Alanı */}
      <div>
        <h1 className="text-xl font-serif tracking-widest border-b pb-4 mb-2">SENZIA PARTNER</h1>
        <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-medium">Satıcı Paneli • Aktif</p>
        </div>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
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
                    className="flex items-center gap-3 py-2 px-3 text-sm text-gray-600 hover:bg-[#FAFAF8] hover:text-black rounded-lg transition-all group"
                  >
                    <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="font-light tracking-wide">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profil/Alt Bölüm */}
      <div className="pt-6 border-t border-[#E8E7E0] space-y-4">
        <Link href="/vendor/settings" className="flex items-center gap-3 text-sm text-gray-500 hover:text-black">
          ⚙️ Mağaza Ayarları
        </Link>
        <button className="flex items-center gap-3 text-sm text-red-400 hover:text-red-600 transition-colors w-full text-left">
          🚪 Çıkış Yap
        </button>
      </div>
    </aside>
  );
}