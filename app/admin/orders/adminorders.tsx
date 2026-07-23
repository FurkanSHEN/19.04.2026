"use client";

import React, { useEffect, useState, useCallback } from "react"; // React buraya eklendi
import {
  Search, ChevronLeft, ChevronRight, Loader2,
  X, Package, MapPin, Phone, User,
  ShoppingCart, CheckCircle2, Clock, Truck,
  XCircle, AlertCircle, RefreshCw, Filter,
  Mail // Bir önceki hatada buraya eklemiştik
} from "lucide-react";
import {
  getAdminOrders, getOrderDetail, updateOrderStatus, getVendorList,
  type SiparisListeItem, type Siparis,
} from "./adminorderActions"; // import path'ini güncelle

// ─── Constants ────────────────────────────────────────────────────────────────

const DURUMLAR: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  yeni:           { label: "Yeni",           color: "bg-blue-50 text-blue-700 border-blue-200",     icon: ShoppingCart },
  hazirlaniyor:   { label: "Hazırlanıyor",   color: "bg-amber-50 text-amber-700 border-amber-200",  icon: Clock },
  uretimde:       { label: "Üretimde",       color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package },
  kargoda:        { label: "Kargoda",        color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Truck },
  teslim_edildi:  { label: "Teslim Edildi",  color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  iptal:          { label: "İptal",          color: "bg-red-50 text-red-700 border-red-200",        icon: XCircle },
};

const SAYFA_BOYUTLARI = [25, 50, 100];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTarih(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatTutar(tutar: number, birim: string) {
  if (birim === 'TRY') return `₺${tutar.toLocaleString('tr-TR')}`;
  if (birim === 'USD') return `$${tutar.toLocaleString('en-US')}`;
  if (birim === 'EUR') return `€${tutar.toLocaleString('de-DE')}`;
  return `${tutar} ${birim}`;
}

// ─── DurumBadge ───────────────────────────────────────────────────────────────

function DurumBadge({ durum }: { durum: string }) {
  const d = DURUMLAR[durum] || { label: durum, color: "bg-stone-100 text-stone-600 border-stone-200", icon: AlertCircle };
  const Icon = d.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 
      rounded-full border ${d.color}`}>
      <Icon size={10} />
      {d.label}
    </span>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderModal({ siparisId, onClose, onStatusUpdate }: {
  siparisId: number;
  onClose: () => void;
  onStatusUpdate: () => void;
}) {
  const [siparis, setSiparis] = useState<Siparis | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingDurum, setUpdatingDurum] = useState(false);

  useEffect(() => {
    getOrderDetail(siparisId).then(data => {
      setSiparis(data);
      setLoading(false);
    });
  }, [siparisId]);

  async function handleDurumGuncelle(yeniDurum: string) {
    setUpdatingDurum(true);
    const result = await updateOrderStatus(siparisId, yeniDurum);
    if (result.success && siparis) {
      setSiparis({ ...siparis, durum: yeniDurum });
      onStatusUpdate();
    }
    setUpdatingDurum(false);
  }

  const sonrakiDurumlar: Record<string, string[]> = {
    yeni:          ['hazirlaniyor', 'iptal'],
    hazirlaniyor:  ['uretimde', 'iptal'],
    uretimde:      ['kargoda', 'iptal'],
    kargoda:       ['teslim_edildi'],
    teslim_edildi: [],
    iptal:         [],
  };

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden 
          shadow-2xl flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <div>
              <h2 className="text-[17px] font-semibold text-stone-900">
                Sipariş #{siparisId.toString().padStart(6, '0')}
              </h2>
              {siparis && (
                <p className="text-[12px] text-stone-400 mt-0.5">
                  {formatTarih(siparis.created_at)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {siparis && <DurumBadge durum={siparis.durum} />}
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center">
                <X size={16} className="text-stone-500" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-stone-400" size={28} />
            </div>
          ) : siparis ? (
            <div className="flex-1 overflow-y-auto">

              {/* Müşteri + Teslimat */}
                <div className="grid grid-cols-2 gap-6 p-6 border-b border-stone-100 bg-white">
                  {/* Sol Taraf: Müşteri Bilgileri */}
                  <div className="bg-stone-50/50 rounded-2xl p-5 border border-stone-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-white rounded-lg border border-stone-200 shadow-sm">
                          <User size={14} className="text-stone-600" />
                        </div>
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-[0.15em]">
                          Müşteri Bilgileri
                        </span>
                      </div>
                      
                      <h3 className="text-[16px] font-bold text-stone-900 normalcase mb-3">
                        {siparis.profiles?.ad} {siparis.profiles?.soyad}
                      </h3>

                      <div className="space-y-2">
                        {siparis.profiles?.telefon && (
                          <div className="flex items-center gap-2.5 group">
                            <Phone size={14} className="text-stone-400" />
                            <a href={`tel:${siparis.profiles.telefon}`} className="text-[13px] text-stone-600 font-medium hover:text-stone-900 transition-colors">
                              {siparis.profiles.telefon}
                            </a>
                          </div>
                        )}
                        
                        {/* Email Bilgisi (user_id üzerinden veya profilden geliyorsa) */}
                        <div className="flex items-center gap-2.5">
                          <Mail size={14} className="text-stone-400" />
                          <span className="text-[13px] text-stone-600 font-medium">
                            {siparis.musteri_email || "E-posta belirtilmedi"}
                          </span>
                        </div>
                      </div>
                </div>

                {/* ID Bilgisi - En altta silik */}
                <div className="mt-6 pt-4 border-t border-stone-200/60">
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 uppercase tracking-tight">
                    <span>Kullanıcı ID:</span>
                    <span>{siparis.user_id}</span>
                  </div>
                </div>
              </div>

              {/* Sağ Taraf: Teslimat Bilgileri */}
              <div className="bg-stone-50/50 rounded-2xl p-5 border border-stone-100 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-white rounded-lg border border-stone-200 shadow-sm">
                    <MapPin size={14} className="text-stone-600" />
                  </div>
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-[0.15em]">
                    Teslimat Adresi
                  </span>
                </div>

                {siparis.teslimat_adresi ? (
                  <div className="flex flex-col h-full">
                    <div className="text-[14px] text-stone-700 leading-relaxed font-medium mb-4">
                      {siparis.teslimat_adresi.adres_satiri || siparis.teslimat_adresi.adres_tam || "—"}
                    </div>
                    
                    <div className="mt-auto">
                      <div className="bg-white p-3 rounded-xl border border-stone-200/60 shadow-sm">
                        <p className="text-[10px] text-stone-400 uppercase font-bold mb-1">Şehir / İlçe</p>
                        <p className="text-[12px] text-stone-900 font-bold">
                          {siparis.teslimat_adresi.il} / {siparis.teslimat_adresi.ilce}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-stone-200 rounded-xl">
                    <p className="text-[12px] text-stone-400 italic font-medium">Adres bilgisi bulunamadı</p>
                  </div>
                )}
              </div>
                </div>

              {/* Ürünler — gruplu tablo */}
              <div className="p-6 border-b border-stone-100">
                <h3 className="text-[12px] font-semibold text-stone-500 uppercase tracking-wider mb-3">
                  Sipariş Kalemleri
                </h3>

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="grid bg-stone-50 border-b border-stone-200 text-[11px] font-semibold
                    text-stone-500 uppercase tracking-wider"
                    style={{ gridTemplateColumns: '2fr 1fr 70px 110px 110px' }}>
                    <div className="px-4 py-2.5">Ürün / Modül</div>
                    <div className="px-4 py-2.5">Satıcı</div>
                    <div className="px-4 py-2.5 text-center">Adet</div>
                    <div className="px-4 py-2.5 text-right">Birim Fiyat</div>
                    <div className="px-4 py-2.5 text-right">Toplam</div>
                  </div>

                  {(() => {
                    // Ürün bazında grupla
                    const gruplar = (siparis.siparis_detay || []).reduce((acc, detay) => {
                      const key = detay.urunler?.ad || 'Ürün';
                      if (!acc[key]) {
                        acc[key] = {
                          ad: detay.urunler?.ad || 'Ürün',
                          gorsel: detay.urunler?.ana_gorsel,
                          vendor: (detay.vendors as any)?.ad || '—',
                          satirlar: [],
                          toplam: 0,
                        };
                      }
                      const modulAdi = detay.modul_secimi?.modul_adi
                        || detay.modul_secimi?.ana_modul
                        || null;
                      const satirToplam = parseFloat(String(detay.birim_fiyat)) * detay.adet;
                      acc[key].satirlar.push({
                        modulAdi,
                        adet: detay.adet,
                        birimFiyat: parseFloat(String(detay.birim_fiyat)),
                        toplam: satirToplam,
                      });
                      acc[key].toplam += satirToplam;
                      return acc;
                    }, {} as Record<string, {
                      ad: string;
                      gorsel: string | null | undefined;
                      vendor: string;
                      satirlar: { modulAdi: string | null; adet: number; birimFiyat: number; toplam: number }[];
                      toplam: number;
                    }>);

                    return Object.values(gruplar).map((grup, gi) => (
                      <div key={gi} className="border-b border-stone-100 last:border-b-0">
                        {/* Ürün başlık satırı */}
                        <div className="grid bg-stone-50/60 border-b border-stone-100 items-center"
                          style={{ gridTemplateColumns: '2fr 1fr 70px 110px 110px' }}>
                          <div className="px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 bg-stone-200 rounded-lg flex items-center justify-center
                              flex-shrink-0 overflow-hidden">
                              {grup.gorsel
                                ? <img src={grup.gorsel} alt="" className="w-full h-full object-cover" />
                                : <Package size={13} className="text-stone-400" />
                              }
                            </div>
                            <span className="text-[13px] font-semibold text-stone-900">{grup.ad}</span>
                          </div>
                          <div className="px-4 py-3 text-[12px] text-stone-500">{grup.vendor}</div>
                          <div className="px-4 py-3" />
                          <div className="px-4 py-3" />
                          <div className="px-4 py-3 text-[13px] font-semibold text-stone-700 text-right tabular-nums">
                            ₺{grup.toplam.toLocaleString('tr-TR')}
                          </div>
                        </div>

                        {/* Modül satırları */}
                        {grup.satirlar.map((satir, si) => (
                          <div key={si} className="grid hover:bg-stone-50/40 transition-colors"
                            style={{ gridTemplateColumns: '2fr 1fr 70px 110px 110px' }}>
                            <div className="px-4 py-2.5 flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-stone-300 flex-shrink-0 ml-4" />
                              <span className="text-[12px] text-stone-500">{satir.modulAdi || '—'}</span>
                            </div>
                            <div className="px-4 py-2.5" />
                            <div className="px-4 py-2.5 text-[12px] text-stone-600 text-center tabular-nums">
                              {satir.adet}
                            </div>
                            <div className="px-4 py-2.5 text-[12px] text-stone-600 text-right tabular-nums">
                              ₺{satir.birimFiyat.toLocaleString('tr-TR')}
                            </div>
                            <div className="px-4 py-2.5 text-[12px] text-stone-600 text-right tabular-nums">
                              ₺{satir.toplam.toLocaleString('tr-TR')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}

                 {/* Genel toplam - Flex yapısı ile en sola ve en sağa yaslama */}
                  <div className="flex items-center justify-between bg-stone-50 border-t-2 border-stone-200 px-6 py-5">
                    
                    {/* Sol Taraftaki Metin */}
                    <div className="px-4 py-3 col-span-4 text-[13px] font-medium text-stone-500 text-right pr-6">
                      Genel Toplam
                    </div>

                    {/* Sağ Taraftaki Fiyat */}
                    <div className="px-4 py-3 text-[16px] font-bold text-stone-900 text-right tabular-nums">
                      {formatTutar(siparis.toplam_fiyat, siparis.para_birimi)}
                    </div>
                  </div>
                </div>



                
              </div>

              {/* Durum Güncelleme */}
              {(sonrakiDurumlar[siparis.durum]?.length > 0) && (
                <div className="p-6">
                  <h3 className="text-[12px] font-semibold text-stone-500 uppercase tracking-wider mb-3">
                    Durumu Güncelle
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sonrakiDurumlar[siparis.durum]?.map(d => {
                      const durum = DURUMLAR[d];
                      const Icon = durum?.icon || AlertCircle;
                      return (
                        <button
                          key={d}
                          onClick={() => handleDurumGuncelle(d)}
                          disabled={updatingDurum}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] 
                            font-medium border transition-all disabled:opacity-50
                            ${d === 'iptal'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                        >
                          {updatingDurum
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Icon size={13} />
                          }
                          {durum?.label || d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-stone-400">Sipariş bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminOrders() {
  const [siparisler, setSiparisler] = useState<SiparisListeItem[]>([]);
  const [toplam, setToplam] = useState(0);
  const [toplamSayfa, setToplamSayfa] = useState(1);
  const [loading, setLoading] = useState(true);
  const [vendorlar, setVendorlar] = useState<{ id: number; ad: string }[]>([]);

  // Filtreler
  const [sayfa, setSayfa] = useState(1);
  const [sayfaBoyutu, setSayfaBoyutu] = useState(25);
  const [durumFiltre, setDurumFiltre] = useState("");
  const [aramaId, setAramaId] = useState("");
  const [vendorFiltre, setVendorFiltre] = useState("");
  const [baslangicTarih, setBaslangicTarih] = useState("");
  const [bitisTarih, setBitisTarih] = useState("");

  // Modal
  const [modalSiparisId, setModalSiparisId] = useState<number | null>(null);

  async function fetchSiparisler() {
    setLoading(true);
    try {
      const result = await getAdminOrders({
        sayfa, sayfaBoyutu, durum: durumFiltre,
        aramaId, vendorId: vendorFiltre,
        baslangicTarih, bitisTarih,
      });
      setSiparisler(result.siparisler);
      setToplam(result.toplam);
      setToplamSayfa(result.toplamSayfa);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getVendorList().then(setVendorlar);
  }, []);

  useEffect(() => {
    fetchSiparisler();
  }, [sayfa, sayfaBoyutu, durumFiltre, vendorFiltre, baslangicTarih, bitisTarih]);

  // Arama debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSayfa(1);
      fetchSiparisler();
    }, 400);
    return () => clearTimeout(t);
  }, [aramaId]);

  function handleFiltreSifirla() {
    setDurumFiltre("");
    setAramaId("");
    setVendorFiltre("");
    setBaslangicTarih("");
    setBitisTarih("");
    setSayfa(1);
  }

  const aktifFiltreSayisi = [durumFiltre, aramaId, vendorFiltre, baslangicTarih, bitisTarih]
    .filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['Crimson_Pro'] text-[32px] font-medium text-stone-900 mb-1">
              Sipariş & Üretim
            </h1>
            <p className="text-[14px] text-stone-500">
              Toplam {toplam.toLocaleString('tr-TR')} sipariş
            </p>
          </div>
          <button
            onClick={fetchSiparisler}
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg
              text-[13px] text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <RefreshCw size={14} />
            Yenile
          </button>
        </div>

        {/* Filtreler */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">

            {/* Sipariş No Arama */}
            <div className="flex items-center border border-stone-200 rounded-lg px-3 gap-2 
              focus-within:ring-2 focus-within:ring-stone-300 min-w-[180px]">
              <Search size={14} className="text-stone-400 flex-shrink-0" />
              <input
                type="number"
                placeholder="Sipariş No..."
                value={aramaId}
                onChange={e => { setAramaId(e.target.value); setSayfa(1); }}
                className="flex-1 py-2 text-[14px] focus:outline-none bg-transparent"
              />
            </div>

            {/* Durum filtresi */}
            <select
              value={durumFiltre}
              onChange={e => { setDurumFiltre(e.target.value); setSayfa(1); }}
              className="border border-stone-200 rounded-lg px-3 py-2 text-[13px] text-stone-700
                focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white"
            >
              <option value="">Tüm Durumlar</option>
              {Object.entries(DURUMLAR).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>

            {/* Vendor filtresi */}
            <select
              value={vendorFiltre}
              onChange={e => { setVendorFiltre(e.target.value); setSayfa(1); }}
              className="border border-stone-200 rounded-lg px-3 py-2 text-[13px] text-stone-700
                focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white"
            >
              <option value="">Tüm Satıcılar</option>
              {vendorlar.map(v => (
                <option key={v.id} value={String(v.id)}>{v.ad}</option>
              ))}
            </select>

            {/* Sayfa boyutu */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[12px] text-stone-400">Göster:</span>
              <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                {SAYFA_BOYUTLARI.map(b => (
                  <button
                    key={b}
                    onClick={() => { setSayfaBoyutu(b); setSayfa(1); }}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all
                      ${sayfaBoyutu === b
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-700"
                      }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tarih aralığı */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-stone-400">Tarih:</span>
              <input
                type="date"
                value={baslangicTarih}
                onChange={e => { setBaslangicTarih(e.target.value); setSayfa(1); }}
                className="border border-stone-200 rounded-lg px-3 py-1.5 text-[13px]
                  focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
              <span className="text-[12px] text-stone-400">—</span>
              <input
                type="date"
                value={bitisTarih}
                onChange={e => { setBitisTarih(e.target.value); setSayfa(1); }}
                className="border border-stone-200 rounded-lg px-3 py-1.5 text-[13px]
                  focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            {aktifFiltreSayisi > 0 && (
              <button
                onClick={handleFiltreSifirla}
                className="flex items-center gap-1.5 text-[12px] text-stone-500 
                  hover:text-stone-700 transition-colors ml-1"
              >
                <X size={12} />
                Filtreleri Temizle ({aktifFiltreSayisi})
              </button>
            )}
          </div>
        </div>

        {/* Tablo */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">

          {/* Tablo header */}
          <div className="grid grid-cols-[60px_1fr_160px_120px_100px_100px] gap-4 
            px-5 py-3 border-b border-stone-100 bg-stone-50">
            {["#", "Müşteri", "Tarih", "Tutar", "Ürün", "Durum"].map(h => (
              <span key={h} className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-stone-400" size={28} />
            </div>
          ) : siparisler.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart size={40} className="mx-auto mb-3 text-stone-300" />
              <p className="text-[14px] text-stone-500">Sipariş bulunamadı</p>
            </div>
          ) : (
            <div>
              {siparisler.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => setModalSiparisId(s.id)}
                  className={`grid grid-cols-[60px_1fr_160px_120px_100px_100px] gap-4 
                    px-5 py-3.5 items-center cursor-pointer transition-colors
                    hover:bg-stone-50 
                    ${i < siparisler.length - 1 ? "border-b border-stone-100" : ""}
                  `}
                >
                  <span className="text-[13px] font-mono text-stone-400">
                    #{s.id.toString().padStart(4, '0')}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-stone-900">
                      {s.musteri_ad !== "—" ? `${s.musteri_ad} ${s.musteri_soyad}` : "Misafir"}
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono">
                      {s.user_id.slice(0, 12)}...
                    </p>
                  </div>
                  <span className="text-[12px] text-stone-500">
                    {formatTarih(s.created_at)}
                  </span>
                  <span className="text-[14px] font-semibold text-stone-900 tabular-nums">
                    {formatTutar(s.toplam_fiyat, s.para_birimi)}
                  </span>
                  <span className="text-[13px] text-stone-500">
                    {s.urun_sayisi} kalem
                  </span>
                  <DurumBadge durum={s.durum} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {toplamSayfa > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-stone-400">
              {((sayfa - 1) * sayfaBoyutu) + 1}–{Math.min(sayfa * sayfaBoyutu, toplam)} / {toplam} sipariş
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSayfa(p => Math.max(1, p - 1))}
                disabled={sayfa === 1}
                className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center
                  hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} className="text-stone-600" />
              </button>

              {Array.from({ length: Math.min(5, toplamSayfa) }, (_, i) => {
                const p = toplamSayfa <= 5
                  ? i + 1
                  : sayfa <= 3
                    ? i + 1
                    : sayfa >= toplamSayfa - 2
                      ? toplamSayfa - 4 + i
                      : sayfa - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setSayfa(p)}
                    className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors
                      ${sayfa === p
                        ? "bg-stone-900 text-white"
                        : "border border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setSayfa(p => Math.min(toplamSayfa, p + 1))}
                disabled={sayfa === toplamSayfa}
                className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center
                  hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} className="text-stone-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {modalSiparisId && (
        <OrderModal
          siparisId={modalSiparisId}
          onClose={() => setModalSiparisId(null)}
          onStatusUpdate={fetchSiparisler}
        />
      )}
    </div>
  );
}