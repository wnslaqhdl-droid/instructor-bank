import { supabase } from "../supabase";

export async function uploadProfileImage(file, instructorId) {

  if (!file) {
    return null;
  }

  const fileExt =
    file.name.split(".").pop();

  const fileName =
    `${instructorId}-${Date.now()}.${fileExt}`;

  const filePath =
    `profiles/${fileName}`;

  const { error: uploadError } =
    await supabase.storage
      .from("profile-images")
      .upload(filePath, file, {
        upsert: true
      });

  if (uploadError) {
    throw new Error(
      "이미지 업로드 실패: " +
      uploadError.message
    );
  }

  const {
    data: publicUrlData
  } = supabase.storage
    .from("profile-images")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
