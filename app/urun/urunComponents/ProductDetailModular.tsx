"use client";

import { useState, useMemo } from "react";
import { Package, Truck, Calendar, MapPin, Check, ChevronDown, ChevronUp, Info, Bookmark, ShoppingBag } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Module {
  id: number;
  modul_adi: string;
  fiyat: number;
  genislik: number | null;
  derinlik: number | null;
  yukseklik: number | null;
  cbm: number | null;
  agirlik_kg: number | null;
  varsayilan_adet: number;
}

export interface Variant {
  id: string;
  ad: string;
  hex: string;
}

export interface Product {
  id: number;
  ad: string;
  aciklama: string;
  kategori: string;
  koleksiyon: string;
  urun_ilk_foto: string | null;
  vendors: { ad: string };
  urun_modulleri: Module[];
  ekstra_ozellikler?: Record<string, boolean>;
}

interface Props {
  product: Product;
  /** ISO-4217 code, e.g. "EUR" */
  currency?: string;
  /** Shipping destination label */
  destination?: string;
  /** €/m³ shipping rate */
  shippingRatePerCbm?: number;
  /** VAT rate (0–1) */
  vatRate?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FABRIC_VARIANTS: Variant[] = [
  { id: "bej", ad: "Bej Kadife", hex: "#D4C5B0" },
  { id: "sage", ad: "Adaçayı Yeşili", hex: "#8A9A8F" },
  { id: "forest", ad: "Orman Yeşili", hex: "#4A5D5C" },
  { id: "camel", ad: "Deve Tüyü", hex: "#C9B5A0" },
  { id: "charcoal", ad: "Antrasit", hex: "#5D5C5A" },
  { id: "krem", ad: "Krem", hex: "#E8DED2" },
];

const LEG_VARIANTS: Variant[] = [
  { id: "walnut", ad: "Ceviz Ahşap", hex: "#5D4037" },
  { id: "oak", ad: "Meşe", hex: "#D7CCC8" },
  { id: "black", ad: "Siyah Metal", hex: "#212121" },
  { id: "steel", ad: "Fırçalanmış Çelik", hex: "#B0BEC5" },
];

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SwatchRow({ label, variants, selected, onSelect }: {
  label: string;
  variants: Variant[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[13px] font-medium text-stone-800">{label}</span>
        <span className="text-[12px] text-stone-400">
          {variants.find(v => v.id === selected)?.ad}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {variants.map(v => (
          <button
            key={v.id}
            title={v.ad}
            onClick={() => onSelect(v.id)}
            className={`
              w-8 h-8 rounded-lg border-2 transition-all duration-150 relative
              ${selected === v.id
                ? "border-stone-800 scale-110 shadow-sm"
                : "border-stone-200 hover:border-stone-400 hover:scale-105"}
            `}
            style={{ background: v.hex }}
          >
            {selected === v.id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check size={12} className="text-white drop-shadow" strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ module, qty, onQtyChange }: {
  module: Module;
  qty: number;
  onQtyChange: (delta: number) => void;
}) {
  const isSelected = qty > 0;

  return (
    <div
      className={`
        relative border rounded-xl p-3.5 transition-all duration-200 cursor-pointer group
        ${isSelected
          ? "border-stone-800 bg-stone-50 shadow-sm"
          : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50"}
      `}
      onClick={() => !isSelected && onQtyChange(1)}
    >
      {isSelected && (
        <span className="absolute top-2.5 right-2.5 w-4.5 h-4.5 bg-stone-800 rounded-full flex items-center justify-center">
          <Check size={9} className="text-white" strokeWidth={3} />
        </span>
      )}
      <p className="text-[13px] font-medium text-stone-800 mb-1 pr-5">{module.modul_adi}</p>
      {(module.genislik && module.derinlik && module.yukseklik) ? (
        <p className="text-[11px] text-stone-400 mb-2 tabular-nums">
          {module.genislik}×{module.derinlik}×{module.yukseklik} cm
          {module.cbm != null && <> · {module.cbm.toFixed(3)} m³</>}
        </p>
      ) : null}
      <p className="text-[14px] font-semibold text-stone-800 mb-2.5">
        {fmt(module.fiyat, "TRY")}
      </p>

      <div
        className={`flex items-center justify-between pt-2.5 border-t border-stone-100
          transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
        onClick={e => e.stopPropagation()}
      >
        <span className="text-[11px] text-stone-400">Adet</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQtyChange(-1)}
            className="w-5 h-5 border border-stone-200 rounded-md bg-white hover:bg-stone-100 hover:border-stone-300
              text-stone-600 text-sm flex items-center justify-center transition-colors"
          >−</button>
          <span className="text-[13px] font-medium w-4 text-center tabular-nums">{qty}</span>
          <button
            onClick={() => onQtyChange(1)}
            className="w-5 h-5 border border-stone-200 rounded-md bg-white hover:bg-stone-100 hover:border-stone-300
              text-stone-600 text-sm flex items-center justify-center transition-colors"
          >+</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductDetailModular({
  product,
  currency = "EUR",
  destination = "Almanya",
  shippingRatePerCbm = 185,
  vatRate = 0.19,
}: Props) {
  // Init qty from varsayilan_adet
  const initQty = useMemo(() => {
    const map: Record<number, number> = {};
    product.urun_modulleri.forEach(m => { map[m.id] = m.varsayilan_adet ?? 0; });
    return map;
  }, [product]);

  const [quantities, setQuantities] = useState<Record<number, number>>(initQty);
  const [selectedFabric, setSelectedFabric] = useState("bej");
  const [selectedLeg, setSelectedLeg] = useState("walnut");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleQty = (id: number, delta: number) =>
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));

  // Live calculations
  const { modulesTotal, totalCbm, shipping, vat, grandTotal, selectedLines } = useMemo(() => {
    let modulesTotal = 0;
    let totalCbm = 0;
    const selectedLines: { name: string; qty: number; price: number }[] = [];

    product.urun_modulleri.forEach(m => {
      const qty = quantities[m.id] ?? 0;
      if (qty > 0) {
        modulesTotal += m.fiyat * qty;
        totalCbm += (m.cbm ?? 0) * qty;
        selectedLines.push({ name: m.modul_adi, qty, price: m.fiyat * qty });
      }
    });

    const shipping = Math.round(totalCbm * shippingRatePerCbm);
    const vat = Math.round((modulesTotal + shipping) * vatRate);
    const grandTotal = modulesTotal + shipping + vat;
    return { modulesTotal, totalCbm, shipping, vat, grandTotal, selectedLines };
  }, [quantities, product, shippingRatePerCbm, vatRate]);

  const hasSelection = selectedLines.length > 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-14">

          {/* ── Gallery ── */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200
              rounded-2xl flex items-center justify-center text-stone-400 text-sm mb-4 relative overflow-hidden">
              <div className="text-center">
                <div className="text-4xl mb-2">🛋</div>
                <p className="text-stone-400 text-sm">{product.ad} · {product.koleksiyon}</p>
              </div>
              <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-stone-200
                rounded-full px-3.5 py-2 text-[12px] font-medium text-stone-700 hover:bg-white
                transition-all hover:scale-105 shadow-sm">
                📦 3D Önizleme
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br
                  ${i === 0 ? "from-stone-200 to-stone-300 ring-2 ring-stone-800 ring-offset-2" : "from-stone-100 to-stone-200"}
                  cursor-pointer hover:opacity-80 transition-opacity`} />
              ))}
            </div>
          </div>

          {/* ── Details ── */}
          <div className="pt-1">
            <p className="text-[11px] tracking-widest uppercase text-stone-400 mb-2">
              {product.vendors?.ad}
            </p>
            <h1 className="font-['Crimson_Pro'] text-4xl font-medium text-stone-900 leading-tight mb-6">
              {product.ad}
            </h1>

            {/* Configurator */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-5">
              <h2 className="font-['Crimson_Pro'] text-[17px] font-medium text-stone-800 pb-3.5
                border-b border-stone-100 mb-4">
                Konfigurasyon — Mix & Match
              </h2>

              <p className="text-[12px] text-stone-400 mb-3 flex items-center gap-1.5">
                <Info size={12} />
                Hiçbir modül zorunlu değil. İstediğiniz kombinasyonu seçin.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {product.urun_modulleri.map(m => (
                  <ModuleCard
                    key={m.id}
                    module={m}
                    qty={quantities[m.id] ?? 0}
                    onQtyChange={d => handleQty(m.id, d)}
                  />
                ))}
              </div>

              <SwatchRow
                label="Kumaş rengi"
                variants={FABRIC_VARIANTS}
                selected={selectedFabric}
                onSelect={setSelectedFabric}
              />
              <SwatchRow
                label="Ayak tipi"
                variants={LEG_VARIANTS}
                selected={selectedLeg}
                onSelect={setSelectedLeg}
              />

              {/* Live logistics */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 mt-1">
                <div className="space-y-2">
                  {[
                    { icon: <Package size={13} />, label: "Toplam CBM", value: `${totalCbm.toFixed(3)} m³` },
                    { icon: <Truck size={13} />, label: `Kargo (TR→${destination})`, value: hasSelection ? fmt(shipping, currency) : "—" },
                    { icon: <Calendar size={13} />, label: "Tahmini teslimat", value: "7–10 iş günü" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-[12px] text-blue-800">
                      <span className="flex items-center gap-1.5 text-blue-600">{row.icon}{row.label}</span>
                      <span className="font-medium tabular-nums">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-stone-100/70 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-3 text-[13px] text-stone-500">
                <MapPin size={13} />
                <span>Teslimat:</span>
                <span className="bg-white text-stone-800 font-medium px-2.5 py-0.5 rounded-full text-[12px]">
                  {destination}
                </span>
              </div>

              {/* Config summary */}
              {hasSelection && (
                <div className="bg-white border border-stone-200 rounded-xl p-3 mb-3">
                  <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-2">
                    Seçiminiz
                  </p>
                  <div className="space-y-1.5">
                    {selectedLines.map(l => (
                      <div key={l.name} className="flex justify-between text-[13px]">
                        <span className="text-stone-600">{l.qty}× {l.name}</span>
                        <span className="font-medium tabular-nums">{fmt(l.price, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakdown toggle */}
              <button
                onClick={() => setShowBreakdown(p => !p)}
                className="w-full flex items-center justify-between text-[13px] text-stone-500
                  py-2.5 border-t border-stone-200 hover:text-stone-700 transition-colors"
              >
                <span>Fiyat detayı</span>
                {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showBreakdown && (
                <div className="space-y-1.5 pt-2 pb-2.5 border-b border-stone-200 mb-3">
                  {[
                    { label: "Modüller toplamı", val: fmt(modulesTotal, currency) },
                    { label: `Kargo (${totalCbm.toFixed(3)} m³)`, val: fmt(shipping, currency) },
                    { label: `KDV (%${Math.round(vatRate * 100)})`, val: fmt(vat, currency) },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-[13px]">
                      <span className="text-stone-500">{r.label}</span>
                      <span className="tabular-nums">{r.val}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-baseline justify-between mt-2">
                <span className="text-[14px] font-medium text-stone-700">Toplam</span>
                <span className="font-['Crimson_Pro'] text-3xl font-medium text-stone-900 tabular-nums">
                  {hasSelection ? fmt(grandTotal, currency) : "—"}
                </span>
              </div>

              <p className="text-[11px] text-stone-400 mt-1.5">
                💡 Seçiminize göre anlık güncellenir. Gizli ücret yoktur.
              </p>
            </div>

            <button
              disabled={!hasSelection}
              className="w-full py-4 bg-stone-900 text-white rounded-xl text-[15px] font-medium
                transition-all hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed
                active:scale-[0.98] mb-2.5"
            >
              <span className="flex items-center justify-center gap-2">
                <ShoppingBag size={16} />
                Sepete Ekle
              </span>
            </button>
            <button className="w-full py-3.5 bg-white border border-stone-200 text-stone-700
              rounded-xl text-[14px] font-medium transition-all hover:bg-stone-50 hover:border-stone-300 active:scale-[0.98]">
              <span className="flex items-center justify-center gap-2">
                <Bookmark size={15} />
                Konfigürasyonu Kaydet
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}