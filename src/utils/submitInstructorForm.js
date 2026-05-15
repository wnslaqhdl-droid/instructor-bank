import {
  hasRequiredInstructorFields,
  isValidEmail,
  isValidPhone
} from "./validators";

export async function submitInstructorForm({
  form,
  password,
  trainingCourses,
  welfareExperiences,
  lectureExperiences,
  supabase,
  registerInstructor,
  setError,
  setMessage,
  setForm,
  setTrainingCourses,
  setWelfareExperiences,
  setLectureExperiences,
  emptyInstructor,
  emptyTraining,
  emptyWelfare,
  emptyLecture,
  clone
}) {

  function scrollToTop() {
    window.scrollTo({ top: 0 });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  setMessage("");
  setError("");

  if (!hasRequiredInstructorFields(form)) {
    setError("성명, 연락처, 이메일, 거주지역, 주요 강의주제는 필수입니다.");
    scrollToTop();
    return;
  }

  if (!isValidEmail(form.email)) {
    setError("이메일은 이메일@도메인.com 형식으로 입력해 주세요.");
    scrollToTop();
    return;
  }

  if (!isValidPhone(form.phone)) {
    setError(
      "전화번호는 00-0000-0000 또는 010-0000-0000 형식으로 입력해 주세요."
    );
    scrollToTop();
    return;
  }

  if (password.length < 8) {
    setError("비밀번호는 8자 이상 입력해 주세요.");
    scrollToTop();
    return;
  }

  if (
    !window.confirm(
      "입력한 내용으로 강사 등록을 신청하시겠습니까?"
    )
  ) {
    return;
  }

  try {

    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: form.email,
        password
      });

    if (authError) {
      throw new Error(authError.message);
    }

    await registerInstructor({
      form: {
        ...form,
        auth_user_id: authData.user.id
      },
      trainingCourses,
      welfareExperiences,
      lectureExperiences,
    });

    window.alert(
      "등록 신청이 완료되었습니다. 관리자 검토 후 공개됩니다."
    );

    setForm(clone(emptyInstructor));
    setTrainingCourses([clone(emptyTraining)]);
    setWelfareExperiences([clone(emptyWelfare)]);
    setLectureExperiences([clone(emptyLecture)]);

    scrollToTop();

  } catch (err) {

    setError(err.message);
    scrollToTop();

  }
}
