import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import Header from "@/GlobalComponents/Header";
import Footer from "@/GlobalComponents/Footer";

async function getSiteAyarlari() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data } = await supabase
    .from("site_ayarlari")
    .select("anahtar, aciklama, aktif");

  const ayarlar: Record<string, { aciklama: string | null; aktif: boolean }> = {};
  data?.forEach(({ anahtar, aciklama, aktif }) => {
    ayarlar[anahtar] = { aciklama, aktif };
  });

  return ayarlar;
}

async function getUrunler() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data } = await supabase
    .from("urunler")
    .select("id, ad, slug, ana_gorsel, baz_fiyat, para_birimi, kategori")
    .eq("durum", "yayinda")
    .order("created_at", { ascending: false });

  return data || [];
}

// Son 30 gündeki görüntülenmeye göre öne çıkanları getirir.
// Henüz görüntülenme verisi yoksa (ör. yeni eklenen ürünler),
// fonksiyon otomatik olarak en yeni ürünlere düşer — bkz. SQL fonksiyonu.
async function getOneCikanUrunler() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data, error } = await supabase.rpc("get_one_cikan_urunler", { adet: 3 });

  if (error) {
    console.error("getOneCikanUrunler error:", error);
    return [];
  }

  return data || [];
}

export default async function Home() {
  const [urunler, ayarlar, onecikar] = await Promise.all([
    getUrunler(),
    getSiteAyarlari(),
    getOneCikanUrunler(),
  ]);

  // Yeni Çıkanlar: öne çıkanlarda olmayan ürünler arasından en yeniler
  const oneCikanIds = new Set(onecikar.map(u => u.id));
  const yeniCikanlar = urunler.filter(u => !oneCikanIds.has(u.id));

  const heroGorsel      = ayarlar["hero_gorsel"]?.aciklama || null;
  const heroBaslik      = ayarlar["hero_baslik"]?.aciklama || "Zamanın Ötesinde Formlar, Rafine Yaşam Alanları.";
  const heroAltBaslik   = ayarlar["hero_alt_baslik"]?.aciklama || "Senzia Home — 2026 Koleksiyonu";
  const heroAktif       = ayarlar["hero_aktif"]?.aktif ?? true;
  const manifestoMetin  = ayarlar["manifesto_metin"]?.aciklama || "";
  const manifestoAktif  = ayarlar["manifesto_aktif"]?.aktif ?? true;
  const zanaatAktif     = ayarlar["zanaat_aktif"]?.aktif ?? true;
  const zanaatBaslik    = ayarlar["zanaat_baslik"]?.aciklama || "Zanaatkarlık, Bir Miras";
  const zanaatMetin     = ayarlar["zanaat_metin"]?.aciklama || "";
  const stats = [
    { num: ayarlar["zanaat_stat_1_sayi"]?.aciklama || "40+",  label: ayarlar["zanaat_stat_1_label"]?.aciklama || "Yıllık Deneyim" },
    { num: ayarlar["zanaat_stat_2_sayi"]?.aciklama || "12",   label: ayarlar["zanaat_stat_2_label"]?.aciklama || "Avrupa Pazarı" },
    { num: ayarlar["zanaat_stat_3_sayi"]?.aciklama || "100%", label: ayarlar["zanaat_stat_3_label"]?.aciklama || "El İşçiliği" },
  ];

  return (
    <>
      <Header />
      <main className="bg-[#F5F4F0] min-h-screen">

        {/* Hero */}
        {heroAktif && (
          <section className="relative h-[90vh] bg-[#1a1a18] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
            {heroGorsel && (
              <img src={heroGorsel} alt="Hero"
                className="absolute inset-0 w-full h-full object-cover opacity-40" />
            )}
            <div className="relative z-10">
              <p className="text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-5">
                {heroAltBaslik}
              </p>
              <h1 className="font-['Cormorant_Garamond'] text-[52px] md:text-[68px] font-light italic text-stone-50 leading-tight mb-8 max-w-3xl">
                {heroBaslik}
              </h1>
              <Link href="/koleksiyon"
                className="inline-block px-10 py-3.5 border border-stone-600 text-stone-300
                  text-[10px] tracking-[0.2em] uppercase hover:border-stone-400 hover:text-stone-100
                  transition-all duration-300">
                Koleksiyonu Keşfet
              </Link>
            </div>
          </section>
        )}

        {/* Manifesto */}
        {manifestoAktif && (
          <section className="py-24 px-6 text-center bg-[#F5F4F0]">
            <p className="font-['Cormorant_Garamond'] text-[26px] md:text-[30px] font-light italic
              text-stone-800 leading-relaxed max-w-2xl mx-auto mb-6">
              "{manifestoMetin}"
            </p>
            <Link href="/hakkimizda"
              className="text-[11px] tracking-[0.15em] text-stone-500 uppercase
                border-b border-stone-400 pb-0.5 hover:text-stone-800 transition-colors">
              Hikayemiz
            </Link>
          </section>
        )}

        {/* Öne Çıkan — Asimetrik Grid */}
        {onecikar.length > 0 && (
          <section className="px-6 md:px-16 pb-20 max-w-6xl mx-auto">
            <p className="text-[10px] tracking-[0.25em] text-stone-400 uppercase text-center mb-12">
              Öne Çıkan Parçalar
            </p>
            <div className="grid grid-cols-[1.6fr_1fr] gap-0.5">
              {onecikar[0] && (
                <Link href={`/urun/${onecikar[0].slug}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-stone-100 block">
                  {onecikar[0].ana_gorsel
                    ? <img src={onecikar[0].ana_gorsel} alt={onecikar[0].ad}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                    : <div className="w-full h-full bg-stone-300" />
                  }
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] tracking-[0.2em] text-white uppercase">Keşfet</span>
                  </div>
                </Link>
              )}
              <div className="flex flex-col gap-0.5">
                {onecikar.slice(1, 3).map(urun => (
                  <Link key={urun.id} href={`/urun/${urun.slug}`}
                    className="group relative flex-1 overflow-hidden bg-stone-100 block">
                    {urun.ana_gorsel
                      ? <img src={urun.ana_gorsel} alt={urun.ad}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                      : <div className="w-full h-full bg-stone-200" />
                    }
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] tracking-[0.2em] text-white uppercase">Keşfet</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[1.6fr_1fr] gap-0.5 mt-0">
              {onecikar[0] && (
                <div className="pt-4">
                  <p className="font-['Cormorant_Garamond'] text-[16px] text-stone-800 tracking-wide mb-1">
                    {onecikar[0].ad}
                  </p>
                  <p className="text-[12px] text-stone-500 tracking-wide">
                    {onecikar[0].para_birimi} {Number(onecikar[0].baz_fiyat).toLocaleString()}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-0.5">
                {onecikar.slice(1, 3).map(urun => (
                  <div key={urun.id} className="pt-4 text-center">
                    <p className="font-['Cormorant_Garamond'] text-[15px] text-stone-800 tracking-wide mb-1">
                      {urun.ad}
                    </p>
                    <p className="text-[12px] text-stone-500 tracking-wide">
                      {urun.para_birimi} {Number(urun.baz_fiyat).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Yeni Çıkanlar — Yatay Scroll */}
        {yeniCikanlar.length > 0 && (
          <section className="pb-20">
            <p className="text-[10px] tracking-[0.25em] text-stone-400 uppercase text-center mb-10 px-6">
              Yeni Çıkanlar
            </p>
            <div className="flex gap-0.5 px-6 md:px-16 overflow-x-auto scrollbar-none pb-2">
              {yeniCikanlar.map(urun => (
                <Link key={urun.id} href={`/urun/${urun.slug}`}
                  className="group flex-none w-[220px] md:w-[260px]">
                  <div className="relative overflow-hidden bg-stone-100 h-[300px] md:h-[340px]">
                    {urun.ana_gorsel
                      ? <img src={urun.ana_gorsel} alt={urun.ad}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                      : <div className="w-full h-full bg-stone-200" />
                    }
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] tracking-[0.2em] text-white uppercase">Keşfet</span>
                    </div>
                  </div>
                  <div className="pt-3">
                    <p className="font-['Cormorant_Garamond'] text-[15px] text-stone-800 tracking-wide mb-1">
                      {urun.ad}
                    </p>
                    <p className="text-[12px] text-stone-500 tracking-wide">
                      {urun.para_birimi} {Number(urun.baz_fiyat).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Ürün yoksa placeholder */}
        {urunler.length === 0 && (
          <section className="py-32 text-center">
            <p className="font-['Cormorant_Garamond'] text-[22px] font-light italic text-stone-400">
              Koleksiyon yakında…
            </p>
          </section>
        )}

        {/* Zanaat */}
        {zanaatAktif && (
          <section className="px-6 md:px-16 py-20 max-w-6xl mx-auto border-t border-stone-200
            grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-['Cormorant_Garamond'] text-[28px] font-light text-stone-800 mb-4">
                {zanaatBaslik}
              </h2>
              <p className="text-[13px] text-stone-500 leading-loose">{zanaatMetin}</p>
            </div>
            <div className="flex flex-col justify-center gap-8">
              {stats.map(s => (
                <div key={s.label} className="border-l border-stone-300 pl-5">
                  <p className="font-['Cormorant_Garamond'] text-[36px] font-light text-stone-800">{s.num}</p>
                  <p className="text-[11px] tracking-[0.1em] text-stone-400 uppercase mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
