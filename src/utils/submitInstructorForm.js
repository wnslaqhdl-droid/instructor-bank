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
  certificates,

  supabase,
  registerInstructor,

  setError,
  setMessage,

  setForm,
  setTrainingCourses,
  setWelfareExperiences,
  setLectureExperiences,
  setCertificates,

  emptyInstructor,
  emptyTraining,
  emptyWelfare,
  emptyLecture,
  emptyCertificate,

  clone
}) {

  function scrollToTop() {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  setMessage("");
  setError("");

  // 필수값 검사
  if (!hasRequiredInstructorFields(form)) {

    setError(
      "성명, 연락처, 이메일, 거주지역, 주요 강의주제는 필수입니다."
    );

    scrollToTop();
    return;
  }

  // 이메일 검사
  if (!isValidEmail(form.email)) {

    setError(
      "이메일 형식이 올바르지 않습니다."
    );

    scrollToTop();
    return;
  }

  // 전화번호 검사
  if (!isValidPhone(form.phone)) {

    setError(
      "전화번호 형식이 올바르지 않습니다."
    );

    scrollToTop();
    return;
  }

  // 비밀번호 검사
  if (password.length < 8) {

    setError(
      "비밀번호는 8자 이상이어야 합니다."
    );

    scrollToTop();
    return;
  }

  // 최종 확인
  if (
    !window.confirm(
      "입력한 내용으로 강사 등록을 신청하시겠습니까?"
    )
  ) {
    return;
  }

  let authUserId = null;

  try {

    /*
      1.
      회원가입 먼저
    */

    const {
      data: authData,
      error: authError
    } = await supabase.auth.signUp({

      email:
        form.email
          .trim()
          .toLowerCase(),

      password
    });

    if (authError) {

      if (
        authError.message?.includes(
          "User already registered"
        )
      ) {

        throw new Error(
          "이미 가입된 이메일입니다."
        );
      }

      throw new Error(
        authError.message
      );
    }

    authUserId =
      authData.user.id;

    /*
      2.
      강사 등록
    */

    await registerInstructor({

      form: {
        ...form,
        auth_user_id:
          authUserId
      },

      trainingCourses,
      welfareExperiences,
      lectureExperiences,
      certificates
    });

    /*
      성공
    */

    window.alert(
      "등록 신청이 완료되었습니다."
    );

    setForm(
      clone(emptyInstructor)
    );

    setTrainingCourses([
      clone(emptyTraining)
    ]);

    setWelfareExperiences([
      clone(emptyWelfare)
    ]);

    setLectureExperiences([
      clone(emptyLecture)
    ]);

    setCertificates([
      clone(emptyCertificate)
    ]);

    setMessage(
      "등록 신청이 완료되었습니다."
    );

    scrollToTop();

  } catch (err) {

    /*
      실패 시
      auth 계정 제거
    */

    if (authUserId) {

      await supabase.auth.signOut();
    }

    setError(
      err.message ||
      "등록 중 오류가 발생했습니다."
    );

    scrollToTop();
  }
}
