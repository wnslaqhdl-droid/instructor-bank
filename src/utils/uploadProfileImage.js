import { supabase } from "../supabase";

export async function uploadProfileImage(
  file,
  instructorId,
  oldImageUrl = null
) {

  if (!file) {
    return null;
  }

  // 기존 파일 삭제
  if (oldImageUrl) {

    try {

      const url =
        new URL(oldImageUrl);

      const pathParts =
        url.pathname.split(
          "/profile-images/"
        );

      if (pathParts[1]) {

        await supabase.storage
          .from("profile-images")
          .remove([
            pathParts[1]
          ]);
      }

    } catch (err) {

      console.error(
        "기존 이미지 삭제 실패",
        err
      );
    }
  }

  const fileExt =
    file.name
      .split(".")
      .pop();

  const fileName =
    `${instructorId}-${Date.now()}.${fileExt}`;

  const filePath =
    `profiles/${fileName}`;

  const {
    error: uploadError
  } = await supabase.storage
    .from("profile-images")
    .upload(
      filePath,
      file,
      {
        upsert: true
      }
    );

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
