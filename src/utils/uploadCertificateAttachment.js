import { supabase } from "../supabase";

export async function uploadCertificateAttachment(
  file,
  instructorId,
  oldUrl = null
) {

  if (!file) {
    return null;
  }

  if (oldUrl) {

    try {

      const oldPath =
        decodeURIComponent(
          oldUrl.split(
            "/storage/v1/object/public/certificate-files/"
          )[1] || ""
        );

      if (oldPath) {

        await supabase.storage
          .from("certificate-files")
          .remove([oldPath]);
      }

    } catch (err) {

      console.error(
        "기존 첨부파일 삭제 실패",
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
      .from("certificate-files")
      .upload(filePath, file, {
        upsert: true
      });

  if (uploadError) {

    throw new Error(
      "첨부파일 업로드 실패: " +
      uploadError.message
    );
  }

  const {
    data: publicUrlData
  } = supabase.storage
    .from("certificate-files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
