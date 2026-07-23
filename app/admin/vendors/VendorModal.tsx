"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Building, DollarSign, TrendingUp, Truck, Award } from "lucide-react";
import { createVendor, updateVendor, type VendorFormData, type Vendor, type VendorDurum, type PaketlemeTipi } from "../vendors/actions";

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingVendor?: Vendor | null;
}

type TabType = 'temel' | 'finansal' | 'performans' | 'lojistik' | 'marka';

export default function VendorModalV2({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingVendor 
}: VendorModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('temel');
  const [formData, setFormData] = useState<VendorFormData>({
    ad: "",
    email: "",
    telefon: "",
    durum: "incelemede",
    yetkili_kisi_adi: "",
    yetkili_kisi_unvan: "",
    vergi_dairesi: "",
    vergi_no: "",
    iban: "",
    komisyon_orani: 15,
    guven_skoru: 50,
    ortalama_uretim_suresi: 21,
    depo_lokasyonu: "",
    uretim_lokasyonu: "",
    ihracat_yetkinligi: false,
    paketleme_tipi: "flat-pack",
    gumrukleme_tecrubesi: false,
    marka_hikayesi: "",
    sertifikalar: [],
    garanti_suresi_yil: 2,
    zanaat_yili: undefined,
    website_url: "",
    dahili_notlar: "",
  });

  const guvenSkoru = formData.guven_skoru ?? 0;

  // Düzenleme modunda form'u doldur
  useEffect(() => {
    if (editingVendor) {
      setFormData({
        ad: editingVendor.ad,
        email: editingVendor.email,
        telefon: editingVendor.telefon || "",
        durum: editingVendor.durum,
        yetkili_kisi_adi: editingVendor.yetkili_kisi_adi || "",
        yetkili_kisi_unvan: editingVendor.yetkili_kisi_unvan || "",
        vergi_dairesi: editingVendor.vergi_dairesi || "",
        vergi_no: editingVendor.vergi_no || "",
        iban: editingVendor.iban || "",
        komisyon_orani: editingVendor.komisyon_orani,
        guven_skoru: editingVendor.guven_skoru,
        ortalama_uretim_suresi: editingVendor.ortalama_uretim_suresi,
        depo_lokasyonu: editingVendor.depo_lokasyonu || "",
        uretim_lokasyonu: editingVendor.uretim_lokasyonu || "",
        ihracat_yetkinligi: editingVendor.ihracat_yetkinligi,
        paketleme_tipi: editingVendor.paketleme_tipi,
        gumrukleme_tecrubesi: editingVendor.gumrukleme_tecrubesi,
        marka_hikayesi: editingVendor.marka_hikayesi || "",
        sertifikalar: editingVendor.sertifikalar || [],
        garanti_suresi_yil: editingVendor.garanti_suresi_yil,
        zanaat_yili: editingVendor.zanaat_yili || undefined,
        website_url: editingVendor.website_url || "",
        dahili_notlar: editingVendor.dahili_notlar || "",
      });
    }
    setError(null);
    setActiveTab('temel');
  }, [editingVendor, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (editingVendor) {
        result = await updateVendor(editingVendor.id, formData);
      } else {
        result = await createVendor(formData);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Bir hata oluştu");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const tabs = [
    { id: 'temel', label: 'Temel Bilgiler', icon: Building },
    { id: 'finansal', label: 'Finansal', icon: DollarSign },
    { id: 'performans', label: 'Performans', icon: TrendingUp },
    { id: 'lojistik', label: 'Lojistik', icon: Truck },
    { id: 'marka', label: 'Marka', icon: Award },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Crimson_Pro'] text-[22px] font-medium text-stone-900">
                {editingVendor ? "Vendor Düzenle" : "Yeni Vendor Ekle"}
              </h2>
              <p className="text-[13px] text-stone-500 mt-1">
                Premium mobilya platformu için detaylı vendor bilgileri
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center
                transition-colors"
            >
              <X size={18} className="text-stone-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px]
                    font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            
            {/* Hata mesajı */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[13px] text-red-700">{error}</p>
              </div>
            )}

            {/* TAB 1: Temel Bilgiler */}
            {activeTab === 'temel' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Firma Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ad}
                      onChange={(e) => setFormData(prev => ({ ...prev, ad: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Örn: Senzia Home"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Durum
                    </label>
                    <select
                      value={formData.durum}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        durum: e.target.value as VendorDurum 
                      }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="pasif">Pasif</option>
                      <option value="incelemede">İncelemede</option>
                      <option value="kisitli">Kısıtlı (Ödeme Bekletilen)</option>
                      <option value="tatil_modu">Tatil Modu</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="info@firma.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.telefon}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Yetkili Kişi Adı
                    </label>
                    <input
                      type="text"
                      value={formData.yetkili_kisi_adi}
                      onChange={(e) => setFormData(prev => ({ ...prev, yetkili_kisi_adi: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Ahmet Yılmaz"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Unvan
                    </label>
                    <input
                      type="text"
                      value={formData.yetkili_kisi_unvan}
                      onChange={(e) => setFormData(prev => ({ ...prev, yetkili_kisi_unvan: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Genel Müdür"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="https://firma.com"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Finansal */}
            {activeTab === 'finansal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Vergi Dairesi
                    </label>
                    <input
                      type="text"
                      value={formData.vergi_dairesi}
                      onChange={(e) => setFormData(prev => ({ ...prev, vergi_dairesi: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Kadıköy"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Vergi No
                    </label>
                    <input
                      type="text"
                      value={formData.vergi_no}
                      onChange={(e) => setFormData(prev => ({ ...prev, vergi_no: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                    placeholder="TR33 0006 1005 1978 6457 8413 26"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Komisyon Oranı: %{formData.komisyon_orani}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="0.5"
                    value={formData.komisyon_orani}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      komisyon_orani: parseFloat(e.target.value) 
                    }))}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-stone-500">%5</span>
                    <span className="text-[12px] font-medium text-stone-700">
                      Platform komisyonu
                    </span>
                    <span className="text-[11px] text-stone-500">%30</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-[12px] text-blue-700 leading-relaxed">
                    💡 <strong>Not:</strong> Standart komisyon %15'tir. Premium vendor'lar için %10-12 aralığında 
                    özel anlaşmalar yapılabilir.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Performans */}
            {activeTab === 'performans' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Güven Skoru: {formData.guven_skoru}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.guven_skoru}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      guven_skoru: parseInt(e.target.value) 
                    }))}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-stone-500">0</span>
                    <span className={`text-[12px] font-medium ${
                      guvenSkoru >= 80 ? "text-green-600" :
                      guvenSkoru >= 60 ? "text-amber-600" :
                      "text-red-600"
                    }`}>
                      {guvenSkoru >= 80 ? "Gemide Ödeme ✓" :
                      guvenSkoru >= 60 ? "Gelişiyor" :
                      "Teslimatta Ödeme"}
                    </span>
                    <span className="text-[11px] text-stone-500">100</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Ortalama Üretim Süresi (Gün)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.ortalama_uretim_suresi}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      ortalama_uretim_suresi: parseInt(e.target.value) || 21
                    }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="21"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Müşteriye vaat edilen termin süresi için kritik (iş günü)
                  </p>
                </div>

                {editingVendor && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-lg">
                      <p className="text-[12px] text-stone-500 mb-1">İade Oranı</p>
                      <p className="text-[18px] font-semibold text-stone-900">
                        %{editingVendor.iade_orani.toFixed(1)}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1">Auto-hesaplanan</p>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-lg">
                      <p className="text-[12px] text-stone-500 mb-1">Hasarlı Teslimat</p>
                      <p className="text-[18px] font-semibold text-stone-900">
                        %{editingVendor.hasarli_teslimat_orani.toFixed(1)}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1">Auto-hesaplanan</p>
                    </div>
                  </div>
                )}
              </div>
            )}
        
            {/* TAB 4: Lojistik */}
            {activeTab === 'lojistik' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Depo Lokasyonu
                  </label>
                  <textarea
                    value={formData.depo_lokasyonu}
                    onChange={(e) => setFormData(prev => ({ ...prev, depo_lokasyonu: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="İstanbul, Tuzla Organize Sanayi Bölgesi"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Üretim Lokasyonu
                  </label>
                  <textarea
                    value={formData.uretim_lokasyonu}
                    onChange={(e) => setFormData(prev => ({ ...prev, uretim_lokasyonu: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="İstanbul, Tuzla"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Paketleme Tipi
                  </label>
                  <select
                    value={formData.paketleme_tipi}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      paketleme_tipi: e.target.value as PaketlemeTipi 
                    }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="flat-pack">📦 Flat-Pack (Demonte)</option>
                    <option value="kurulu">📦 Kurulu (Montajlı)</option>
                    <option value="mix">📦 Karışık</option>
                  </select>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Navlun hesabı için kritik (m³ hesaplama)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 border border-stone-300 rounded-lg
                    hover:border-stone-400 transition-colors cursor-pointer"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      ihracat_yetkinligi: !prev.ihracat_yetkinligi 
                    }))}
                  >
                    <input
                      type="checkbox"
                      checked={formData.ihracat_yetkinligi}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 text-green-600 border-stone-300 rounded
                        focus:ring-2 focus:ring-green-500"
                    />
                    <div>
                      <p className="text-[14px] font-medium text-stone-900">İhracat Yetkinliği</p>
                      <p className="text-[12px] text-stone-500 mt-0.5">
                        Yurt dışına daha önce sevkiyat yaptı
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border border-stone-300 rounded-lg
                    hover:border-stone-400 transition-colors cursor-pointer"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      gumrukleme_tecrubesi: !prev.gumrukleme_tecrubesi 
                    }))}
                  >
                    <input
                      type="checkbox"
                      checked={formData.gumrukleme_tecrubesi}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-stone-300 rounded
                        focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-[14px] font-medium text-stone-900">Gümrükleme Tecrübesi</p>
                      <p className="text-[12px] text-stone-500 mt-0.5">
                        Gümrük işlemlerinde deneyimli
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-[12px] text-amber-700 leading-relaxed">
                    🌍 <strong>Almanya ve İspanya:</strong> İhracat yetkinliği olan vendor'lar 
                    uluslararası siparişlerde öncelikli gösterilir.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 5: Marka */}
            {activeTab === 'marka' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Marka Hikayesi
                  </label>
                  <textarea
                    value={formData.marka_hikayesi}
                    onChange={(e) => setFormData(prev => ({ ...prev, marka_hikayesi: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="Zanaatkarlık geçmişinizi anlatın... (Web sitesinde 'Hikayemiz' bölümünde kullanılacak)"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Garanti Süresi (Yıl)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.garanti_suresi_yil}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        garanti_suresi_yil: parseInt(e.target.value) || 2
                      }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="2"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      Standart 2 yıl. Premium için 5-10 yıl.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-2">
                      Kuruluş Yılı
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.zanaat_yili || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        zanaat_yili: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="1995"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Sertifikalar
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['E1 Belgesi', 'ISO 9001', 'FSC', 'CE', 'TSE'].map(cert => (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            const current = prev.sertifikalar || [];
                            const exists = current.includes(cert);
                            return {
                              ...prev,
                              sertifikalar: exists
                                ? current.filter(c => c !== cert)
                                : [...current, cert]
                            };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          (formData.sertifikalar || []).includes(cert)
                            ? "bg-green-100 text-green-700 border-2 border-green-300"
                            : "bg-stone-100 text-stone-600 border-2 border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        {(formData.sertifikalar || []).includes(cert) ? '✓ ' : ''}
                        {cert}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Başka bir sertifika ekle..."
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg text-[13px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const newCert = e.currentTarget.value.trim();
                        setFormData(prev => ({
                          ...prev,
                          sertifikalar: [...(prev.sertifikalar || []), newCert]
                        }));
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Sertifika adını yazıp Enter'a bas
                  </p>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-2">
                    Dahili Notlar (Sadece admin görür)
                  </label>
                  <textarea
                    value={formData.dahili_notlar}
                    onChange={(e) => setFormData(prev => ({ ...prev, dahili_notlar: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
                    placeholder="Vendor ile ilgili özel notlar..."
                    rows={3}
                  />
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-[12px] text-purple-700 leading-relaxed">
                    🏆 <strong>Premium Algı:</strong> Sertifikalar ve garanti süresi ürün sayfalarında 
                    gösterilir. Zanaatkarlık hikayesi marka sayfasında kullanılır.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t border-stone-200 flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 border border-stone-300 text-stone-700 rounded-lg
                text-[14px] font-medium hover:bg-stone-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-[14px]
                font-medium hover:bg-stone-700 transition-colors disabled:opacity-50
                disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Kaydediliyor..." : editingVendor ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
