import {
  isValidEmail,
  isValidPhone
} from "../utils/validators";

import { uploadProfileImage }
from "../utils/uploadProfileImage";

import { uploadCertificateAttachment }
from "../utils/uploadCertificateAttachment";

import { uploadExperienceAttachment }
from "../utils/uploadExperienceAttachment";

export async function saveInstructorEdit({
  supabase,
  editingItem,
  editingTrainings,
  editingWelfares,
  editingLectures,
  editingCertificates
}) {

  if (!isValidEmail(editingItem.email)) {

    throw new Error(
      "이메일은 이메일@도메인.com 형식으로 입력해 주세요."
    );
  }

  if (!isValidPhone(editingItem.phone)) {

    throw new Error(
      "전화번호는 00-0000-0000, 000-0000-0000 또는 010-0000-0000 형식으로 입력해 주세요."
    );
  }

  /*
    프로필 이미지
  */

  let profileImageUrl =
    editingItem.profile_image;

  if (editingItem.profile_image_file) {

    profileImageUrl =
      await uploadProfileImage(
        editingItem.profile_image_file,
        editingItem.id,
        editingItem.profile_image
      );
  }

  /*
    기본정보 수정
  */

  const { error } = await supabase
    .from("instructors")
    .update({

      name:
        editingItem.name,

      phone:
        editingItem.phone,

      email:
        editingItem.email,

      region:
        editingItem.region,

      activity_regions:
        editingItem.activity_regions,

      organization:
        editingItem.organization,

      position:
        editingItem.position,

      main_topic:
        editingItem.main_topic,

      specialties:
        editingItem.specialties,

      other_specialty:
        editingItem.other_specialty,

      targets:
        editingItem.targets,

      types:
        editingItem.types,

      intro:
        editingItem.intro,

      show_phone:
        editingItem.show_phone,

      show_email:
        editingItem.show_email,

      show_profile:
        editingItem.show_profile,

      center_verified:
        editingItem.center_verified,

      profile_image:
        profileImageUrl
    })
    .eq("id", editingItem.id);

  if (error) {

    throw new Error(
      "수정 실패: " + error.message
    );
  }

  /*
    양성과정
  */

  await supabase
    .from("training_courses")
    .delete()
    .eq(
      "instructor_id",
      editingItem.id
    );

  const validTrainings =
    editingTrainings
      .filter(
        (t)=>
          t.course_name ||
          t.institution ||
          t.completion_year
      )
      .map((t)=>({

        instructor_id:
          editingItem.id,

        course_name:
          t.course_name || "",

        institution:
          t.institution || "",

        completion_year:
          t.completion_year || ""
      }));

  if (validTrainings.length) {

    await supabase
      .from("training_courses")
      .insert(validTrainings);
  }

  /*
    실무경력
  */

  await supabase
    .from("welfare_experiences")
    .delete()
    .eq(
      "instructor_id",
      editingItem.id
    );

  const validWelfares = [];

  for (const w of editingWelfares) {

    const isValid =
      w.organization ||
      w.role ||
      w.start_date ||
      w.end_date ||
      w.description;

    if (!isValid) {
      continue;
    }

    let attachmentUrl =
      w.attachment_url || null;

    if (w.attachment_file) {

      attachmentUrl =
        await uploadExperienceAttachment(
          w.attachment_file,
          editingItem.id,
          w.attachment_url
        );
    }

    validWelfares.push({

      instructor_id:
        editingItem.id,

      organization:
        w.organization || "",

      role:
        w.role || "",

      start_date:
        w.start_date || null,

      end_date:
        w.end_date || null,

      description:
        w.description || "",

      attachment_url:
        attachmentUrl
    });
  }

  if (validWelfares.length) {

    await supabase
      .from("welfare_experiences")
      .insert(validWelfares);
  }

  /*
    강의경력
  */

  await supabase
    .from("lecture_experiences")
    .delete()
    .eq(
      "instructor_id",
      editingItem.id
    );

  const validLectures = [];

  for (const l of editingLectures) {

    const isValid =
      l.organization ||
      l.target ||
      l.topic ||
      l.start_date ||
      l.end_date ||
      l.count;

    if (!isValid) {
      continue;
    }

    let attachmentUrl =
      l.attachment_url || null;

    if (l.attachment_file) {

      attachmentUrl =
        await uploadExperienceAttachment(
          l.attachment_file,
          editingItem.id,
          l.attachment_url
        );
    }

    validLectures.push({

      instructor_id:
        editingItem.id,

      organization:
        l.organization || "",

      target:
        l.target || "",

      topic:
        l.topic || "",

      start_date:
        l.start_date || null,

      end_date:
        l.end_date || null,

      count:
        l.count || "",

      attachment_url:
        attachmentUrl
    });
  }

  if (validLectures.length) {

    await supabase
      .from("lecture_experiences")
      .insert(validLectures);
  }

  /*
    자격증
  */

  await supabase
    .from("certificates")
    .delete()
    .eq(
      "instructor_id",
      editingItem.id
    );

  const validCertificates = [];

  for (const cert of editingCertificates) {

    const isValid =
      cert.name ||
      cert.organization ||
      cert.acquired_date ||
      cert.expire_date;

    if (!isValid) {
      continue;
    }

    let attachmentUrl =
      cert.attachment_url || null;

    if (cert.attachment_file) {

      attachmentUrl =
        await uploadCertificateAttachment(
          cert.attachment_file,
          editingItem.id,
          cert.attachment_url
        );
    }

    validCertificates.push({

      instructor_id:
        editingItem.id,

      name:
        cert.name || "",

      organization:
        cert.organization || "",

      acquired_date:
        cert.acquired_date || null,

      expire_date:
        cert.expire_date || null,

      is_public:
        !!cert.is_public,

      attachment_url:
        attachmentUrl
    });
  }

  if (validCertificates.length) {

    await supabase
      .from("certificates")
      .insert(validCertificates);
  }
}
