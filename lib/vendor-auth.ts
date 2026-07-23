/**
 * 🔐 VENDOR AUTH HELPERS
 * Satıcı kimlik doğrulama ve yetkilendirme yardımcı fonksiyonları
 * IDOR saldırılarını önler
 */

import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VendorUser {
  id: number;
  vendor_id: string;
  ad: string;
  email: string;
  telefon: string | null;
  rol: 'admin' | 'editor';
  avatar_url: string | null;
}

export interface VendorInfo {
  id: number;
  ad: string;
  email: string;
  telefon: string | null;
  durum: string;
  guven_skoru: number;
  basarili_teslimat: number;
  odeme_zamanlama: 'gemide' | 'teslimatta';
}

// ─── Geçici: Hard-coded Vendor ID (Auth kurulana kadar) ──────────────────────

const TEMP_VENDOR_USER_ID = '4ecec318-0b1a-4952-8410-12086a5050e2'; // Ahmet Yılmaz (Senzia Home admin)

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Şu anki satıcı kullanıcısını çeker
 * TODO: Auth kurulunca burayı güncelleyeceğiz
 */
export async function getCurrentVendorUser(): Promise<VendorUser | null> {
  try {
    // ⚠️ GEÇİCİ: Auth kurulana kadar hard-coded
    // Sonra şöyle olacak:
    // const { data: { session } } = await supabase.auth.getSession();
    // if (!session) return null;
    // .eq('auth_user_id', session.user.id)

    const { data, error } = await supabase
      .from('vendor_users')
      .select('*')
      .eq('id', TEMP_VENDOR_USER_ID)
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error("getCurrentVendorUser error:", error);
    return null;
  }
}

/**
 * Şu anki satıcının firma bilgilerini çeker
 */
export async function getCurrentVendorInfo(): Promise<VendorInfo | null> {
  try {
    const vendorUser = await getCurrentVendorUser();
    if (!vendorUser) return null;

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorUser.vendor_id)
      .single();

    if (error) throw error;
    return data;

  } catch (error) {
    console.error("getCurrentVendorInfo error:", error);
    return null;
  }
}

/**
 * Sadece vendor_id'yi döner (IDOR koruması için)
 */
export async function getCurrentVendorId(): Promise<number | null> {
  const vendorUser = await getCurrentVendorUser();
  return vendorUser?.vendor_id || null;
}

/**
 * Kullanıcının belirli bir vendor'a erişim yetkisi var mı kontrol eder
 */
export async function canAccessVendor(vendorId: number): Promise<boolean> {
  const currentVendorId = await getCurrentVendorId();
  return currentVendorId === vendorId;
}

/**
 * Kullanıcının admin yetkisi var mı kontrol eder
 */
export async function isVendorAdmin(): Promise<boolean> {
  const vendorUser = await getCurrentVendorUser();
  return vendorUser?.rol === 'admin';
}