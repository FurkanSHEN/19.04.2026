"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

type Adim = 1 | 2 | 3;

export default function VendorOlPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [adim, setAdim] = useState<Adim>(1);
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // Adım 1 — Hesap bilgileri
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");

  // Adım 2 — Firma bilgileri
  const [firmaAd, setFirmaAd] = useState("");
  const [firmaTelefon, setFirmaTelefon] = useState("");
  const [firmaEmail, setFirmaEmail] = useState("");
  const [uretimLokasyon, setUretimLokasyon] = useState("");
  const [depoLokasyon, setDepoLokasyon] = useState("");
  const [markaHikayesi, setMarkaHikayesi] = useState("");
  const [yetkiliAd, setYetkiliAd] = useState("");
  const [yetkiliUnvan, setYetkiliUnvan] = useState("");

  async function handleBasvur() {
    setLoading(true);
    setHata(null);

    try {
      // 1. Auth hesabı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: sifre,
        options: { data: { ad, soyad } },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Hesap oluşturulamadı.");

      // 2. vendors tablosuna başvuru ekle
      const { error: vendorError } = await supabase
        .from("vendors")
        .insert([{
          ad: firmaAd,
          email: firmaEmail || email,
          telefon: firmaTelefon || null,
          uretim_lokasyonu: uretimLokasyon || null,
          depo_lokasyonu: depoLokasyon || null,
          marka_hikayesi: markaHikayesi || null,
          yetkili_kisi_adi: yetkiliAd || `${ad} ${soyad}`,
          yetkili_kisi_unvan: yetkiliUnvan || null,
          durum: "incelemede",
          auth_user_id: authData.user.id,
        }]);

      if (vendorError) throw new Error(vendorError.message);

      setAdim(3);

    } catch (err: any) {
      setHata(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center p-4 py-16">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 bg-[#1a1a18] rounded-lg flex items-center justify-center">
          <span className="text-white text-[13px] font-semibold">S</span>
        </div>
        <span className="font-['Crimson_Pro'] text-2xl tracking-[0.2em] font-light text-stone-900 uppercase">
          Senzia
        </span>
      </Link>

      <div className="w-full max-w-2xl">

        {/* Adım göstergesi */}
        {adim !== 3 && (
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px]
                  font-medium transition-all ${
                  adim >= s
                    ? "bg-stone-900 text-white"
                    : "bg-stone-200 text-stone-400"
                }`}>
                  {s}
                </div>
                {s < 2 && <div className={`w-16 h-px ${adim > s ? "bg-stone-900" : "bg-stone-300"}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden">

          {/* ── Adım 1: Hesap Bilgileri ── */}
          {adim === 1 && (
            <>
              <div className="px-8 pt-8 pb-6 border-b border-stone-100">
                <p className="text-[11px] tracking-[0.2em] text-stone-400 uppercase mb-2">
                  Adım 1 / 2
                </p>
                <h1 className="font-['Crimson_Pro'] text-[26px] font-medium text-stone-900 mb-1">
                  Hesap bilgileriniz
                </h1>
                <p className="text-[13px] text-stone-400">
                  Senzia'ya giriş yapacağınız hesabı oluşturun
                </p>
              </div>

              <div className="px-8 py-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                      Ad
                    </label>
                    <input type="text" value={ad} onChange={e => setAd(e.target.value)}
                      placeholder="Ahmet"
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                      Soyad
                    </label>
                    <input type="text" value={soyad} onChange={e => setSoyad(e.target.value)}
                      placeholder="Yılmaz"
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                    Email Adresi
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                    Şifre
                  </label>
                  <input type="password" value={sifre} onChange={e => setSifre(e.target.value)}
                    placeholder="••••••••" minLength={6}
                    className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                  <p className="text-[11px] text-stone-400 mt-1.5">En az 6 karakter</p>
                </div>

                {hata && (
                  <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                    ⚠ {hata}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!ad || !soyad || !email || sifre.length < 6) {
                      setHata("Lütfen tüm alanları doldurun.");
                      return;
                    }
                    setHata(null);
                    setAdim(2);
                  }}
                  className="w-full py-3 bg-stone-800 text-white rounded-lg text-[14px] font-medium
                    hover:bg-stone-600 transition-colors mt-1">
                  Devam Et
                </button>
              </div>
            </>
          )}

          {/* ── Adım 2: Firma Bilgileri ── */}
          {adim === 2 && (
            <>
              <div className="px-8 pt-8 pb-6 border-b border-stone-100">
                <p className="text-[11px] tracking-[0.2em] text-stone-400 uppercase mb-2">
                  Adım 2 / 2
                </p>
                <h1 className="font-['Crimson_Pro'] text-[26px] font-medium text-stone-900 mb-1">
                  Firma bilgileriniz
                </h1>
                <p className="text-[13px] text-stone-400">
                  Başvurunuz incelendikten sonra size dönüş yapılacaktır
                </p>
              </div>

              <div className="px-8 py-6 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                    Firma Adı
                  </label>
                  <input type="text" value={firmaAd} onChange={e => setFirmaAd(e.target.value)}
                    placeholder="Örnek Mobilya A.Ş."
                    className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                      Yetkili Kişi
                    </label>
                    <input type="text" value={yetkiliAd} onChange={e => setYetkiliAd(e.target.value)}
                      placeholder={`${ad} ${soyad}`}
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                      Ünvan
                    </label>
                    <input type="text" value={yetkiliUnvan} onChange={e => setYetkiliUnvan(e.target.value)}
                      placeholder="Genel Müdür"
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                      Firma Telefonu
                    </label>
                    <input type="tel" value={firmaTelefon} onChange={e => setFirmaTelefon(e.target.value)}
                      placeholder="0212 000 00 00"
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                      Firma Emaili
                    </label>
                    <input type="email" value={firmaEmail} onChange={e => setFirmaEmail(e.target.value)}
                      placeholder="info@firma.com"
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                      Üretim Lokasyonu
                    </label>
                    <input type="text" value={uretimLokasyon} onChange={e => setUretimLokasyon(e.target.value)}
                      placeholder="İnegöl, Bursa"
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                      Depo Lokasyonu
                    </label>
                    <input type="text" value={depoLokasyon} onChange={e => setDepoLokasyon(e.target.value)}
                      placeholder="İstanbul"
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                        focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                    Marka Hikayeniz
                    <span className="normal-case tracking-normal font-normal ml-1 text-stone-300">(opsiyonel)</span>
                  </label>
                  <textarea value={markaHikayesi} onChange={e => setMarkaHikayesi(e.target.value)}
                    placeholder="Firmanızı, üretim felsefenizi ve Senzia'ya katılmak isteme nedeninizi kısaca anlatın..."
                    rows={4}
                    className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400
                      transition-all resize-none" />
                </div>

                {hata && (
                  <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                    ⚠ {hata}
                  </div>
                )}

                <div className="flex gap-3 mt-1">
                  <button onClick={() => { setAdim(1); setHata(null); }}
                    className="px-6 py-3 border border-stone-200 text-stone-600 rounded-lg text-[14px]
                      font-medium hover:bg-stone-50 transition-colors">
                    Geri
                  </button>
                  <button onClick={handleBasvur} disabled={loading || !firmaAd}
                    className="flex-1 py-3 bg-stone-800 text-white rounded-lg text-[14px] font-medium
                      hover:bg-stone-600 transition-colors disabled:opacity-50
                      flex items-center justify-center gap-2">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Başvuru gönderiliyor...</>
                      : "Başvuruyu Tamamla"
                    }
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Adım 3: Başarı ── */}
          {adim === 3 && (
            <div className="px-8 py-16 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-emerald-600 text-2xl">✓</span>
              </div>
              <h1 className="font-['Crimson_Pro'] text-[28px] font-medium text-stone-900 mb-3">
                Başvurunuz alındı!
              </h1>
              <p className="text-[14px] text-stone-500 max-w-sm mx-auto leading-relaxed mb-2">
                Ekibimiz başvurunuzu inceleyecek ve en kısa sürede <strong>{email}</strong> adresinize dönüş yapacaktır.
              </p>
              <p className="text-[13px] text-stone-400 mb-8">
                Onay süreci genellikle 2-3 iş günü sürmektedir.
              </p>
              <Link href="/"
                className="inline-block px-8 py-3 bg-stone-800 text-white rounded-lg text-[14px]
                  font-medium hover:bg-stone-600 transition-colors">
                Ana Sayfaya Dön
              </Link>
            </div>
          )}
        </div>

        <p className="text-[12px] text-stone-400 text-center mt-6">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-stone-700 font-medium hover:underline underline-offset-2">
            Giriş yapın
          </Link>
        </p>
      </div>

      <p className="text-[11px] text-stone-400 mt-8">© 2026 Senzia. Tüm hakları saklıdır.</p>
    </div>
  );
}