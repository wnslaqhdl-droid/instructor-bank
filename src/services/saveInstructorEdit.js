import {
  isValidEmail,
  isValidPhone
} from "../utils/validators";

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

  const { error } = await supabase
    .from("instructors")
    .update({
      name: editingItem.name,
      phone: editingItem.phone,
      email: editingItem.email,
      region: editingItem.region,
      activity_regions:
        editingItem.activity_regions,
      organization:
        editingItem.organization,
      position: editingItem.position,
      main_topic:
        editingItem.main_topic,
      specialties:
        editingItem.specialties,
      other_specialty:
        editingItem.other_specialty,
      targets: editingItem.targets,
      types: editingItem.types,
      intro: editingItem.intro,
      show_phone:
        editingItem.show_phone,
      show_email:
        editingItem.show_email,
      show_profile:
        editingItem.show_profile,
      center_verified:
        editingItem.center_verified,
      profile_image:
        editingItem.profile_image,
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
        (t) =>
          t.course_name ||
          t.institution ||
          t.completion_year
      )
      .map((t) => ({
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

  const validWelfares =
    editingWelfares
      .filter(
        (w) =>
          w.organization ||
          w.role ||
          w.start_date ||
          w.end_date ||
          w.description
      )
      .map((w) => ({
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
          w.description || ""
      }));

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

  const validLectures =
    editingLectures
      .filter(
        (l) =>
          l.organization ||
          l.target ||
          l.topic ||
          l.start_date ||
          l.end_date ||
          l.count
      )
      .map((l) => ({
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
          l.count || ""
      }));

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

  const validCertificates =
    editingCertificates
      .filter(
        (c) =>
          c.name ||
          c.organization ||
          c.acquired_date ||
          c.expire_date
      )
      .map((c) => ({
        instructor_id:
          editingItem.id,

        name:
          c.name || "",

        organization:
          c.organization || "",

        acquired_date:
          c.acquired_date || null,

        expire_date:
          c.expire_date || null,

        is_public:
          !!c.is_public
      }));

  if (validCertificates.length) {
    await supabase
      .from("certificates")
      .insert(validCertificates);
  }
}
