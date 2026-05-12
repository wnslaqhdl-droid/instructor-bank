import { supabase } from "../supabase";

export async function updateInstructorStatus(id, status) {
  const { error } = await supabase
    .from("instructors")
    .update({ public_status: status })
    .eq("id", id);

  if (error) {
    throw new Error("상태 변경 실패: " + error.message);
  }

  return true;
}

export async function deleteInstructor(id) {
  const { error } = await supabase
    .from("instructors")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error("삭제 실패: " + error.message);
  }

  return true;
}

export async function applyUpdateRequest(req) {
  const requested = req.requested_data;
  const instructorData = requested.instructor || requested;

  // 기본정보 반영
  const { error: updateError } = await supabase
    .from("instructors")
    .update({
      name: instructorData.name,
      phone: instructorData.phone,
      email: instructorData.email,
      region: instructorData.region,
      activity_regions: instructorData.activity_regions,
      organization: instructorData.organization,
      position: instructorData.position,
      main_topic: instructorData.main_topic,
      specialties: instructorData.specialties,
      other_specialty: instructorData.other_specialty,
      targets: instructorData.targets,
      types: instructorData.types,
      intro: instructorData.intro,
      show_phone: instructorData.show_phone,
      show_email: instructorData.show_email,
      show_profile: instructorData.show_profile,
      center_verified: instructorData.center_verified,
    })
    .eq("id", req.instructor_id);

  if (updateError) {
    throw new Error("반영 실패: " + updateError.message);
  }

  // 양성과정 반영
  await supabase
    .from("training_courses")
    .delete()
    .eq("instructor_id", req.instructor_id);

  const trainings = req.requested_data.training_courses || [];

  if (trainings.length) {
    await supabase
      .from("training_courses")
      .insert(
        trainings.map((t) => ({
          instructor_id: req.instructor_id,
          course_name: t.course_name || "",
          institution: t.institution || "",
          completion_year: t.completion_year || "",
        }))
      );
  }

  // 실무경력 반영
  await supabase
    .from("welfare_experiences")
    .delete()
    .eq("instructor_id", req.instructor_id);

  const welfares =
    req.requested_data.welfare_experiences || [];

  if (welfares.length) {
    await supabase
      .from("welfare_experiences")
      .insert(
        welfares.map((w) => ({
          instructor_id: req.instructor_id,
          organization: w.organization || "",
          role: w.role || "",
          start_date: w.start_date || null,
          end_date: w.end_date || null,
          description: w.description || "",
        }))
      );
  }

  // 강의경력 반영
  await supabase
    .from("lecture_experiences")
    .delete()
    .eq("instructor_id", req.instructor_id);

  const lectures =
    req.requested_data.lecture_experiences || [];

  if (lectures.length) {
    await supabase
      .from("lecture_experiences")
      .insert(
        lectures.map((l) => ({
          instructor_id: req.instructor_id,
          organization: l.organization || "",
          target: l.target || "",
          topic: l.topic || "",
          start_date: l.start_date || null,
          end_date: l.end_date || null,
          count: l.count || "",
        }))
      );
  }

  // 요청 승인 처리
  const { error: statusError } = await supabase
    .from("instructor_update_requests")
    .update({
      request_status: "승인",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", req.id);

  if (statusError) {
    throw new Error(
      "상태 변경 실패: " + statusError.message
    );
  }

  return true;
}

export async function rejectUpdateRequest(req, reason) {
  const { error } = await supabase
    .from("instructor_update_requests")
    .update({
      request_status: "반려",
      admin_memo: reason,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", req.id);

  if (error) {
    throw new Error(
      "반려 처리 실패: " + error.message
    );
  }

  return true;
}
