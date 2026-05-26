import { supabase } from "../supabase";

export async function uploadExperienceAttachment(
  file,
  instructorId,
  oldUrl = null
) {

  if (!file) {
    return null;
  }

  // 기존 파일 삭제
  if (oldUrl) {

    try {

      const oldPath =
        decodeURIComponent(
          oldUrl.split(
            "/storage/v1/object/public/experience-files/"
          )[1] || ""
        );

      if (oldPath) {

        await supabase.storage
          .from("experience-files")
          .remove([oldPath]);
      }

    } catch (err) {

      console.error(
        "기존 경력 첨부파일 삭제 실패",
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
    `attachments/${fileName}`;

  const { error: uploadError } =
    await supabase.storage
      .from("experience-files")
      .upload(filePath, file, {
        upsert: true
      });

  if (uploadError) {

    throw new Error(
      "경력 첨부파일 업로드 실패: " +
      uploadError.message
    );
  }

  const {
    data: publicUrlData
  } = supabase.storage
    .from("experience-files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
