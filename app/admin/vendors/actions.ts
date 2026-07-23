"use server"

import { supabaseAdmin as supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VendorDurum = 'aktif' | 'pasif' | 'incelemede' | 'kisitli' | 'tatil_modu';
export type PaketlemeTipi = 'flat-pack' | 'kurulu' | 'mix';

export interface Vendor {
  id: number;
  
  // Temel Bilgiler
  ad: string;
  email: string;
  telefon: string | null;
  durum: VendorDurum;
  
  // Finansal Bilgiler
  vergi_dairesi?: string | null;
  vergi_no?: string | null;
  iban?: string | null;
  komisyon_orani: number; // Decimal (15.00 = %15)
  yetkili_kisi_adi?: string | null;
  yetkili_kisi_unvan?: string | null;
  
  // Performans KPI
  guven_skoru: number;
  basarili_teslimat: number;
  odeme_zamanlama: 'gemide' | 'teslimatta';
  ortalama_uretim_suresi: number; // Gün
  iade_orani: number; // Decimal (1.5 = %1.5)
  hasarli_teslimat_orani: number; // Decimal
  
  // Lojistik
  depo_lokasyonu?: string | null;
  uretim_lokasyonu?: string | null;
  ihracat_yetkinligi: boolean;
  paketleme_tipi: PaketlemeTipi;
  gumrukleme_tecrubesi: boolean;
  
  // Marka Kimliği
  marka_hikayesi?: string | null;
  sertifikalar: string[]; // JSONB array
  garanti_suresi_yil: number;
  zanaat_yili?: number | null;
  
  // Ekstra
  website_url?: string | null;
  sosyal_medya?: Record<string, string>; // JSONB object
  dahili_notlar?: string | null;
  
  // Tarihler
  created_at: string;
  updated_at: string;
  
  // İstatistikler (computed)
  urun_sayisi?: number;
  aktif_siparis?: number;
  toplam_kazanc?: number;
}

export interface VendorFormData {
  // Temel
  ad: string;
  email: string;
  telefon?: string;
  durum?: VendorDurum;
  yetkili_kisi_adi?: string;
  yetkili_kisi_unvan?: string;
  
  // Finansal
  vergi_dairesi?: string;
  vergi_no?: string;
  iban?: string;
  komisyon_orani?: number;
  
  // Performans
  guven_skoru?: number;
  ortalama_uretim_suresi?: number;
  
  // Lojistik
  depo_lokasyonu?: string;
  uretim_lokasyonu?: string;
  ihracat_yetkinligi?: boolean;
  paketleme_tipi?: PaketlemeTipi;
  gumrukleme_tecrubesi?: boolean;
  
  // Marka
  marka_hikayesi?: string;
  sertifikalar?: string[];
  garanti_suresi_yil?: number;
  zanaat_yili?: number;
  website_url?: string;
  
  // Notlar
  dahili_notlar?: string;
}

// ─── Actions (Updated) ────────────────────────────────────────────────────────

/**
 * Tüm vendor'ları listele (güncellenmiş)
 */
export async function getAllVendors(): Promise<Vendor[]> {
  try {
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (vendorError) throw vendorError;

    // İstatistikleri ekle
    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const { count: urun_sayisi } = await supabase
          .from('urunler')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id);

        const { count: aktif_siparis } = await supabase
          .from('siparis_detay')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id)
          .neq('durum', 'teslim_edildi');

        const { data: kazancData } = await supabase
          .from('siparis_detay')
          .select('birim_fiyat, adet')
          .eq('vendor_id', vendor.id)
          .eq('durum', 'teslim_edildi');

        const toplam_kazanc = kazancData?.reduce(
          (sum, item) => sum + (parseFloat(item.birim_fiyat) * item.adet),
          0
        ) || 0;

        return {
          ...vendor,
          sertifikalar: vendor.sertifikalar || [],
          sosyal_medya: vendor.sosyal_medya || {},
          urun_sayisi: urun_sayisi || 0,
          aktif_siparis: aktif_siparis || 0,
          toplam_kazanc: Math.round(toplam_kazanc),
        };
      })
    );

    return vendorsWithStats;

  } catch (error: any) {
    console.error("getAllVendors error:", error);
    throw new Error(error.message);
  }
}

/**
 * Yeni vendor ekle (genişletilmiş)
 */
export async function createVendor(formData: VendorFormData) {
  try {
    const insertData: any = {
      // Temel
      ad: formData.ad,
      email: formData.email,
      telefon: formData.telefon || null,
      durum: formData.durum || 'incelemede',
      yetkili_kisi_adi: formData.yetkili_kisi_adi || null,
      yetkili_kisi_unvan: formData.yetkili_kisi_unvan || null,
      
      // Finansal
      vergi_dairesi: formData.vergi_dairesi || null,
      vergi_no: formData.vergi_no || null,
      iban: formData.iban || null,
      komisyon_orani: formData.komisyon_orani || 15.00,
      
      // Performans
      guven_skoru: formData.guven_skoru || 50,
      basarili_teslimat: 0,
      odeme_zamanlama: (formData.guven_skoru || 50) >= 80 ? 'gemide' : 'teslimatta',
      ortalama_uretim_suresi: formData.ortalama_uretim_suresi || 21,
      iade_orani: 0,
      hasarli_teslimat_orani: 0,
      
      // Lojistik
      depo_lokasyonu: formData.depo_lokasyonu || null,
      uretim_lokasyonu: formData.uretim_lokasyonu || null,
      ihracat_yetkinligi: formData.ihracat_yetkinligi || false,
      paketleme_tipi: formData.paketleme_tipi || 'flat-pack',
      gumrukleme_tecrubesi: formData.gumrukleme_tecrubesi || false,
      
      // Marka
      marka_hikayesi: formData.marka_hikayesi || null,
      sertifikalar: formData.sertifikalar || [],
      garanti_suresi_yil: formData.garanti_suresi_yil || 2,
      zanaat_yili: formData.zanaat_yili || null,
      website_url: formData.website_url || null,
      
      // Notlar
      dahili_notlar: formData.dahili_notlar || null,
    };

    const { data, error } = await supabase
      .from('vendors')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/vendors');
    return { success: true, data };

  } catch (error: any) {
    console.error("createVendor error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Vendor güncelle (genişletilmiş)
 */
export async function updateVendor(vendorId: number, formData: Partial<VendorFormData>) {
  try {
    const updateData: any = {};

    // Temel
    if (formData.ad) updateData.ad = formData.ad;
    if (formData.email) updateData.email = formData.email;
    if (formData.telefon !== undefined) updateData.telefon = formData.telefon || null;
    if (formData.durum) updateData.durum = formData.durum;
    if (formData.yetkili_kisi_adi !== undefined) updateData.yetkili_kisi_adi = formData.yetkili_kisi_adi || null;
    if (formData.yetkili_kisi_unvan !== undefined) updateData.yetkili_kisi_unvan = formData.yetkili_kisi_unvan || null;
    
    // Finansal
    if (formData.vergi_dairesi !== undefined) updateData.vergi_dairesi = formData.vergi_dairesi || null;
    if (formData.vergi_no !== undefined) updateData.vergi_no = formData.vergi_no || null;
    if (formData.iban !== undefined) updateData.iban = formData.iban || null;
    if (formData.komisyon_orani !== undefined) updateData.komisyon_orani = formData.komisyon_orani;
    
    // Performans
    if (formData.guven_skoru !== undefined) {
      updateData.guven_skoru = formData.guven_skoru;
      updateData.odeme_zamanlama = formData.guven_skoru >= 80 ? 'gemide' : 'teslimatta';
    }
    if (formData.ortalama_uretim_suresi !== undefined) updateData.ortalama_uretim_suresi = formData.ortalama_uretim_suresi;
    
    // Lojistik
    if (formData.depo_lokasyonu !== undefined) updateData.depo_lokasyonu = formData.depo_lokasyonu || null;
    if (formData.uretim_lokasyonu !== undefined) updateData.uretim_lokasyonu = formData.uretim_lokasyonu || null;
    if (formData.ihracat_yetkinligi !== undefined) updateData.ihracat_yetkinligi = formData.ihracat_yetkinligi;
    if (formData.paketleme_tipi) updateData.paketleme_tipi = formData.paketleme_tipi;
    if (formData.gumrukleme_tecrubesi !== undefined) updateData.gumrukleme_tecrubesi = formData.gumrukleme_tecrubesi;
    
    // Marka
    if (formData.marka_hikayesi !== undefined) updateData.marka_hikayesi = formData.marka_hikayesi || null;
    if (formData.sertifikalar) updateData.sertifikalar = formData.sertifikalar;
    if (formData.garanti_suresi_yil !== undefined) updateData.garanti_suresi_yil = formData.garanti_suresi_yil;
    if (formData.zanaat_yili !== undefined) updateData.zanaat_yili = formData.zanaat_yili || null;
    if (formData.website_url !== undefined) updateData.website_url = formData.website_url || null;
    
    // Notlar
    if (formData.dahili_notlar !== undefined) updateData.dahili_notlar = formData.dahili_notlar || null;

    // Durum değişikliğine göre profiles.rol güncelle
    if (formData.durum === 'aktif') {
      const { data: v } = await supabase
        .from('vendors').select('auth_user_id').eq('id', vendorId).single();
      if (v?.auth_user_id) {
        await supabase
          .from('profiles').update({ rol: 'vendor' }).eq('id', v.auth_user_id);
      }
    } else if (['pasif', 'kisitli', 'reddedildi', 'tatil_modu', 'incelemede'].includes(formData.durum || '')) {
      const { data: v } = await supabase
        .from('vendors').select('auth_user_id').eq('id', vendorId).single();
      if (v?.auth_user_id) {
        await supabase
          .from('profiles').update({ rol: 'musteri' }).eq('id', v.auth_user_id);
      }
    }

    const { data, error } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', vendorId)
      .select();

    if (error) throw error;

    revalidatePath('/admin/vendors');
    return { success: true, data };

  } catch (error: any) {
    console.error("updateVendor error:", error);
    return { success: false, error: error.message };
  }
}

// Diğer fonksiyonlar aynı kalıyor (deleteVendor, toggleVendorStatus, etc.)
export async function deleteVendor(vendorId: number) {
  try {
    const { count: urunSayisi } = await supabase
      .from('urunler')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId);

    if (urunSayisi && urunSayisi > 0) {
      return { 
        success: false, 
        error: `Bu vendor'ın ${urunSayisi} adet ürünü var. Önce ürünleri silin.` 
      };
    }

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId);

    if (error) throw error;

    revalidatePath('/admin/vendors');
    return { success: true };

  } catch (error: any) {
    console.error("deleteVendor error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleVendorStatus(vendorId: number, currentStatus: VendorDurum) {
  try {
    const newStatus: VendorDurum = currentStatus === 'aktif' ? 'pasif' : 'aktif';

    const { data, error } = await supabase
      .from('vendors')
      .update({ durum: newStatus })
      .eq('id', vendorId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/vendors');
    return { success: true, data };

  } catch (error: any) {
    console.error("toggleVendorStatus error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateGuvenSkoru(vendorId: number, yeniSkor: number) {
  try {
    const skor = Math.max(0, Math.min(100, yeniSkor));
    const odemeZamanlama = skor >= 80 ? 'gemide' : 'teslimatta';

    const { data, error } = await supabase
      .from('vendors')
      .update({ 
        guven_skoru: skor,
        odeme_zamanlama: odemeZamanlama 
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/vendors');
    return { success: true, data };

  } catch (error: any) {
    console.error("updateGuvenSkoru error:", error);
    return { success: false, error: error.message };
  }
}

export async function searchVendors(query: string): Promise<Vendor[]> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .or(`ad.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];

  } catch (error: any) {
    console.error("searchVendors error:", error);
    return [];
  }
}

export async function getVendorById(vendorId: number): Promise<Vendor | null> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (error) throw error;
    return data;

  } catch (error: any) {
    console.error("getVendorById error:", error);
    return null;
  }
}