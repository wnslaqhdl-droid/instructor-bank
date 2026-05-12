import { supabase } from "../supabase";

export async function registerInstructor({
  form,
  trainingCourses,
  welfareExperiences,
  lectureExperiences,
}) {
  const normalizedEmail = form.email.trim().toLowerCase();

  // 이메일 중복 검사
  const { data: existingInstructor, error: duplicateCheckError } =
    await supabase
      .from("instructors")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

  if (duplicateCheckError) {
    throw new Error(
      "이메일 중복 확인 중 오류가 발생했습니다: " +
        duplicateCheckError.message
    );
  }

  if (existingInstructor) {
    throw new Error(
      "이미 등록된 이메일입니다. 정보 수정이 필요한 경우 ‘정보 수정 요청’ 메뉴를 이용해 주세요."
    );
  }

  // 강사 기본정보 저장
  const { data: inserted, error: insertError } = await supabase
    .from("instructors")
    .insert([
      {
        ...form,
        email: normalizedEmail,
        public_status: "검토중",
        update_status: "정상",
      },
    ])
    .select("id")
    .single();

  if (insertError) {
    throw new Error(
      "강사 기본정보 저장 실패: " + insertError.message
    );
  }

  const instructor_id = inserted.id;

  // 양성과정 정리
  const validTrainings = trainingCourses
    .filter(
      (x) =>
        x.course_name ||
        x.institution ||
        x.completion_year
    )
    .map((x) => ({
      instructor_id,
      ...x,
    }));

  // 실무경력 정리
  const validWelfare = welfareExperiences
    .filter(
      (x) =>
        x.organization ||
        x.role ||
        x.start_date ||
        x.end_date ||
        x.description
    )
    .map((x) => ({
      instructor_id,
      organization: x.organization || "",
      role: x.role || "",
      start_date: x.start_date || null,
      end_date: x.end_date || null,
      description: x.description || "",
    }));

  // 강의경력 정리
  const validLectures = lectureExperiences
    .filter(
      (x) =>
        x.organization ||
        x.target ||
        x.topic ||
        x.start_date ||
        x.end_date ||
        x.count
    )
    .map((x) => ({
      instructor_id,
      organization: x.organization || "",
      target: x.target || "",
      topic: x.topic || "",
      start_date: x.start_date || null,
      end_date: x.end_date || null,
      count: x.count || "",
    }));

  // 양성과정 저장
  if (validTrainings.length) {
    const { error } = await supabase
      .from("training_courses")
      .insert(validTrainings);

    if (error) {
      throw new Error(
        "양성과정 저장 오류: " + error.message
      );
    }
  }

  // 실무경력 저장
  if (validWelfare.length) {
    const { error } = await supabase
      .from("welfare_experiences")
      .insert(validWelfare);

    if (error) {
      throw new Error(
        "실무경력 저장 오류: " + error.message
      );
    }
  }

  // 강의경력 저장
  if (validLectures.length) {
    const { error } = await supabase
      .from("lecture_experiences")
      .insert(validLectures);

    if (error) {
      throw new Error(
        "강의경력 저장 오류: " + error.message
      );
    }
  }

  return {
    success: true,
    instructor_id,
  };
}
