"use server"

import { supabase, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";


// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiparisDetay {
  id: number;
  urun_id: number;
  vendor_id: number;
  adet: number;
  birim_fiyat: number;
  modul_secimi: any;
  satir_cbm: number;
  urunler: {
    ad: string;
    ana_gorsel: string | null;
  } | null;
  vendors: {
    ad: string;
  } | null;
}

export interface Siparis {
  id: number;
  user_id: string;
  toplam_fiyat: number;
  para_birimi: string;
  doviz_kuru: number;
  durum: string;
  teslimat_adresi: any;
  created_at: string;
  profiles: {
    ad: string | null;
    soyad: string | null;
    telefon: string | null;
  } | null;
  siparis_detay: SiparisDetay[];
  musteri_email?: string | null;
}

export interface SiparisListeItem {
  id: number;
  user_id: string;
  musteri_ad: string;
  musteri_soyad: string;
  toplam_fiyat: number;
  para_birimi: string;
  durum: string;
  created_at: string;
  urun_sayisi: number;
}

export interface PaginatedResult {
  siparisler: SiparisListeItem[];
  toplam: number;
  sayfa: number;
  sayfaBoyutu: number;
  toplamSayfa: number;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Sayfalı sipariş listesi
 */
export async function getAdminOrders({
  sayfa = 1,
  sayfaBoyutu = 25,
  durum = "",
  aramaId = "",
  baslangicTarih = "",
  bitisTarih = "",
  vendorId = "",
}: {
  sayfa?: number;
  sayfaBoyutu?: number;
  durum?: string;
  aramaId?: string;
  baslangicTarih?: string;
  bitisTarih?: string;
  vendorId?: string;
}): Promise<PaginatedResult> {
  try {
    const from = (sayfa - 1) * sayfaBoyutu;
    const to = from + sayfaBoyutu - 1;

    // Önce toplam sayıyı al
    let countQuery = supabase
      .from('siparisler')
      .select('id', { count: 'exact', head: true });

    if (durum) countQuery = countQuery.eq('durum', durum);
    if (aramaId) countQuery = countQuery.eq('id', parseInt(aramaId) || 0);
    if (baslangicTarih) countQuery = countQuery.gte('created_at', baslangicTarih);
    if (bitisTarih) countQuery = countQuery.lte('created_at', bitisTarih);

    const { count } = await countQuery;

    // Asıl veriyi çek
    let query = supabaseAdmin  // supabase → supabaseAdmin
  .from('siparisler')
  .select(`
    id,
    user_id,
    toplam_fiyat,
    para_birimi,
    durum,
    created_at,
    profiles (
      ad,
      soyad,
      telefon
    ),
    siparis_detay (
      id,
      vendor_id
    )
  `)
  .order('created_at', { ascending: false })
  .range(from, to);

    if (durum) query = query.eq('durum', durum);
    if (aramaId) query = query.eq('id', parseInt(aramaId) || 0);
    if (baslangicTarih) query = query.gte('created_at', baslangicTarih);
    if (bitisTarih) query = query.lte('created_at', bitisTarih);

    const { data, error } = await query;
    if (error) throw error;

    // Vendor filtresi (siparis_detay üzerinden)
    let filtrelenmis = data || [];
    if (vendorId) {
      filtrelenmis = filtrelenmis.filter((s: any) =>
        s.siparis_detay?.some((d: any) => d.vendor_id === parseInt(vendorId))
      );
    }

    const siparisler: SiparisListeItem[] = filtrelenmis.map((s: any) => ({
      id: s.id,
      user_id: s.user_id,
      musteri_ad: s.profiles?.ad || "—",
      musteri_soyad: s.profiles?.soyad || "",
      toplam_fiyat: parseFloat(s.toplam_fiyat) || 0,
      para_birimi: s.para_birimi || "TRY",
      durum: s.durum,
      created_at: s.created_at,
      urun_sayisi: s.siparis_detay?.length || 0,
    }));

    return {
      siparisler,
      toplam: count || 0,
      sayfa,
      sayfaBoyutu,
      toplamSayfa: Math.ceil((count || 0) / sayfaBoyutu),
    };

  } catch (error: any) {
    console.error("getAdminOrders error:", error);
    throw new Error(error.message);
  }
}

/**
 * Sipariş detayını getirir (modal için)
 */
export async function getOrderDetail(siparisId: number): Promise<Siparis | null> {
  try {
    const { data, error } = await supabase
      .from('siparisler')
      .select(`
        *,
        profiles (
          ad,
          soyad,
          telefon
        ),
        siparis_detay (
          *,
          urunler (
            ad,
            ana_gorsel
          ),
          vendors (
            ad
          )
        )
      `)
      .eq('id', siparisId)
      .single();

    if (error) throw error;

    const { data: profileData } = await supabaseAdmin
  .from('profiles')
  .select('ad, soyad, telefon')
  .eq('id', data.user_id)
  .single();

    // Auth'dan email çek
const { data: userData, error: authError } = await supabaseAdmin.auth.admin.getUserById(data.user_id);

    return {
      ...data,
      profiles: profileData,
      musteri_email: userData?.user?.email || null,
    };

    

  } catch (error: any) {
    console.error("getOrderDetail error:", error);
    return null;
  }
}

/**
 * Sipariş durumunu günceller
 */
export async function updateOrderStatus(
  siparisId: number,
  durum: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('siparisler')
      .update({ durum })
      .eq('id', siparisId);

    if (error) throw error;

    revalidatePath('/admin/orders');
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin için vendor listesi (filtre dropdown'u için)
 */
export async function getVendorList(): Promise<{ id: number; ad: string }[]> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('id, ad')
      .eq('durum', 'aktif')
      .order('ad');

    if (error) throw error;
    return data || [];

  } catch (error: any) {
    return [];
  }
}