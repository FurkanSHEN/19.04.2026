/**
 * 🔐 VENDOR AUTH HELPERS
 * Satıcı kimlik doğrulama ve yetkilendirme yardımcı fonksiyonları.
 * profiles.vendor_id üzerinden gerçek Supabase auth session'ını kullanır.
 * IDOR saldırılarını önler (bir vendor'ın, başka bir vendor'ın verisine
 * URL/ID değiştirerek erişmesini engeller).
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VendorUser {
  id: string;              // profiles.id / auth.users.id (uuid)
  vendor_id: number;       // profiles.vendor_id
  ad: string | null;
  soyad: string | null;
  email: string | null;
  telefon: string | null;
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

// ─── Supabase (server-side, oturuma duyarlı) ─────────────────────────────────

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Şu anki oturumdaki kullanıcının vendor profilini çeker.
 * Giriş yapılmamışsa ya da kullanıcı bir vendor'a bağlı değilse null döner.
 */
export async function getCurrentVendorUser(): Promise<VendorUser | null> {
  try {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, ad, soyad, telefon, vendor_id, rol')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    if (!profile || profile.rol !== 'vendor' || !profile.vendor_id) return null;

    return {
      id: profile.id,
      vendor_id: profile.vendor_id,
      ad: profile.ad,
      soyad: profile.soyad,
      email: user.email ?? null,
      telefon: profile.telefon,
    };

  } catch (error) {
    console.error("getCurrentVendorUser error:", error);
    return null;
  }
}

/**
 * Şu anki satıcının firma (vendors) bilgilerini çeker.
 */
export async function getCurrentVendorInfo(): Promise<VendorInfo | null> {
  try {
    const vendorUser = await getCurrentVendorUser();
    if (!vendorUser) return null;

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('vendors')
      .select('id, ad, email, telefon, durum, guven_skoru, basarili_teslimat, odeme_zamanlama')
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
 * Sadece vendor_id'yi döner (IDOR koruması için — bir sayfa/sorgu her zaman
 * bu id'yi filtre olarak kullanmalı, URL/parametreden gelen id'ye güvenmemeli).
 */
export async function getCurrentVendorId(): Promise<number | null> {
  const vendorUser = await getCurrentVendorUser();
  return vendorUser?.vendor_id ?? null;
}

/**
 * Şu anki kullanıcının belirli bir vendor'a erişim yetkisi var mı kontrol eder.
 */
export async function canAccessVendor(vendorId: number): Promise<boolean> {
  const currentVendorId = await getCurrentVendorId();
  return currentVendorId === vendorId;
}

// NOT: Eski dosyadaki isVendorAdmin() ('admin' | 'editor' rolleri) kasıtlı
// olarak kaldırıldı. SQL şeman, bir vendor hesabına birden fazla kullanıcının
// farklı yetkilerle (admin/editor gibi) bağlanmasını desteklemiyor —
// profiles.vendor_id tek bir kullanıcıyı tek bir vendor'a bağlıyor. Yani şu an
// her vendor kullanıcısı kendi mağazasının tek yetkilisi kabul ediliyor.
// İleride bir vendor'a birden fazla ekip üyesi eklemek istersen (örn. bir
// çalışanın sadece siparişleri görebilmesi), ayrı bir vendor_ekip_uyeleri
// tablosu kurmamız gerekir — o zaman bu fonksiyonu geri ekleriz.
