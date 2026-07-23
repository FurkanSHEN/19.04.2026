"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function GirisPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [mod, setMod] = useState<"giris" | "kayit">("giris");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);

  async function handleGiris(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setHata(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: sifre });

    if (error) {
      setHata("Email veya şifre hatalı.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", data.user.id)
      .single();

      console.log("ID:", data.user.id);      // ← bunu ekleyin
      console.log("ROL:", profile?.rol);     // ← bunu ekleyin

      const rol = profile?.rol || "musteri";
      
      // ✅ DÜZELTİLDİ: window.location.href kullan (hard redirect)
      if (rol === "admin") {
        window.location.href = "/admin";
      } else if (rol === "vendor") {
      window.location.href = "/vendors-dashboard";
      } else {
        window.location.href = "/hesabim";
      }
  
  // Loading false yapma - zaten redirect oluyor
}









  async function handleKayit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setHata(null);

    const { error } = await supabase.auth.signUp({
      email,
      password: sifre,
      options: { data: { ad, soyad } },
    });

    if (error) { setHata(error.message); setLoading(false); return; }
    setBasari("Hesabınız oluşturuldu! Email adresinizi doğrulayın.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-[#1a1a18] rounded-lg flex items-center justify-center">
          <span className="text-white text-[13px] font-semibold tracking-tight">S</span>
        </div>
        <span className="font-['Crimson_Pro'] text-2xl tracking-[0.2em] font-light text-stone-900 uppercase">Senzia</span>
      </div>

      {/* Kart */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">

        {/* Kart header */}
        <div className="px-8 pt-8 pb-6 border-b border-stone-100">
          <h1 className="font-['Crimson_Pro'] text-[26px] font-medium text-stone-900 mb-1">
            {mod === "giris" ? "Hesabınıza girin" : "Hesap oluşturun"}
          </h1>
          <p className="text-[13px] text-stone-400">
            {mod === "giris"
              ? "Devam etmek için bilgilerinizi girin"
              : "Yeni bir hesap oluşturmak için formu doldurun"}
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
            {(["giris", "kayit"] as const).map(m => (
              <button key={m}
                onClick={() => { setMod(m); setHata(null); setBasari(null); }}
                className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all
                  ${mod === m ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
              >
                {m === "giris" ? "Giriş Yap" : "Kayıt Ol"}
              </button>
            ))}
          </div>

          <form onSubmit={mod === "giris" ? handleGiris : handleKayit} className="space-y-4">
            {mod === "kayit" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">Ad</label>
                  <input type="text" required value={ad} onChange={e => setAd(e.target.value)}
                    placeholder="Ahmet"
                    className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">Soyad</label>
                  <input type="text" required value={soyad} onChange={e => setSoyad(e.target.value)}
                    placeholder="Yılmaz"
                    className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                      focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-stone-400 mb-1.5 block uppercase tracking-wider">
                Email Adresi
              </label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                  focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Şifre</label>
                {mod === "giris" && (
                 // giris/page.tsx içinde
                  <button type="button"
                    onClick={() => window.location.href = "/sifremi-unuttum"}
                    className="text-[12px] text-stone-400 hover:text-stone-700 transition-colors">
                    Şifremi unuttum
                  </button>
                )}
              </div>
              <input type="password" required value={sifre} onChange={e => setSifre(e.target.value)}
                placeholder="••••••••" minLength={6}
                className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-[14px]
                  focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all" />
              {mod === "kayit" && <p className="text-[11px] text-stone-400 mt-1.5">En az 6 karakter</p>}
            </div>

            {hata && (
              <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                ⚠ {hata}
              </div>
            )}
            {basari && (
              <div className="text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3.5 py-2.5">
                ✓ {basari}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-stone-800  text-white rounded-lg text-[14px] font-medium
                hover:bg-stone-600 transition-colors disabled:opacity-50
                flex items-center justify-center gap-2 mt-1">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mod === "giris" ? "Giriş yapılıyor..." : "Oluşturuluyor..."}</>
                : mod === "giris" ? "Giriş Yap" : "Hesap Oluştur"
              }
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-stone-50 border-t border-stone-100 text-center">
          <p className="text-[12px] text-stone-400">
            {mod === "giris" ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
            <button onClick={() => { setMod(mod === "giris" ? "kayit" : "giris"); setHata(null); setBasari(null); }}
              className="text-stone-700 font-medium hover:text-stone-900 transition-colors hover:underline underline-offset-2">
              {mod === "giris" ? "Kayıt olun" : "Giriş yapın"}
            </button>
          </p>
        </div>
      </div>

      <p className="text-[11px] text-stone-400 mt-6">© 2026 Senzia. Tüm hakları saklıdır.</p>
    </div>
  );
}