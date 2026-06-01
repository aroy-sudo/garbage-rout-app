"use server";

import { createClient } from "@/src/utils/supabase/server";

/**
 * Handles live-captured proof uploading to the Supabase Storage bucket ('epr_proofs').
 * Extracts standard File inputs from the parsed FormData server-side.
 */
export async function uploadEprProof(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Authenticate driver session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { error: "No image file provided" };
    }

    // 2. Convert binary file to ArrayBuffer for safe Supabase buffer uploads
    const buffer = await file.arrayBuffer();

    // 3. Construct folder-structured unique filename
    const extension = file.name.split(".").pop() || "jpg";
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const fileName = `${user.id}/${Date.now()}_${uniqueId}.${extension}`;

    // 4. Upload raw file buffer to bucket
    const { error: uploadError } = await supabase.storage
      .from("epr_proofs")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return { error: uploadError.message };
    }

    // 5. Query and resolve the public access URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("epr_proofs").getPublicUrl(fileName);

    return { url: publicUrl };
  } catch (err) {
    console.error("EPR proof upload action exception:", err);
    return { error: "Internal Server Error" };
  }
}
