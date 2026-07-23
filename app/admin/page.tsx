import AdminSideBar from './adminComponents/adminSideBar';
import { supabase } from '@/lib/supabase'; // Bağlantı dosyamızı çağırıyoruz

export default async function AdminPage() {
  // 1. Veritabanından verileri çekiyoruz
  // Ürün sayısı
  const { count: productCount } = await supabase
    .from('urunler')
    .select('*', { count: 'exact', head: true });

    //aktif ürün listeleme 
 const { count: activeproductCount } = await supabase
  .from('urunler')
  .select('*', { count: 'exact', head: true }) 
  .eq('durum', 'yayinda');

  // Okunmamış mesaj sayısı (Tablonda 'is_read' sütunu olduğunu varsayarsak)
  const { count: messageCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false); 

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex  gap-6">
      {/* Sol Menü */}
      <aside className="shrink-0">
        <AdminSideBar />
      </aside>

      {/* Sağ İçerik Alanı */}
      <main className="flex-1 bg-white border border-[#E8E7E0] rounded-xl p-8">
        <header className="mb-8 border-b border-[#F5F4F0] pb-4">
          <h1 className="font-serif text-2xl text-[#1a1a1a]">Yönetim Paneline Hoş Geldiniz</h1>
          <p className="text-sm text-gray-500 mt-1">Sitenizin tüm içeriğini buradan yönetebilirsiniz.</p>
        </header>

        {/* Özet İstatistik Kartları (Dinamik) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          <div className="p-4 border border-[#E8E7E0] rounded-lg">
            <span className="text-xs text-gray-400 uppercase font-medium">Toplam Ürün</span>
            {/* Statik '48' yerine veritabanından gelen rakamı yazıyoruz */}
            <div className="text-2xl font-serif mt-1">{productCount || 0}</div>
          </div>

          <div className="p-4 border border-[#E8E7E0] rounded-lg">
            <span className="text-xs text-gray-400 uppercase font-medium">Toplam Aktif Ürün</span>
            {/* Statik '48' yerine veritabanından gelen rakamı yazıyoruz */}
            <div className="text-2xl font-serif mt-1">{activeproductCount || 0}</div>
          </div>

          <div className="p-4 border border-[#E8E7E0] rounded-lg">
            <span className="text-xs text-gray-400 uppercase font-medium">Yeni Mesajlar</span>
            {/* Statik '3' yerine mesaj sayısını yazıyoruz */}
            <div className="text-2xl font-serif mt-1 text-[#E24B4A]">{messageCount || 0}</div>
          </div>

          <div className="p-4 border border-[#E8E7E0] rounded-lg">
            <span className="text-xs text-gray-400 uppercase font-medium">Site Trafiği</span>
            <div className="text-2xl font-serif mt-1">1.2k</div> {/* Trafik verisi için bir sayaç ekleyene kadar statik kalabilir */}
          </div>

        </div>

        {/* Hızlı İşlemler */}
        <section>
          <h2 className="text-lg font-medium mb-4">Hızlı Başlangıç</h2>
          <div className="flex gap-4">
            <a href="admin/urun-ekle" className="px-4 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg hover:bg-black transition-colors">
              + Yeni Ürün Ekle
            </a>
            <button className="px-4 py-2 border border-[#E8E7E0] text-sm rounded-lg hover:bg-[#F5F4F0] transition-colors">
              Slider Güncelle
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}