"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SifremiUnuttumPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [gonderildi, setGonderildi] = useState(false);

  async function handleGonder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setHata(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-sifirla`,
    });

    if (error) {
      setHata("Bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
      return;
    }

    setGonderildi(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-[#1a1a18] rounded-lg flex items-center justify-center">
          <span className="text-white text-[13px] font-semibold">S</span>
        </div>
        <span className="font-['Crimson_Pro'] text-2xl tracking-[0.2em] font-light text-stone-900 uppercase">Senzia</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-stone-100">
          <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-4">
            🔒
          </div>
          <h1 className="font-['Crimson_Pro'] text-[26px] font-medium text-stone-900 mb-1">
            Şifremi unuttum
          </h1>
          <p className="text-[13px] text-stone-400">
            Email adresinizi girin, sıfırlama bağlantısı gönderelim
          </p>
        </div>

        <div className="px-8 py-6">
          {!gonderildi ? (
            <form onSubmit={handleGonder} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                  Email Adresi
                </label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                    focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all"
                />
              </div>

              {hata && (
                <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                  ⚠ {hata}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-stone-800 text-white rounded-lg text-[14px] font-medium
                  hover:bg-stone-600 transition-colors disabled:opacity-50
                  flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Gönderiliyor...</>
                  : "Sıfırlama Bağlantısı Gönder"
                }
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-600 text-xl">✓</span>
              </div>
              <p className="text-[15px] font-medium text-stone-900 mb-1">Email gönderildi!</p>
              <p className="text-[13px] text-stone-400">
                {email} adresine sıfırlama bağlantısı gönderdik.
              </p>
              <p className="text-[12px] text-stone-300 mt-3">Spam klasörünüzü de kontrol edin.</p>
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-stone-50 border-t border-stone-100 text-center">
          <p className="text-[12px] text-stone-400">
            Şifrenizi hatırladınız mı?{" "}
            <a href="/giris" className="text-stone-700 font-medium hover:text-stone-900 hover:underline underline-offset-2">
              Giriş yapın
            </a>
          </p>
        </div>
      </div>

      <p className="text-[11px] text-stone-400 mt-6">© 2026 Senzia. Tüm hakları saklıdır.</p>
    </div>
  );
}