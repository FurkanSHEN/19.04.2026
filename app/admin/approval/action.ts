"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
// src/app/admin/approval/actions.ts

export async function updateProductStatus(
  id: number,
  action: "approve" | "reject",
  feedback?: { kategori: string; mesaj: string }
) {
  const status = action === "approve" ? "yayinda" : "reddedildi";

  const { error } = await supabaseAdmin
    .from("urunler")
    .update({
      durum: status,
      red_nedeni: action === "reject" ? feedback?.mesaj : null,
      red_kategorisi: action === "reject" ? feedback?.kategori : null,
    })
    .eq("id", id);

  if (error) {
    // Terminalde (Sunucu tarafında) hatayı detaylı görelim
    console.error("SUPABASE HATASI:", error.message, error.details, error.hint);
    throw new Error(error.message); // Hatayı ön yüze fırlat
  }

  revalidatePath("/admin/approval");
}