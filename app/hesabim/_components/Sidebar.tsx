"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ShoppingBag, Heart, Shield, MapPin,
  Gift, Settings, LogOut, Star,
} from "lucide-react";

export type HesabimSayfa =
  | "siparisler"
  | "favoriler"
  | "senzia-care"
  | "adresler"
  | "sadakat"
  | "profil";

interface Props {
  aktifSayfa: HesabimSayfa;
  onSayfaDegis: (sayfa: HesabimSayfa) => void;
  ad?: string;
  soyad?: string;
  email: string;
}

const MENU: {
  baslik: string;
  items: { key: HesabimSayfa; label: string; aciklama: string; icon: React.ElementType }[];
}[] = [
  {
    baslik: "Siparişlerim",
    items: [
      { key: "siparisler", label: "Sipariş Takibi", aciklama: "Üretim ve teslimat durumu", icon: ShoppingBag },
    ],
  },
  {
    baslik: "Koleksiyonum",
    items: [
      { key: "favoriler", label: "Habitat & Favoriler", aciklama: "Moodboard ve wishlist", icon: Heart },
    ],
  },
  {
    baslik: "Senzia Care",
    items: [
      { key: "senzia-care", label: "Bakım & Garanti", aciklama: "Kılavuzlar ve sertifikalar", icon: Shield },
    ],
  },
  {
    baslik: "Hesabım",
    items: [
      { key: "adresler", label: "Adres Defteri", aciklama: "Teslimat ve fatura adresleri", icon: MapPin },
      { key: "sadakat", label: "Senzia Member", aciklama: "Ayrıcalıklar ve ödüller", icon: Gift },
      { key: "profil", label: "Profil & Güvenlik", aciklama: "Bilgiler ve şifre", icon: Settings },
    ],
  },
];

export default function HesabimSidebar({ aktifSayfa, onSayfaDegis, ad, soyad, email }: Props) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleCikis() {
    await supabase.auth.signOut();
    router.push("/giris");
  }

  const tamAd = ad ? `${ad} ${soyad || ""}`.trim() : null;
  const basTuru = (tamAd || email)?.[0]?.toUpperCase() || "?";

  return (
    <aside className="w-[260px] flex-shrink-0 flex flex-col gap-3">

      {/* Profil özeti */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <div className="flex items-center gap-3.5 flex-col">

          <div className="w-full h-12 bg-stone-900 rounded-xl flex items-center justify-center flex-shrink-0 mb-5">
            <span className="text-white text-[18px] font-semibold">{basTuru}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-stone-900 truncate capitalize mb-1">
              {tamAd || "Merhaba"}
            </p>
            <p className="text-[13px] text-stone-400 truncate">{email}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2.5 bg-stone-50 border border-stone-100 rounded-xl px-3.5 py-3">
          <Star size={14} className="text-amber-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-stone-700">Senzia Member</p>
            <p className="text-[11px] text-stone-400 truncate">Ayrıcalıklı üye</p>
          </div>
        </div>
      </div>

      {/* Navigasyon */}
      <nav className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {MENU.map((grup, gi) => (
          <div key={grup.baslik} className={gi > 0 ? "border-t border-stone-100" : ""}>
            <p className="px-5 pt-4 pb-2 text-[11px] tracking-wide font-bold text-stone-400 uppercase tracking-[0.15em]">
              {grup.baslik}
            </p>
            {grup.items.map(({ key, label, aciklama, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onSayfaDegis(key)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all
                  group relative
                  ${aktifSayfa === key ? "bg-stone-50" : "hover:bg-stone-50/60"}`}
              >
                {aktifSayfa === key && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] bg-stone-900 rounded-r-full" />
                )}

                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                  ${aktifSayfa === key
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"}`}>
                  <Icon size={13} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] font-medium truncate transition-colors
                    ${aktifSayfa === key ? "text-stone-900" : "text-stone-700 group-hover:text-stone-900"}`}>
                    {label}
                  </p>
                  <p className="text-[12px] text-stone-400 truncate mt-0.5">{aciklama}</p>
                </div>
              </button>
            ))}
            <div className="h-1" />
          </div>
        ))}

        {/* Çıkış */}
        <div className="border-t border-stone-100 p-2">
          <button
            onClick={handleCikis}
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-left
              text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <LogOut size={15} className="text-red-400" />
            </div>
            <span className="text-[14px] font-medium">Çıkış Yap</span>
          </button>
        </div>
      </nav>

      {/* Alt bilgi */}
      <div className="px-1">
        <p className="text-[12px] text-stone-300 leading-relaxed">
          Destek için{" "}
          <span className="text-stone-400 hover:text-stone-600 cursor-pointer transition-colors">
            danisma@senzia.com
          </span>
        </p>
      </div>
    </aside>
  );
}