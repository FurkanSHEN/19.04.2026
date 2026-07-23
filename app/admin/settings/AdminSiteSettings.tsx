"use client";

import { useState, useEffect } from "react";
import { getSiteAyarlari, updateSiteAyari, uploadSiteGorsel, getSiteGorselleri, type SiteAyari } from "./actions";
import { Loader2, Check, AlertCircle, Upload, Images } from "lucide-react";

// ─── Sub Components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-stone-800" : "bg-stone-200"
      }`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
        checked ? "left-5" : "left-0.5"
      }`} />
    </button>
  );
}

function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-stone-700">{label}</label>
      {children}
      {hint && <p className="text-[12px] text-stone-400">{hint}</p>}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-[14px]
        focus:outline-none focus:border-stone-700 transition-colors bg-white
        placeholder:text-stone-300" />
  );
}

function Section({ title, aktif, onAktifChange, children }: {
  title: string;
  aktif: boolean;
  onAktifChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
        <h2 className="font-serif text-[18px] text-stone-800">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-stone-400">{aktif ? "Aktif" : "Pasif"}</span>
          <Toggle checked={aktif} onChange={onAktifChange} />
        </div>
      </div>
      <div className={`px-6 py-5 space-y-4 transition-opacity ${aktif ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminSiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gorselYukleniyor, setGorselYukleniyor] = useState(false);
  const [basari, setBasari] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [gorselSecici, setGorselSecici] = useState(false);
  const [mevcutGorseller, setMevcutGorseller] = useState<string[]>([]);

  const [ayarlar, setAyarlar] = useState<Record<string, SiteAyari>>({});

  useEffect(() => {
    getSiteAyarlari().then(data => {
      setAyarlar(data);
      setLoading(false);
    });
  }, []);

  function getAciklama(anahtar: string): string {
    return ayarlar[anahtar]?.aciklama || "";
  }

  function getAktif(anahtar: string): boolean {
    return ayarlar[anahtar]?.aktif ?? true;
  }

  function setAciklama(anahtar: string, aciklama: string) {
    setAyarlar(prev => ({
      ...prev,
      [anahtar]: { ...prev[anahtar], aciklama }
    }));
  }

  function setAktif(anahtar: string, aktif: boolean) {
    setAyarlar(prev => ({
      ...prev,
      [anahtar]: { ...prev[anahtar], aktif }
    }));
  }

  async function handleGorselYukle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setGorselYukleniyor(true);
    const result = await uploadSiteGorsel(file, "hero");
    if (result.success && result.url) {
      setAciklama("hero_gorsel", result.url);
    } else {
      setHata(result.error || "Görsel yüklenemedi.");
    }
    setGorselYukleniyor(false);
  }

  async function handleGorsellerGoster() {
    const gorseller = await getSiteGorselleri();
    setMevcutGorseller(gorseller);
    setGorselSecici(true);
  }

  async function handleKaydet() {
    setSaving(true);
    setHata(null);
    setBasari(false);

    try {
      await Promise.all(
        Object.entries(ayarlar).map(([anahtar, ayar]) =>
          updateSiteAyari(anahtar, ayar.aciklama, ayar.aktif)
        )
      );
      setBasari(true);
      setTimeout(() => setBasari(false), 3000);
    } catch (err: any) {
      setHata(err.message);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="mb-8 border-b border-[#F5F4F0] pb-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-[#1a1a1a]">Site Ayarları</h1>
            <p className="text-sm text-gray-500 mt-1">Ana sayfa ve genel site içeriklerini yönetin</p>
          </div>
          <button onClick={handleKaydet} disabled={saving}
            className="px-6 py-2.5 bg-stone-900 text-white rounded-lg text-[14px] font-medium
              hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" />Kaydediliyor...</> : "Kaydet"}
          </button>
        </div>

        {/* Hero */}
        <Section title="Hero Bölümü"
          aktif={getAktif("hero_aktif")}
          onAktifChange={v => setAktif("hero_aktif", v)}>

          {/* Görsel */}
          <Field label="Hero Görseli">
            {getAciklama("hero_gorsel") && (
              <div className="relative rounded-xl overflow-hidden h-40 mb-2">
                <img src={getAciklama("hero_gorsel")} alt="Hero"
                  className="w-full h-full object-cover" />
                <button onClick={() => setAciklama("hero_gorsel", "")}
                  className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow
                    flex items-center justify-center text-stone-500 hover:text-red-500 text-xs">
                  ✕
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                border border-dashed border-stone-300 rounded-lg cursor-pointer
                hover:border-stone-500 hover:bg-stone-50 transition-all text-[13px] text-stone-500">
                {gorselYukleniyor
                  ? <><Loader2 size={14} className="animate-spin" />Yükleniyor...</>
                  : <><Upload size={14} />Yeni Görsel Yükle</>
                }
                <input type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={handleGorselYukle} />
              </label>
              <button onClick={handleGorsellerGoster}
                className="flex items-center gap-2 px-4 py-2.5 border border-stone-200
                  rounded-lg text-[13px] text-stone-500 hover:bg-stone-50 transition-all">
                <Images size={14} />
                Mevcut Görseller
              </button>
            </div>
          </Field>

          <Field label="Alt Başlık">
            <Input value={getAciklama("hero_alt_baslik")}
              onChange={e => setAciklama("hero_alt_baslik", e.target.value)}
              placeholder="Senzia Home — 2026 Koleksiyonu" />
          </Field>

          <Field label="Ana Başlık">
            <textarea value={getAciklama("hero_baslik")}
              onChange={e => setAciklama("hero_baslik", e.target.value)}
              rows={3} placeholder="Ana başlık metni..."
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-[14px]
                focus:outline-none focus:border-stone-700 transition-colors resize-none" />
          </Field>
        </Section>

        {/* Manifesto */}
        <Section title="Manifesto"
          aktif={getAktif("manifesto_aktif")}
          onAktifChange={v => setAktif("manifesto_aktif", v)}>
          <Field label="Manifesto Metni" hint="Tırnak işareti otomatik eklenir">
            <textarea value={getAciklama("manifesto_metin")}
              onChange={e => setAciklama("manifesto_metin", e.target.value)}
              rows={4} placeholder="Manifesto metni..."
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-[14px]
                focus:outline-none focus:border-stone-700 transition-colors resize-none" />
          </Field>
        </Section>

        {/* Zanaat */}
        <Section title="Zanaat Bölümü"
          aktif={getAktif("zanaat_aktif")}
          onAktifChange={v => setAktif("zanaat_aktif", v)}>
          <Field label="Başlık">
            <Input value={getAciklama("zanaat_baslik")}
              onChange={e => setAciklama("zanaat_baslik", e.target.value)} />
          </Field>
          <Field label="Açıklama Metni">
            <textarea value={getAciklama("zanaat_metin")}
              onChange={e => setAciklama("zanaat_metin", e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-[14px]
                focus:outline-none focus:border-stone-700 transition-colors resize-none" />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Field label={`İstatistik ${i} — Sayı`}>
                  <Input value={getAciklama(`zanaat_stat_${i}_sayi`)}
                    onChange={e => setAciklama(`zanaat_stat_${i}_sayi`, e.target.value)}
                    placeholder="40+" />
                </Field>
                <Field label="Etiket">
                  <Input value={getAciklama(`zanaat_stat_${i}_label`)}
                    onChange={e => setAciklama(`zanaat_stat_${i}_label`, e.target.value)}
                    placeholder="Yıllık Deneyim" />
                </Field>
              </div>
            ))}
          </div>
        </Section>

        {/* İletişim */}
        <Section title="İletişim Bilgileri"
          aktif={getAktif("iletisim_aktif")}
          onAktifChange={v => setAktif("iletisim_aktif", v)}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefon">
              <Input value={getAciklama("iletisim_telefon")}
                onChange={e => setAciklama("iletisim_telefon", e.target.value)}
                placeholder="+90 224 000 00 00" />
            </Field>
            <Field label="WhatsApp">
              <Input value={getAciklama("iletisim_whatsapp")}
                onChange={e => setAciklama("iletisim_whatsapp", e.target.value)}
                placeholder="+90 5xx xxx xx xx" />
            </Field>
            <Field label="Email">
              <Input value={getAciklama("iletisim_email")}
                onChange={e => setAciklama("iletisim_email", e.target.value)}
                placeholder="info@senzia.com" />
            </Field>
            <Field label="Google Maps URL">
              <Input value={getAciklama("iletisim_maps_url")}
                onChange={e => setAciklama("iletisim_maps_url", e.target.value)}
                placeholder="https://maps.google.com/..." />
            </Field>
            <div className="col-span-2">
              <Field label="Adres">
                <Input value={getAciklama("iletisim_adres")}
                  onChange={e => setAciklama("iletisim_adres", e.target.value)}
                  placeholder="Organize Sanayi Bölgesi, İnegöl / Bursa" />
              </Field>
            </div>
          </div>
        </Section>

        {/* Sosyal Medya */}
        <Section title="Sosyal Medya"
          aktif={getAktif("sosyal_aktif")}
          onAktifChange={v => setAktif("sosyal_aktif", v)}>
          <div className="space-y-3">
            {[
              { key: "sosyal_instagram", label: "Instagram", placeholder: "https://instagram.com/senzia" },
              { key: "sosyal_linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/senzia" },
              { key: "sosyal_facebook", label: "Facebook", placeholder: "https://facebook.com/senzia" },
              { key: "sosyal_youtube", label: "YouTube", placeholder: "https://youtube.com/@senzia" },
            ].map(({ key, label, placeholder }) => (
              <Field key={key} label={label}>
                <Input value={getAciklama(key)}
                  onChange={e => setAciklama(key, e.target.value)}
                  placeholder={placeholder} />
              </Field>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <Section title="Footer"
          aktif={getAktif("footer_aktif")}
          onAktifChange={v => setAktif("footer_aktif", v)}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slogan">
              <Input value={getAciklama("footer_slogan")}
                onChange={e => setAciklama("footer_slogan", e.target.value)}
                placeholder="Rafine Yaşam Alanları" />
            </Field>
            <Field label="Alt Metin">
              <Input value={getAciklama("footer_metin")}
                onChange={e => setAciklama("footer_metin", e.target.value)}
                placeholder="© 2026 Senzia. Tüm hakları saklıdır." />
            </Field>
          </div>
        </Section>

        {/* SEO */}
        <Section title="SEO"
          aktif={getAktif("seo_aktif")}
          onAktifChange={v => setAktif("seo_aktif", v)}>
          <Field label="Sayfa Başlığı" hint="Tarayıcı sekmesinde görünür">
            <Input value={getAciklama("seo_baslik")}
              onChange={e => setAciklama("seo_baslik", e.target.value)}
              placeholder="Senzia Home — Rafine Yaşam Alanları" />
          </Field>
          <Field label="Meta Açıklama" hint="Google arama sonuçlarında görünür, 160 karakter ideal">
            <textarea value={getAciklama("seo_aciklama")}
              onChange={e => setAciklama("seo_aciklama", e.target.value)}
              rows={3} maxLength={160}
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-[14px]
                focus:outline-none focus:border-stone-700 transition-colors resize-none" />
            <p className="text-[11px] text-stone-400 text-right">
              {getAciklama("seo_aciklama").length}/160
            </p>
          </Field>
        </Section>

        {/* Hata / Başarı */}
        {hata && (
          <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50
            border border-red-100 rounded-lg px-4 py-3">
            <AlertCircle size={14} /> {hata}
          </div>
        )}
        {basari && (
          <div className="flex items-center gap-2 text-[13px] text-emerald-600 bg-emerald-50
            border border-emerald-100 rounded-lg px-4 py-3">
            <Check size={14} /> Tüm değişiklikler kaydedildi.
          </div>
        )}

        <div className="pb-8" />
      </div>

      {/* Mevcut Görseller Modal */}
      {gorselSecici && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="font-serif text-[18px] text-stone-800">Mevcut Görseller</h3>
              <button onClick={() => setGorselSecici(false)}
                className="text-stone-400 hover:text-stone-700 transition-colors text-xl">✕</button>
            </div>
            <div className="overflow-y-auto p-6">
              {mevcutGorseller.length === 0 ? (
                <p className="text-center text-stone-400 text-[14px] py-8">
                  Henüz görsel yüklenmemiş.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mevcutGorseller.map((url, i) => (
                    <button key={i} onClick={() => {
                      setAciklama("hero_gorsel", url);
                      setGorselSecici(false);
                    }}
                      className="aspect-square rounded-xl overflow-hidden border-2 border-transparent
                        hover:border-stone-800 transition-all group relative">
                      <img src={url} alt={`Görsel ${i + 1}`}
                        className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20
                        transition-all flex items-center justify-center">
                        <span className="text-white text-[12px] opacity-0 group-hover:opacity-100
                          font-medium">Seç</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}