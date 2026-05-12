import { supabase } from "../supabase";

export async function getUpdateRequests() {
  const { data, error } = await supabase
    .from("instructor_update_requests")
    .select(`
      *,
      instructors(
        *,
        training_courses(*),
        welfare_experiences(*),
        lecture_experiences(*)
      )
    `)
    .order("requested_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      "수정 요청 조회 실패: " + error.message
    );
  }

  return data || [];
}
