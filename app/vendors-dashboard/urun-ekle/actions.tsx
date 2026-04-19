"use server"

import { supabase } from "@/lib/supabase"; // lib altındaki exporta göre
import { revalidatePath } from "next/cache";

export async function createProductAction(productData: any, modules: any[]) {
  try {
    // 1. URL Dostu Slug Oluştur (SEO için önemli)
    const slug = productData.ad
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 2. Ana Ürünü Ekle
    const { data: product, error: pError } = await supabase
      .from('urunler')
      .insert([{
        ad: productData.ad,
        slug: slug,
        aciklama: productData.aciklama,
        kategori: productData.kategori,
        fiyat: parseFloat(productData.baz_fiyat) || 0,
        durum: 'incelemede' // Admin onayına düşmesi için
      }])
      .select()
      .single();

    if (pError) throw pError;

    // 3. Eğer Modüller Varsa Onları Ekle
    if (modules && modules.length > 0) {
      const modulesToInsert = modules.map(m => ({
        urun_id: product.id,
        modul_adi: m.modul_adi,
        fiyat: parseFloat(m.fiyat) || 0,
        genislik: parseFloat(m.genislik) || 0,
        derinlik: parseFloat(m.derinlik) || 0,
        yukseklik: parseFloat(m.yukseklik) || 0,
        agirlik_kg: parseFloat(m.agirlik_kg) || 0
      }));

      const { error: mError } = await supabase
        .from('urun_modulleri')
        .insert(modulesToInsert);

      if (mError) throw mError;
    }

    revalidatePath('/admin/approval'); // Admin panelini tazele
    return { success: true, slug: product.slug };

  } catch (error: any) {
    console.error("Insert Error:", error);
    return { success: false, error: error.message };
  }
}