import ProductDetailModular from "../urunComponents/ProductDetailModular";

interface Props {
  params: { slug: string };
}

// Veritabanından veri çekme fonksiyonu (Örnek)
async function getProductBySlug(slug: string) {
  // Burada Supabase sorgunuzu yapacaksınız:
  // const { data } = await supabase.from('products').select('*').eq('slug', slug).single();
  // return data;
  
  // Şimdilik test için mock veri döndürüyoruz
  return {
    id: 1,
    ad: "Icon Modüler Koltuk",
    slug: slug, // URL'den gelen slug
    aciklama: "Premium konfor ve modüler tasarım.",
    kategori: "Oturma Grubu",
    koleksiyon: "Senzia 2026",
    urun_ilk_foto: null,
    vendors: { ad: "Senzia Home" },
    urun_modulleri: [
      { id: 101, modul_adi: "Sağ Kollu Modül", fiyat: 18000, genislik: 115, derinlik: 100, yukseklik: 80, cbm: 0.92, agirlik_kg: 42, varsayilan_adet: 1 },
      // ...diğer modüller
    ]
  };
}

export default async function Page({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return <div>Ürün bulunamadı.</div>;
  }

  return (
    <main>
      <ProductDetailModular 
        product={product} 
        currency="TRY" 
        destination="Türkiye" 
      />
    </main>
  );
}