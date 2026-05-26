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

  // 이메일 형식 검사
  if (!isValidEmail(form.email)) {

    setError(
      "이메일은 이메일@도메인.com 형식으로 입력해 주세요."
    );

    scrollToTop();
    return;
  }

  // 전화번호 형식 검사
  if (!isValidPhone(form.phone)) {

    setError(
      "전화번호는 00-0000-0000 또는 010-0000-0000 형식으로 입력해 주세요."
    );

    scrollToTop();
    return;
  }

  // 비밀번호 길이 검사
  if (password.length < 8) {

    setError(
      "비밀번호는 8자 이상 입력해 주세요."
    );

    scrollToTop();
    return;
  }

  // 자격증 날짜 검사
  for (const cert of certificates) {

    // 빈 자격증은 무시
    const isEmpty =
      !cert.name &&
      !cert.organization &&
      !cert.acquired_date &&
      !cert.expire_date;

    if (isEmpty) {
      continue;
    }

    // 필수값 검사
    if (
      !cert.name ||
      !cert.organization ||
      !cert.acquired_date
    ) {

      setError(
        "자격증명, 발급기관, 취득일은 필수입니다."
      );

      scrollToTop();
      return;
    }

    // 만료일 검사
    if (
      cert.expire_date &&
      cert.expire_date < cert.acquired_date
    ) {

      setError(
        `자격증 '${cert.name}'의 만료일은 취득일보다 빠를 수 없습니다.`
      );

      scrollToTop();
      return;
    }
  }

  // 최종 확인
  if (
    !window.confirm(
      "입력한 내용으로 강사 등록을 신청하시겠습니까?"
    )
  ) {
    return;
  }

  try {

    // 회원가입
    const {
      data: authData,
      error: authError
    } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password
    });

    if (authError) {
      if (
        authError.message?.includes(
          "User already registered"
        )
      ) {
        throw new Error(
          "이미 가입된 이메일입니다. 로그인 후 이용해 주세요."
        );
      }
      throw new Error(authError.message);
    }

    // 강사 등록
    await registerInstructor({

      form: {
        ...form,
        auth_user_id: authData.user.id
      },

      trainingCourses,
      welfareExperiences,
      lectureExperiences,
      certificates
    });

    window.alert(
      "등록 신청이 완료되었습니다. 관리자 검토 후 공개됩니다."
    );

    // 초기화
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
  
    // 회원가입만 되고
    // 등록 실패한 경우 로그아웃 처리
    await supabase.auth.signOut();
  
    setError(
      err.message ||
      "등록 중 오류가 발생했습니다."
    );
  
    scrollToTop();
  }
}
