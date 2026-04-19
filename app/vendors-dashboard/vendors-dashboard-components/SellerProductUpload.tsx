"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Info, AlertCircle, Upload, ChevronDown } from "lucide-react";
// YENİ EKLE:
import { useRouter } from "next/navigation";
import { createProductAction } from "../urun-ekle/actions";


// ─── Types ───────────────────────────────────────────────────────────────────

type ProductType = "single" | "modular";
type Locale = "tr" | "en" | "de" | "ar";

interface ModuleRow {
  id: string;
  modul_adi: string;
  fiyat: string;
  genislik: string;
  derinlik: string;
  yukseklik: string;
  agirlik_kg: string;
  paket_sayisi: string;
}

interface LocaleContent {
  ad: string;
  aciklama: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const calcCbm = (g: string, d: string, y: string): string => {
  const n = [g, d, y].map(Number);
  if (n.some(v => !v || isNaN(v))) return "—";
  return (n[0] * n[1] * n[2] / 1_000_000).toFixed(4);
};

const LOCALE_LABELS: Record<Locale, string> = {
  tr: "🇹🇷 Türkçe",
  en: "🇬🇧 English",
  de: "🇩🇪 Deutsch",
  ar: "🇸🇦 العربية",
};

const CATEGORIES = [
  "Oturma Grubu", "Köşe Grubu", "Tekli Koltuk", "Berjer",
  "Yemek Odası", "Yatak Odası", "Modüler Sistem", "Aydınlatma", "Aksesuar",
];

function uid() { return Math.random().toString(36).slice(2, 9); }

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormField({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-stone-800 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <span className="text-[12px] text-stone-400">{hint}</span>}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-[14px] bg-white
        focus:outline-none focus:border-stone-700 transition-colors placeholder:text-stone-300"
      style={{ boxSizing: "border-box" }}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none px-3.5 py-2.5 border border-stone-200 rounded-lg
          text-[14px] bg-white focus:outline-none focus:border-stone-700 transition-colors pr-8"
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
    </div>
  );
}

function DimLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}

function ModuleRow({ module, onChange, onRemove }: {
  module: ModuleRow;
  onChange: (id: string, field: keyof ModuleRow, val: string) => void;
  onRemove: (id: string) => void;
}) {
  const cbm = calcCbm(module.genislik, module.derinlik, module.yukseklik);

  return (
    <div className="bg-white border border-stone-100 rounded-xl p-5 transition-shadow hover:shadow-sm">

      {/* Satır 1: Modül adı — tam genişlik */}
      <div className="mb-4">
        <DimLabel>Modül adı</DimLabel>
        <Input
          value={module.modul_adi}
          onChange={e => onChange(module.id, "modul_adi", e.target.value)}
          placeholder="ör. Sağ Kollu Modül"
        />
      </div>

      {/* Satır 2: Boyutlar + Ağırlık + Fiyat
          Geniş (sm+): 5 eşit sütun
          Dar (<sm):   2 sütun, Fiyat tam satır */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {([
          { key: "genislik",   label: "En (cm)" },
          { key: "derinlik",   label: "Derinlik (cm)" },
          { key: "yukseklik",  label: "Yükseklik (cm)" },
          { key: "agirlik_kg", label: "Ağırlık (kg)" },
        ] as const).map(({ key, label }) => (
          <div key={key}>
            <DimLabel>{label}</DimLabel>
            <Input
              type="number"
              value={module[key]}
              onChange={e => onChange(module.id, key, e.target.value)}
              placeholder="—"
            />
          </div>
        ))}
        <div className="col-span-2 sm:col-span-1">
          <DimLabel>Fiyat (TRY)</DimLabel>
          <Input
            type="number"
            value={module.fiyat}
            onChange={e => onChange(module.id, "fiyat", e.target.value)}
            placeholder="18000"
          />
        </div>
      </div>

      {/* Alt: CBM + Kaldır */}
      <div className="flex items-center justify-between pt-3.5 border-t border-stone-100">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
          <Package size={11} />
          <span>CBM:</span>
          <strong className="text-stone-500 tabular-nums">{cbm} m³</strong>
          {cbm !== "—" && (
            <span className="text-stone-300 hidden sm:inline">
              ({module.genislik}×{module.derinlik}×{module.yukseklik} cm)
            </span>
          )}
        </div>
        <button
          onClick={() => onRemove(module.id)}
          className="flex items-center gap-1 px-2.5 py-1 text-stone-400 hover:text-red-500
            hover:bg-red-50 rounded-lg text-[11px] font-medium transition-all"
        >
          <Trash2 size={11} /> Kaldır
        </button>
      </div>
    </div>
  );
}

// Fake Package icon for inside the component
function Package({ size, ...props }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16.5 9.4L7.55 4.24M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SellerProductUpload() {
  const router = useRouter(); // YENİ
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [productType, setProductType] = useState<ProductType>("modular");
  const [locale, setLocale] = useState<Locale>("tr");
  const [modules, setModules] = useState<ModuleRow[]>([
    { id: uid(), modul_adi: "Sağ Kollu Modül", fiyat: "18000", genislik: "115", derinlik: "100", yukseklik: "80", agirlik_kg: "42.5", paket_sayisi: "1" },
    { id: uid(), modul_adi: "Sol Kollu Modül", fiyat: "18000", genislik: "115", derinlik: "100", yukseklik: "80", agirlik_kg: "42.5", paket_sayisi: "1" },
  ]);
  const [content, setContent] = useState<Record<Locale, LocaleContent>>({
    tr: { ad: "", aciklama: "" },
    en: { ad: "", aciklama: "" },
    de: { ad: "", aciklama: "" },
    ar: { ad: "", aciklama: "" },
  });
  const [category, setCategory] = useState("");
  const [basePrice, setBasePrice] = useState("");

const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const productData = {
        ad: content[locale].ad,
        aciklama: content[locale].aciklama,
        kategori: category,
        fiyat: basePrice
      };

      // Action'ı çağırıyoruz
      const result = await createProductAction(productData, productType === "modular" ? modules : []);

      if (result.success) {
        alert("Ürün başarıyla incelemeye gönderildi.");
        router.push("/vendors-dashboard"); 
      } else {
        alert("Hata: " + result.error);
      }
    } catch (err) {
      alert("Beklenmedik bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addModule = useCallback(() => {
    setModules(prev => [...prev, {
      id: uid(), modul_adi: "", fiyat: "", genislik: "", derinlik: "", yukseklik: "", agirlik_kg: "", paket_sayisi: "1",
    }]);
  }, []);

  const removeModule = useCallback((id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateModule = useCallback((id: string, field: keyof ModuleRow, val: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
  }, []);

  const totalCbm = modules.reduce((acc, m) => {
    const c = parseFloat(calcCbm(m.genislik, m.derinlik, m.yukseklik));
    return acc + (isNaN(c) ? 0 : c);
  }, 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-8 py-5">
        <h1 className="font-['Crimson_Pro'] text-2xl font-medium text-stone-900 mb-0.5">
          Yeni Ürün Ekle
        </h1>
        <p className="text-[13px] text-stone-400">
          Ürün yüklendikten sonra küratör ekibimiz 24–48 saat içinde değerlendirecektir.
        </p>
      </div>

      <div className="max-w-[900px] mx-auto py-8 px-6 space-y-5 " >

        {/* Info banner */}
        <div className="flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5">
          <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-blue-700 leading-relaxed">
            Görseller minimum 1200px genişliğinde olmalı. Modüler ürünlerde her modülün ayrı fotoğrafı
            eklenirse onay süreci hızlanır.
          </p>
        </div>

        {/* Basic info */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100">
            <h2 className="font-['Crimson_Pro'] text-[18px] font-medium text-stone-800">
              Temel Bilgiler
            </h2>
            {/* Product type toggle */}
            <div className="flex gap-1.5 bg-stone-100 p-1 rounded-lg">
              {(["single", "modular"] as ProductType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setProductType(t)}
                  className={`px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-all
                    ${productType === t
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"}`}
                >
                  {t === "single" ? "Tekli Ürün" : "Modüler Sistem"}
                </button>
              ))}
            </div>
          </div>

          {/* Locale tabs */}
          <div className="flex gap-0.5 mb-5 border-b border-stone-100 pb-3">
            {(Object.keys(LOCALE_LABELS) as Locale[]).map(l => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-t transition-all
                  ${locale === l
                    ? "text-stone-900 border-b-2 border-stone-800"
                    : "text-stone-400 hover:text-stone-600"}`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <FormField label="Ürün / Koleksiyon adı" required>
                <Input
                  value={content[locale].ad}
                  onChange={e => setContent(prev => ({
                    ...prev, [locale]: { ...prev[locale], ad: e.target.value }
                  }))}
                  placeholder={locale === "tr" ? "ör. Coco Koltuk Takımı" : "e.g., Coco Sofa Set"}
                />
              </FormField>
            </div>

            <FormField label="Kategori" required>
              <Select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Seçiniz</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </Select>
            </FormField>

            <FormField label="Baz fiyat (TRY)">
              <Input
                type="number"
                value={basePrice}
                onChange={e => setBasePrice(e.target.value)}
                placeholder="ör. 59999"
              />
            </FormField>

            <div className="col-span-2">
              <FormField
                label="Açıklama"
                required
                hint={`${content[locale].aciklama.length}/200+ karakter önerilir`}
              >
                <textarea
                  value={content[locale].aciklama}
                  onChange={e => setContent(prev => ({
                    ...prev, [locale]: { ...prev[locale], aciklama: e.target.value }
                  }))}
                  placeholder="Ürünü detaylı açıklayın. Malzeme, konfor özellikleri, özel dokunuşlar..."
                  rows={4}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  className="px-3.5 py-2.5 border border-stone-200 rounded-lg text-[14px] bg-white
                    focus:outline-none focus:border-stone-700 transition-colors resize-y
                    placeholder:text-stone-300 leading-relaxed"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Module configuration */}
        {productType === "modular" && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <h2 className="font-['Crimson_Pro'] text-[18px] font-medium text-stone-800">
                Modül Konfigürasyonu
              </h2>
              {totalCbm > 0 && (
                <span className="text-[12px] text-stone-400 tabular-nums">
                  Toplam CBM: <strong className="text-stone-600">{totalCbm.toFixed(4)} m³</strong>
                </span>
              )}
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2.5">
              {modules.map(m => (
                <ModuleRow
                  key={m.id}
                  module={m}
                  onChange={updateModule}
                  onRemove={removeModule}
                />
              ))}
            </div>

            <button
              onClick={addModule}
              className="w-full mt-3 py-3 border border-dashed border-stone-300 rounded-xl
                text-[13px] font-medium text-stone-500 bg-stone-50 hover:bg-stone-100
                hover:border-stone-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              Modül Ekle
            </button>

            <div className="mt-3 flex items-start gap-2 text-[12px] text-stone-400">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <p>
                CBM (Cubic Metre) lojistik maliyeti için otomatik hesaplanır.
                Müşteri sayfasında da anlık görüntülenir. Hiçbir modül satın almada zorunlu değildir.
              </p>
            </div>
          </div>
        )}

        {/* Images */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="font-['Crimson_Pro'] text-[18px] font-medium text-stone-800
            pb-4 mb-5 border-b border-stone-100">
            Ürün Görselleri
          </h2>
          <div className="border-2 border-dashed border-stone-200 rounded-xl p-10 text-center
            bg-stone-50 hover:bg-stone-100 hover:border-stone-300 transition-all cursor-pointer group">
            <Upload size={32} className="mx-auto mb-3 text-stone-300 group-hover:text-stone-400 transition-colors" />
            <p className="text-[14px] text-stone-600 mb-1">Tıkla veya sürükle bırak</p>
            <p className="text-[12px] text-stone-400">PNG, JPG, WebP · Maks 5MB · 8 görsel</p>
            {productType === "modular" && (
              <p className="mt-2 text-[11px] text-blue-500">
                İpucu: Her modülün ayrı görseli onay sürecini hızlandırır
              </p>
            )}
          </div>
        </div>

        {/* Specs */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="font-['Crimson_Pro'] text-[18px] font-medium text-stone-800
            pb-4 mb-5 border-b border-stone-100">
            Teknik Özellikler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "En (cm)", placeholder: "230" },
              { label: "Derinlik (cm)", placeholder: "90" },
              { label: "Yükseklik (cm)", placeholder: "85" },
              { label: "Ağırlık (kg)", placeholder: "48" },
            ].map(f => (
              <FormField key={f.label} label={f.label}>
                <Input type="number" placeholder={f.placeholder} />
              </FormField>
            ))}
            <div className="col-span-2 md:col-span-4">
              <FormField label="Malzemeler">
                <Input placeholder="ör. Fırınlanmış gürgen, 32 DNS sünger, ahşap ayak" />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer kısmı */}
    <div className="sticky bottom-0 bg-white border-t border-stone-200 px-8 py-4 flex justify-end gap-3">
      <button className="px-5 py-2.5 border border-stone-200 rounded-lg text-[14px] font-medium text-stone-500 hover:bg-stone-50 transition-colors">
        Taslak Kaydet
      </button>
      
      {/* GÜNCELLENEN BUTON: */}
      <button 
        onClick={handleFinalSubmit}
        disabled={isSubmitting}
        className="px-6 py-2.5 bg-stone-900 text-white rounded-lg text-[14px] font-medium hover:bg-stone-700 transition-colors active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? "Gönderiliyor..." : "İncelemeye Gönder"}
      </button>
    </div>
    </div>
  );
}