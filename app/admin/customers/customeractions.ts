"use server"

import { supabase, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  ad: string;
  soyad: string;
  telefon: string | null;
  email?: string | null;
  rol: string;
  created_at: string;
  toplam_siparis?: number;
  toplam_harcama?: number;
  son_siparis_tarihi?: string | null;
}

export interface CustomerFormData {
  ad: string;
  soyad: string;
  telefon?: string;
}

export interface CustomerStats {
  toplam_siparis: number;
  toplam_harcama: number;
  son_siparis_tarihi: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Sadece müşterileri listele (rol = 'musteri')
 */
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('rol', 'musteri') // Sadece müşteriler
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!profiles || profiles.length === 0) return [];

    // Auth'dan email'leri toplu çek
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailMap = new Map(authUsers?.users?.map(u => [u.id, u.email]) || []);

    // Sipariş istatistiklerini çek
    const { data: siparisler } = await supabaseAdmin
      .from('siparisler')
      .select('user_id, toplam_fiyat, created_at')
      .in('user_id', profiles.map(p => p.id));

    // Her müşteri için istatistik hesapla
    return profiles.map(profile => {
      const musterSiparisler = siparisler?.filter(s => s.user_id === profile.id) || [];
      const toplam_harcama = musterSiparisler.reduce(
        (sum, s) => sum + parseFloat(s.toplam_fiyat || '0'), 0
      );
      const sonSiparis = musterSiparisler.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        ...profile,
        email: emailMap.get(profile.id) || null,
        toplam_siparis: musterSiparisler.length,
        toplam_harcama: Math.round(toplam_harcama),
        son_siparis_tarihi: sonSiparis?.created_at || null,
      };
    });

  } catch (error: any) {
    console.error("getAllCustomers error:", error);
    throw new Error(error.message);
  }
}

/**
 * Tek müşteri detayı
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) throw error;

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(customerId);
    const stats = await getCustomerStats(customerId);

    return {
      ...data,
      email: userData?.user?.email || null,
      ...stats,
    };

  } catch (error: any) {
    console.error("getCustomerById error:", error);
    return null;
  }
}

/**
 * Müşteri rolünü değiştir
 */
export async function updateCustomerRole(
  customerId: string,
  yeniRol: 'musteri' | 'vendor' | 'admin'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ rol: yeniRol })
      .eq('id', customerId);

    if (error) throw error;

    revalidatePath('/admin/customers');
    return { success: true };

  } catch (error: any) {
    console.error("updateCustomerRole error:", error);
    return { success: false, error: error.message };
  }
}




/**
 * Yeni müşteri oluştur
 */
export async function createCustomer(
  formData: CustomerFormData
): Promise<{ success: boolean; error?: string; customerId?: string }> {
  try {
    // Not: Bu fonksiyon sadece profiles tablosuna kayıt ekler.
    // Eğer müşterinin giriş yapabilmesi (auth) gerekiyorsa,
    // önce supabaseAdmin.auth.admin.createUser(...) ile auth kaydı oluşturulmalı.

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        ad: formData.ad,
        soyad: formData.soyad,
        telefon: formData.telefon || null,
        rol: 'musteri',
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/customers');
    return { success: true, customerId: data.id };

  } catch (error: any) {
    console.error("createCustomer error:", error);
    return { success: false, error: error.message };
  }
}


/**
 * Müşteri bilgilerini güncelle
 */
export async function updateCustomer(
  customerId: string,
  formData: Partial<CustomerFormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {};
    if (formData.ad) updateData.ad = formData.ad;
    if (formData.soyad) updateData.soyad = formData.soyad;
    if (formData.telefon !== undefined) updateData.telefon = formData.telefon || null;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', customerId);

    if (error) throw error;

    revalidatePath('/admin/customers');
    return { success: true };

  } catch (error: any) {
    console.error("updateCustomer error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Müşteri istatistikleri
 */
export async function getCustomerStats(customerId: string): Promise<CustomerStats> {
  try {
    const { data: siparisler } = await supabaseAdmin
      .from('siparisler')
      .select('toplam_fiyat, created_at')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    const toplam_harcama = siparisler?.reduce(
      (sum, s) => sum + parseFloat(s.toplam_fiyat || '0'), 0
    ) || 0;

    return {
      toplam_siparis: siparisler?.length || 0,
      toplam_harcama: Math.round(toplam_harcama),
      son_siparis_tarihi: siparisler?.[0]?.created_at || null,
    };

  } catch (error: any) {
    return { toplam_siparis: 0, toplam_harcama: 0, son_siparis_tarihi: null };
  }
}

/**
 * Müşterinin sipariş geçmişi
 */
export async function getCustomerOrders(customerId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('siparisler')
      .select(`
        *,
        siparis_detay (
          id,
          adet,
          birim_fiyat,
          urunler (ad, kategori)
        )
      `)
      .eq('user_id', customerId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];

  } catch (error: any) {
    console.error("getCustomerOrders error:", error);
    return [];
  }
}

/**
 * Genel müşteri istatistikleri
 */
export async function getCustomerOverviewStats() {
  try {
    const { count: toplamMusteri } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('rol', 'musteri');

    const buAyBaslangic = new Date();
    buAyBaslangic.setDate(1);
    buAyBaslangic.setHours(0, 0, 0, 0);

    const { count: yeniKayitlar } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('rol', 'musteri')
      .gte('created_at', buAyBaslangic.toISOString());

    const otuzGunOnce = new Date();
    otuzGunOnce.setDate(otuzGunOnce.getDate() - 30);

    const { data: aktifSiparisler } = await supabaseAdmin
      .from('siparisler')
      .select('user_id')
      .gte('created_at', otuzGunOnce.toISOString());

    const aktifMusteri = new Set(aktifSiparisler?.map(s => s.user_id)).size;

    const { data: tumSiparisler } = await supabaseAdmin
      .from('siparisler')
      .select('toplam_fiyat');

    const toplamHarcama = tumSiparisler?.reduce(
      (sum, s) => sum + parseFloat(s.toplam_fiyat || '0'), 0
    ) || 0;

    return {
      toplamMusteri: toplamMusteri || 0,
      yeniKayitlar: yeniKayitlar || 0,
      aktifMusteri,
      toplamHarcama: Math.round(toplamHarcama),
      ortalamaHarcama: toplamMusteri
        ? Math.round(toplamHarcama / toplamMusteri)
        : 0,
    };

  } catch (error: any) {
    console.error("getCustomerOverviewStats error:", error);
    return { toplamMusteri: 0, yeniKayitlar: 0, aktifMusteri: 0, toplamHarcama: 0, ortalamaHarcama: 0 };
  }
}

/**
 * Müşteri arama
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('rol', 'musteri')
      .or(`ad.ilike.%${query}%,soyad.ilike.%${query}%,telefon.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];

  } catch (error: any) {
    return [];
  }
}
