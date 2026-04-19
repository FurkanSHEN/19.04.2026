"use client";

import { useState } from "react";
import { Check, X, Clock, Filter, Camera, FileText, Palette, MoreHorizontal, ChevronRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProductStatus = "incelemede" | "yayinda" | "reddedildi";
type VetoKategori = "fotograf" | "aciklama" | "estetik" | "diger";

interface PendingProduct {
  id: number;
  ad: string;
  vendor_adi: string;
  fiyat: number;
  kategori: string;
  aciklama: string;
  durum: ProductStatus;
  created_at: string;
  modul_sayisi?: number;
}

interface Props {
  /** Products to display — fetched server-side from Supabase */
  products?: PendingProduct[];
  /** Called after approve/reject — revalidate or refetch */
  onAction?: (id: number, action: "approve" | "reject", feedback?: { kategori: VetoKategori; mesaj: string }) => Promise<void>;
}

// ─── Demo data (replace with real Supabase data) ─────────────────────────────

const DEMO_PRODUCTS: PendingProduct[] = [
  { id: 3, ad: "Icon Koltuk Takımı", vendor_adi: "Senzia Home Ana Üretim", fiyat: 59999, kategori: "Oturma Grubu", aciklama: "32 DNS ekstra soft sünger ve müzik modülü ile premium konfor.", durum: "incelemede", created_at: "2026-04-15", modul_sayisi: 4 },
  { id: 8, ad: "Lena Köşe Grubu", vendor_adi: "Modüler Mobilya A.Ş.", fiyat: 60000, kategori: "Köşe Grubu", aciklama: "Lena modüler köşe grubu, modern yaşam alanları için.", durum: "incelemede", created_at: "2026-04-16", modul_sayisi: 4 },
  { id: 11, ad: "Oslo Sandalyesi", vendor_adi: "Nordic Furnitures TR", fiyat: 12500, kategori: "Tekli Koltuk", aciklama: "Saf meşe gövde, keten döşeme.", durum: "incelemede", created_at: "2026-04-17", modul_sayisi: 0 },
  { id: 12, ad: "Zen Koltuk Takımı", vendor_adi: "Senzia Home Ana Üretim", fiyat: 49999, kategori: "Oturma Grubu", aciklama: "DSS mekanizması ile yataklı dönüşüm.", durum: "incelemede", created_at: "2026-04-17", modul_sayisi: 2 },
];

const VETO_CATEGORIES: { id: VetoKategori; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "fotograf", label: "Fotoğraf Kalitesi", icon: <Camera size={13} />, color: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "aciklama", label: "Açıklama Eksik", icon: <FileText size={13} />, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "estetik", label: "Estetik Uyum", icon: <Palette size={13} />, color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "diger", label: "Diğer", icon: <MoreHorizontal size={13} />, color: "bg-stone-50 text-stone-600 border-stone-200" },
];

const VETO_TEMPLATES: Record<VetoKategori, string[]> = {
  fotograf: [
    "Ana görsel minimum 2000×1500px olmalıdır.",
    "Ürünün tüm açılarından görsel eklenmelidir.",
    "Fotoğraf arka planı nötr/beyaz olmalıdır.",
  ],
  aciklama: [
    "Malzeme bilgisi eksik. Sünger yoğunluğu (DNS) belirtilmeli.",
    "Boyut bilgileri girilmemiş.",
    "Bakım talimatları eklenmeli.",
  ],
  estetik: [
    "Ürün görsel dili platform estetiğiyle uyuşmuyor.",
    "Lifestyle fotoğraf eksik.",
  ],
  diger: [],
};

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminProductApproval({
  products = DEMO_PRODUCTS,
  onAction,
}: Props) {
  const [localProducts, setLocalProducts] = useState<PendingProduct[]>(products);
  const [filter, setFilter] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [vetoKategori, setVetoKategori] = useState<VetoKategori>("fotograf");
  const [vetoMesaj, setVetoMesaj] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pending = localProducts.filter(p => p.durum === "incelemede");
  const filtered = filter === "all" ? pending : pending.filter(p => p.kategori === filter);
  const categories = ["all", ...Array.from(new Set(pending.map(p => p.kategori)))];

  const openRejectDrawer = (p: PendingProduct) => {
    setSelectedProduct(p);
    setVetoKategori("fotograf");
    setVetoMesaj("");
    setDrawerOpen(true);
  };

  const handleApprove = async (id: number) => {
    setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, durum: "yayinda" as ProductStatus } : p));
    await onAction?.(id, "approve");
  };

  const handleReject = async () => {
    if (!selectedProduct || !vetoMesaj.trim()) return;
    setSubmitting(true);
    setLocalProducts(prev =>
      prev.map(p => p.id === selectedProduct.id ? { ...p, durum: "reddedildi" as ProductStatus } : p)
    );
    await onAction?.(selectedProduct.id, "reject", { kategori: vetoKategori, mesaj: vetoMesaj });
    setSubmitting(false);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-8 py-5 flex justify-between items-center">
        <h1 className="font-['Crimson_Pro'] text-2xl font-medium text-stone-900">
          Ürün Onay Paneli
        </h1>
        <div className="flex items-center gap-5 text-[13px] text-stone-500">
          <span className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full text-[12px]">
              {pending.length}
            </span>
            Beklemede
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-green-600">47 Bugün onaylandı</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-6">
          <Filter size={14} className="text-stone-400" />
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all
                  ${filter === cat
                    ? "bg-stone-900 text-white"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
              >
                {cat === "all" ? "Tümü" : cat}
                {cat === "all" && (
                  <span className="ml-1.5 text-[11px] opacity-70">({pending.length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Check size={40} className="mx-auto mb-3 text-green-400" />
            <p className="font-medium">Tüm ürünler işlendi!</p>
            <p className="text-[13px] mt-1">Bu kategoride bekleyen ürün yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(p => (
              <div key={p.id}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden
                  transition-transform hover:-translate-y-1 hover:shadow-md duration-200">

                {/* Image placeholder */}
                <div className="h-56 bg-gradient-to-br from-stone-100 to-stone-200 relative
                  flex items-center justify-center">
                  <div className="text-center text-stone-400">
                    <div className="text-4xl mb-1.5">🛋</div>
                    <p className="text-[12px]">{p.ad}</p>
                  </div>
                  {/* Status */}
                  <span className="absolute top-3 right-3 bg-amber-50 text-amber-700 border border-amber-200
                    px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide flex items-center gap-1.5">
                    <Clock size={10} />
                    İncelemede
                  </span>
                  {/* Module badge */}
                  {(p.modul_sayisi ?? 0) > 0 && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-stone-600
                      border border-stone-200 px-2 py-1 rounded-full text-[11px] font-medium">
                      {p.modul_sayisi} modül
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h3 className="font-['Crimson_Pro'] text-[18px] font-medium text-stone-900 leading-tight">
                        {p.ad}
                      </h3>
                      <p className="text-[12px] text-stone-400 mt-0.5">{p.vendor_adi}</p>
                    </div>
                    <span className="text-[15px] font-semibold text-stone-800 tabular-nums ml-3 flex-shrink-0">
                      {fmt(p.fiyat)}
                    </span>
                  </div>

                  <p className="text-[13px] text-stone-500 leading-relaxed mb-1
                    line-clamp-2">
                    {p.aciklama}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-4">
                    <span className="bg-stone-100 px-2 py-0.5 rounded-full">{p.kategori}</span>
                    <span>·</span>
                    <span>{p.created_at}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-stone-100">
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700
                        border border-green-200 rounded-lg text-[13px] font-medium
                        hover:bg-green-100 transition-colors active:scale-[0.97]"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      Onayla
                    </button>
                    <button
                      onClick={() => openRejectDrawer(p)}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600
                        border border-red-200 rounded-lg text-[13px] font-medium
                        hover:bg-red-100 transition-colors active:scale-[0.97]"
                    >
                      <X size={13} strokeWidth={2.5} />
                      Reddet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Veto Drawer — slides up from bottom */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-[440px] bg-white rounded-t-2xl border border-stone-200
            shadow-2xl animate-in slide-in-from-bottom-4 duration-300 m-0">

            <div className="px-5 py-4 border-b border-stone-100 flex justify-between items-center">
              <div>
                <h3 className="font-['Crimson_Pro'] text-[17px] font-medium text-stone-800">
                  Ret Bildirimi
                </h3>
                <p className="text-[12px] text-stone-400 mt-0.5">
                  {selectedProduct?.ad} · {selectedProduct?.vendor_adi}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100
                  text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Veto category */}
              <div>
                <p className="text-[13px] font-medium text-stone-700 mb-2.5">Ret kategorisi</p>
                <div className="grid grid-cols-2 gap-2">
                  {VETO_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setVetoKategori(cat.id)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[13px]
                        font-medium transition-all
                        ${vetoKategori === cat.id
                          ? cat.color + " ring-1 ring-inset ring-current"
                          : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"}`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick templates */}
              {VETO_TEMPLATES[vetoKategori].length > 0 && (
                <div>
                  <p className="text-[12px] text-stone-400 mb-2">Hızlı şablonlar</p>
                  <div className="space-y-1.5">
                    {VETO_TEMPLATES[vetoKategori].map(t => (
                      <button
                        key={t}
                        onClick={() => setVetoMesaj(t)}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg
                          text-[12px] text-stone-600 hover:bg-stone-50 hover:text-stone-800
                          border border-transparent hover:border-stone-200 transition-all group"
                      >
                        <ChevronRight size={11} className="text-stone-300 group-hover:text-stone-400 flex-shrink-0" />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Free-form feedback */}
              <div>
                <p className="text-[13px] font-medium text-stone-700 mb-2">
                  Üreticiye geri bildirim
                  <span className="text-red-400 ml-1">*</span>
                </p>
                <textarea
                  value={vetoMesaj}
                  onChange={e => setVetoMesaj(e.target.value)}
                  rows={4}
                  placeholder="Üreticinin düzeltmesi için net bir açıklama yazın..."
                  className="w-full px-3.5 py-3 border border-stone-200 rounded-xl text-[13px]
                    focus:outline-none focus:border-stone-700 transition-colors resize-none
                    placeholder:text-stone-300 leading-relaxed"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Bu mesaj üreticinin panelinde görünür ve e-posta ile iletilir.
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-2.5">
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 py-2.5 border border-stone-200 rounded-lg text-[13px]
                  font-medium text-stone-500 hover:bg-stone-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={!vetoMesaj.trim() || submitting}
                className="flex-1 py-2.5 bg-stone-900 text-white rounded-lg text-[13px]
                  font-medium hover:bg-stone-700 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submitting ? "Gönderiliyor..." : "Ret Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
