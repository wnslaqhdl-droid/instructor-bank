import { supabase } from "../supabase";

export async function deleteCertificateAttachment(
  fileUrl
) {

  if (!fileUrl) {
    return;
  }

  try {

    const filePath =
      decodeURIComponent(
        fileUrl.split(
          "/storage/v1/object/public/certificate-files/"
        )[1] || ""
      );

    if (!filePath) {
      return;
    }

    await supabase.storage
      .from("certificate-files")
      .remove([filePath]);

  } catch (err) {

    console.error(
      "첨부파일 삭제 실패",
      err
    );
  }
}

export async function uploadCertificateAttachment(
  file,
  instructorId,
  oldUrl = null
) {

  if (!file) {
    return null;
  }

  // 기존 파일 삭제
  if (oldUrl) {

    await deleteCertificateAttachment(
      oldUrl
    );
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
