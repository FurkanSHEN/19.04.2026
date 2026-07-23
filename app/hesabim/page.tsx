"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ShoppingBag, Package, Truck, CheckCircle2,
  Clock, ChevronRight, Loader2, AlertCircle,
  Phone, Mail, Heart, Shield, MapPin, Gift,
} from "lucide-react";
import HesabimSidebar, { type HesabimSayfa } from "../hesabim/_components/Sidebar";

interface Profile {
  id: string;
  ad: string | null;
  soyad: string | null;
  telefon: string | null;
  rol: string;
}

interface SiparisDetayItem {
  id: number;
  adet: number;
  birim_fiyat: number;
  modul_secimi: any;
  urunler: {
    ad: string;
    ana_gorsel: string | null;
    kategori: string | null;
  } | null;
}

interface Siparis {
  id: number;
  toplam_fiyat: number;
  para_birimi: string;
  durum: string;
  created_at: string;
  siparis_detay: SiparisDetayItem[];
}

const SIPARIS_DURUMLARI: Record<string, {
  label: string; color: string; bg: string; icon: React.ElementType; adim: number;
}> = {
  yeni:          { label: "Sipariş Alındı", color: "text-blue-600",    bg: "bg-blue-50",    icon: ShoppingBag,  adim: 1 },
  hazirlaniyor:  { label: "Hazırlanıyor",   color: "text-amber-600",   bg: "bg-amber-50",   icon: Clock,        adim: 2 },
  uretimde:      { label: "Üretimde",       color: "text-purple-600",  bg: "bg-purple-50",  icon: Package,      adim: 3 },
  kargoda:       { label: "Yolda",          color: "text-indigo-600",  bg: "bg-indigo-50",  icon: Truck,        adim: 4 },
  teslim_edildi: { label: "Teslim Edildi",  color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2, adim: 5 },
};

const ADIMLAR = [
  { key: "yeni",          label: "Sipariş\nAlındı" },
  { key: "hazirlaniyor",  label: "Malzeme\nHazırlığı" },
  { key: "uretimde",      label: "Usta Eller\nde Üretim" },
  { key: "kargoda",       label: "Lojistik\nYolculuğu" },
  { key: "teslim_edildi", label: "Teslim\nEdildi" },
];

function formatTarih(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTutar(tutar: number, birim: string) {
  if (birim === 'TRY') return `₺${tutar.toLocaleString('tr-TR')}`;
  if (birim === 'USD') return `$${tutar.toLocaleString('en-US')}`;
  return `${tutar} ${birim}`;
}

function SiparisCizelgesi({ durum }: { durum: string }) {
  const aktifAdim = SIPARIS_DURUMLARI[durum]?.adim || 1;
  return (
    <div className="flex items-start gap-0 w-full mb-5">
      {ADIMLAR.map((adim, i) => {
        const adimNo = i + 1;
        const tamamlandi = adimNo < aktifAdim;
        const aktif = adimNo === aktifAdim;
        return (
          <div key={adim.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px]
                font-semibold flex-shrink-0
                ${tamamlandi ? "bg-stone-900 text-white" :
                  aktif ? "bg-stone-900 text-white ring-4 ring-stone-900/10" :
                  "bg-stone-100 text-stone-400"}`}>
                {tamamlandi ? "✓" : adimNo}
              </div>
              <p className={`text-[10px] text-center leading-tight whitespace-pre-line max-w-[58px]
                ${aktif ? "text-stone-900 font-semibold" : tamamlandi ? "text-stone-500" : "text-stone-300"}`}>
                {adim.label}
              </p>
            </div>
            {i < ADIMLAR.length - 1 && (
              <div className={`flex-1 h-[2px] mx-1 mb-6 rounded-full
                ${tamamlandi ? "bg-stone-900" : "bg-stone-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SiparisKarti({ siparis }: { siparis: Siparis }) {
  const [acik, setAcik] = useState(false);
  const durum = SIPARIS_DURUMLARI[siparis.durum] || SIPARIS_DURUMLARI.yeni;
  const Icon = durum.icon;
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-all">
      <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setAcik(p => !p)}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 ${durum.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className={durum.color} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[14px] font-semibold text-stone-900">#{siparis.id.toString().padStart(6, '0')}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${durum.bg} ${durum.color}`}>
                {durum.label}
              </span>
            </div>
            <p className="text-[12px] text-stone-400">
              {formatTarih(siparis.created_at)} · {siparis.siparis_detay?.length || 0} ürün
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[16px] font-semibold text-stone-900 tabular-nums">
            {formatTutar(siparis.toplam_fiyat, siparis.para_birimi)}
          </p>
          <ChevronRight size={16} className={`text-stone-300 transition-transform duration-200 ${acik ? "rotate-90" : ""}`} />
        </div>
      </div>
      {acik && (
        <div className="px-6 pb-6 pt-4 border-t border-stone-50">
           {/* Durum çizelgesi */}
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-5">
            Sipariş Durumu
          </p>
          <SiparisCizelgesi durum={siparis.durum} />

          {/* Ürün listesi — tablo stili */}
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">
            Sipariş Kalemleri
          </p>

          <div className="border border-stone-200 rounded-xl overflow-hidden mb-5">
            {/* Header */}
            <div className="grid bg-stone-50 border-b border-stone-200 text-[11px] font-semibold 
              text-stone-500 uppercase tracking-wider"
              style={{ gridTemplateColumns: '2fr 60px 120px' }}>
              <div className="px-4 py-2.5">Ürün / Modül</div>
              <div className="px-4 py-2.5 text-center">Adet</div>
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
                    satirlar: [],
                    toplam: 0,
                  };
                }
                const modulAdi = detay.modul_secimi?.modul_adi || detay.modul_secimi?.ana_modul || null;
                const satirToplam = parseFloat(String(detay.birim_fiyat)) * detay.adet;
                acc[key].satirlar.push({ modulAdi, adet: detay.adet, toplam: satirToplam });
                acc[key].toplam += satirToplam;
                return acc;
              }, {} as Record<string, { ad: string; gorsel: string | null | undefined; satirlar: { modulAdi: string | null; adet: number; toplam: number }[]; toplam: number }>);

              return Object.values(gruplar).map((grup, gi) => (
                <div key={gi} className="border-b border-stone-100 last:border-b-0">
                  {/* Ürün başlık */}
                  <div className="grid bg-stone-50/60 border-b border-stone-100 items-center"
                    style={{ gridTemplateColumns: '2fr 60px 120px' }}>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-stone-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {grup.gorsel
                          ? <img src={grup.gorsel} alt="" className="w-full h-full object-cover" />
                          : <Package size={13} className="text-stone-400" />
                        }
                      </div>
                      <span className="text-[13px] font-semibold text-stone-900">{grup.ad}</span>
                    </div>
                    <div className="px-4 py-3" />
                    <div className="px-4 py-3 text-[13px] font-semibold text-stone-700 text-right tabular-nums">
                      ₺{grup.toplam.toLocaleString('tr-TR')}
                    </div>
                  </div>

                  {/* Modül satırları */}
                  {grup.satirlar.map((satir, si) => (
                    <div key={si} className="grid hover:bg-stone-50/50 transition-colors"
                      style={{ gridTemplateColumns: '2fr 60px 120px' }}>
                      <div className="px-4 py-2.5 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-stone-300 flex-shrink-0 ml-3" />
                        <span className="text-[12px] text-stone-500">{satir.modulAdi || '—'}</span>
                      </div>
                      <div className="px-4 py-2.5 text-[12px] text-stone-600 text-center tabular-nums">
                        {satir.adet}
                      </div>
                      <div className="px-4 py-2.5 text-[12px] text-stone-600 text-right tabular-nums">
                        ₺{satir.toplam.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  ))}
                </div>
              ));
            })()}

            {/* Genel toplam */}
            <div className="grid bg-stone-50 border-t-2 border-stone-200"
              style={{ gridTemplateColumns: '2fr 60px 120px' }}>
              <div className="px-4 py-3 col-span-2 text-[12px] font-medium text-stone-500 text-right">
                Toplam
              </div>
              <div className="px-4 py-3 text-[15px] font-bold text-stone-900 text-right tabular-nums">
                {formatTutar(siparis.toplam_fiyat, siparis.para_birimi)}
              </div>
            </div>
          </div>

         

          {siparis.durum !== 'teslim_edildi' && (
            <div className="mt-5 p-4 bg-[#FAFAF8] rounded-xl border border-stone-100 mb-5">
              <p className="text-[13px] text-stone-500 leading-relaxed">
                Siparişinizle ilgili sorularınız mı var?{" "}
                <span className="text-stone-900 font-medium cursor-pointer hover:underline underline-offset-2">
                  Senzia Danışmanına ulaşın
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Siparislerim({ userId }: { userId: string }) {
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  useEffect(() => {
  supabase.from('siparisler')
  .select(`
    *,
    siparis_detay(
      id,
      adet,
      birim_fiyat,
      modul_secimi,
      urunler(ad, ana_gorsel, kategori)
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
      .then(({ data }) => { setSiparisler(data || []); setLoading(false); });
  }, [userId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-stone-300" size={28} /></div>;
  if (siparisler.length === 0) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ShoppingBag size={24} className="text-stone-300" />
      </div>
      <p className="text-[16px] font-medium text-stone-700 mb-1">Henüz sipariş yok</p>
      <p className="text-[13px] text-stone-400 mb-6">Koleksiyonumuzu keşfederek ilk siparişinizi verin.</p>
      <a href="/koleksiyonlar" className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[13px] font-medium hover:bg-stone-700 transition-colors">
        Koleksiyonları Keşfet
      </a>
    </div>
  );
  return <div className="space-y-3">{siparisler.map(s => <SiparisKarti key={s.id} siparis={s} />)}</div>;
}

function ProfilYonetimi({ profile, email, onProfilGuncelle }: {
  profile: Profile; email: string; onProfilGuncelle: (p: Profile) => void;
}) {
 const [form, setForm] = useState({ ad: profile.ad || "", soyad: profile.soyad || "", telefon: profile.telefon || "" });

useEffect(() => {
  setForm({ ad: profile.ad || "", soyad: profile.soyad || "", telefon: profile.telefon || "" });
}, [profile.id]);

  const [sifreForm, setSifreForm] = useState({ yeniSifre: "", yeniSifreTekrar: "" });
  const [saving, setSaving] = useState(false);
  const [sifreSaving, setSifreSaving] = useState(false);
  const [basari, setBasari] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

async function handleKaydet(e: React.FormEvent) {
  e.preventDefault(); setSaving(true); setHata(null); setBasari(null);
  
  const { error } = await supabase
    .from('profiles')
    .update({ ad: form.ad, soyad: form.soyad, telefon: form.telefon })
    .eq('id', profile.id);
    
  setSaving(false);
  if (error) { setHata(error.message); return; }
  setBasari("Bilgileriniz kaydedildi.");
  onProfilGuncelle({ ...profile, ...form });
  setTimeout(() => setBasari(null), 3000);
}

  async function handleSifreDegistir(e: React.FormEvent) {
    e.preventDefault(); setHata(null);
    if (sifreForm.yeniSifre !== sifreForm.yeniSifreTekrar) { setHata("Şifreler eşleşmiyor."); return; }
    if (sifreForm.yeniSifre.length < 6) { setHata("En az 6 karakter olmalı."); return; }
    setSifreSaving(true);
    const { error } = await supabase.auth.updateUser({ password: sifreForm.yeniSifre });
    setSifreSaving(false);
    if (error) { setHata(error.message); return; }
    setBasari("Şifreniz güncellendi.");
    setSifreForm({ yeniSifre: "", yeniSifreTekrar: "" });
    setTimeout(() => setBasari(null), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-5">Kişisel Bilgiler</h3>
        <form onSubmit={handleKaydet} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Ad</label>
              <input type="text" value={form.ad} onChange={e => setForm(p => ({ ...p, ad: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Soyad</label>
              <input type="text" value={form.soyad} onChange={e => setForm(p => ({ ...p, soyad: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Email</label>
            <div className="flex items-center gap-3 border border-stone-100 rounded-xl px-3.5 py-2.5 bg-stone-50">
              <Mail size={14} className="text-stone-300 flex-shrink-0" />
              <span className="text-[14px] text-stone-400 flex-1">{email}</span>
              <span className="text-[10px] text-stone-400 bg-stone-200 px-2 py-0.5 rounded-full">Değiştirilemez</span>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Telefon</label>
            <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-3.5 focus-within:ring-2 focus-within:ring-stone-900/10 focus-within:border-stone-400 transition-all">
              <Phone size={14} className="text-stone-400 flex-shrink-0" />
              <input type="tel" value={form.telefon} onChange={e => setForm(p => ({ ...p, telefon: e.target.value }))}
                placeholder="05xx xxx xx xx"
                className="flex-1 py-2.5 text-[14px] focus:outline-none bg-transparent" />
            </div>
          </div>
          {hata && <div className="flex items-center gap-2 text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5"><AlertCircle size={13} /> {hata}</div>}
          {basari && <div className="flex items-center gap-2 text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5"><CheckCircle2 size={13} /> {basari}</div>}
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[13px] font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Kaydediliyor...</> : "Değişiklikleri Kaydet"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-5">Şifre Değiştir</h3>
        <form onSubmit={handleSifreDegistir} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Yeni Şifre</label>
            <input type="password" value={sifreForm.yeniSifre} minLength={6}
              onChange={e => setSifreForm(p => ({ ...p, yeniSifre: e.target.value }))} placeholder="••••••••"
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Yeni Şifre (Tekrar)</label>
            <input type="password" value={sifreForm.yeniSifreTekrar} minLength={6}
              onChange={e => setSifreForm(p => ({ ...p, yeniSifreTekrar: e.target.value }))} placeholder="••••••••"
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all" />
          </div>
          <button type="submit" disabled={sifreSaving}
            className="px-5 py-2.5 border border-stone-200 text-stone-700 rounded-xl text-[13px] font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2">
            {sifreSaving ? <><span className="w-3.5 h-3.5 border-2 border-stone-400/30 border-t-stone-600 rounded-full animate-spin" />Güncelleniyor...</> : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}

function YakindaSayfasi({ baslik, aciklama, icon: Icon }: { baslik: string; aciklama: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-stone-400" />
      </div>
      <p className="text-[16px] font-medium text-stone-700 mb-1">{baslik}</p>
      <p className="text-[13px] text-stone-400 max-w-[300px] leading-relaxed">{aciklama}</p>
      <span className="mt-4 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Yakında</span>
    </div>
  );
}

const SAYFA_BILGI: Record<HesabimSayfa, { baslik: string; aciklama: string }> = {
  siparisler:    { baslik: "Siparişlerim",       aciklama: "Tüm siparişlerinizi ve teslimat durumlarını takip edin" },
  favoriler:     { baslik: "Habitat & Favoriler", aciklama: "Beğendiklerinizi kaydedin, oturma odanızı planlayın" },
  "senzia-care": { baslik: "Senzia Care",         aciklama: "Ürünlerinizin bakım kılavuzları ve garanti belgeleri" },
  adresler:      { baslik: "Adres Defteri",       aciklama: "Teslimat ve fatura adreslerinizi yönetin" },
  sadakat:       { baslik: "Senzia Member",       aciklama: "Ayrıcalıklarınız ve ödülleriniz" },
  profil:        { baslik: "Profil & Güvenlik",   aciklama: "Kişisel bilgilerinizi ve güvenlik ayarlarınızı yönetin" },
};

export default function HesabimPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [aktifSayfa, setAktifSayfa] = useState<HesabimSayfa>("siparisler");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/giris"); return; }
      setEmail(session.user.email || "");
      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(p);
      setLoading(false);
    }
    init();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <Loader2 className="animate-spin text-stone-300" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-[12px] font-semibold">S</span>
            </div>
            <span className="text-stone-800 text-[15px] font-medium tracking-wide">Senzia</span>
          </div>
          <a href="/" className="text-[13px] text-stone-400 hover:text-stone-700 transition-colors">Mağazaya Dön →</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-8 items-start">
          <HesabimSidebar
            aktifSayfa={aktifSayfa}
            onSayfaDegis={setAktifSayfa}
            ad={profile?.ad || undefined}
            soyad={profile?.soyad || undefined}
            email={email}
          />
          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="font-['Crimson_Pro'] text-[28px] font-medium text-stone-900">{SAYFA_BILGI[aktifSayfa].baslik}</h1>
              <p className="text-[13px] text-stone-400 mt-0.5">{SAYFA_BILGI[aktifSayfa].aciklama}</p>
            </div>
            {aktifSayfa === "siparisler" && profile && <Siparislerim userId={profile.id} />}
            {aktifSayfa === "profil" && profile && <ProfilYonetimi profile={profile} email={email} onProfilGuncelle={setProfile} />}
            {aktifSayfa === "favoriler" && <YakindaSayfasi baslik="Habitat & Favoriler" aciklama="Beğendiğiniz ürünleri kaydedin ve oturma odanızı dijital olarak planlayın." icon={Heart} />}
            {aktifSayfa === "senzia-care" && <YakindaSayfasi baslik="Senzia Care" aciklama="Ürünlerinize özel bakım kılavuzları ve garanti belgeleriniz burada olacak." icon={Shield} />}
            {aktifSayfa === "adresler" && <YakindaSayfasi baslik="Adres Defteri" aciklama="Birden fazla teslimat adresi ekleyip yönetebileceksiniz." icon={MapPin} />}
            {aktifSayfa === "sadakat" && <YakindaSayfasi baslik="Senzia Member" aciklama="Sadakat programımız ve ayrıcalıklarınız yakında burada." icon={Gift} />}
          </main>
        </div>
      </div>
    </div>
  );
}