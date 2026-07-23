import { supabaseAdmin } from "@/lib/supabase";
import AdminProductApproval from "../approval/approval-components/AdminProductApproval";
import AdminSideBar from "../adminComponents/adminSideBar";

export default async function ApprovalPage() {
  // 1. Ürünleri çek
  const { data: products, error } = await supabaseAdmin
    .from("urunler")
    .select("*")
    .eq("durum", "incelemede")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Sorgu Hatası:", error.message);
  }

  // 2. TÜM modülleri bir seferde çek
  const { data: allModuller } = await supabaseAdmin
    .from("urun_modulleri")
    .select("*");

  // 3. Her ürüne kendi modüllerini ekle
  const enrichedProducts = (products || []).map(product => ({
    ...product,
    urun_modulleri: (allModuller || []).filter(mod => mod.urun_id === product.id)
  }));



  console.log("Zenginleştirilmiş Ürünler:", enrichedProducts);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex gap-6">
      <aside className="shrink-0">
        <AdminSideBar />
      </aside>

      <main className="flex-1 bg-white border border-[#E8E7E0] rounded-xl p-8 overflow-hidden">
        <header className="mb-10 border-b border-[#F5F4F0] pb-6">
          <h1 className="font-serif text-3xl text-stone-900">Ürün Onay Listesi</h1>
          <p className="text-stone-500 text-sm mt-2">
            Yeni eklenen ürünleri inceleyip yayına alabilir veya düzeltme isteyebilirsiniz.
          </p>
        </header>

        {enrichedProducts && enrichedProducts.length > 0 ? (
          <div className="animate-in fade-in duration-500">
            <AdminProductApproval products={enrichedProducts} />
          </div>
        ) : (
          <div className="bg-[#FAFAF8] border border-dashed border-stone-200 rounded-3xl p-24 text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-stone-900 font-medium">Harika iş!</h3>
            <p className="text-stone-400 text-sm mt-1 font-serif">
              Şu an onay bekleyen herhangi bir ürün bulunmuyor.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}