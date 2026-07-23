"use server"

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface SiteAyari {
  id: number;
  anahtar: string;
  aciklama: string | null;
  aktif: boolean;
}

export async function getSiteAyarlari(): Promise<Record<string, SiteAyari>> {
  const { data } = await supabaseAdmin
    .from("site_ayarlari")
    .select("id, anahtar, aciklama, aktif");

  const ayarlar: Record<string, SiteAyari> = {};
  data?.forEach(item => { ayarlar[item.anahtar] = item; });
  return ayarlar;
}

export async function updateSiteAyari(anahtar: string, aciklama: string | null, aktif: boolean) {
  const { error } = await supabaseAdmin
    .from("site_ayarlari")
    .update({ aciklama, aktif, updated_at: new Date().toISOString() })
    .eq("anahtar", anahtar);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function uploadSiteGorsel(file: File, klasor: string = "genel") {
  const ext = file.name.split(".").pop();
  const filePath = `${klasor}/${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from("site-fotograflari")
    .upload(filePath, file, { cacheControl: "3600", upsert: true });

  if (error) return { success: false, error: error.message };

  const { data: urlData } = supabaseAdmin.storage
    .from("site-fotograflari")
    .getPublicUrl(filePath);

  return { success: true, url: urlData.publicUrl };
}

export async function getSiteGorselleri(): Promise<string[]> {
  const { data } = await supabaseAdmin.storage
    .from("site-fotograflari")
    .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

  if (!data) return [];

  return data
    .filter(f => f.name !== ".emptyFolderPlaceholder")
    .map(f => supabaseAdmin.storage.from("site-fotograflari").getPublicUrl(f.name).data.publicUrl);
}