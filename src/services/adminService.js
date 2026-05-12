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
