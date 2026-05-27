import { supabase } from "../supabase";
import { uploadProfileImage } from "../utils/uploadProfileImage";
import { uploadCertificateAttachment } from "../utils/uploadCertificateAttachment";
import { uploadExperienceAttachment } from "../utils/uploadExperienceAttachment";
export async function registerInstructor({
  form,
  trainingCourses,
  welfareExperiences,
  lectureExperiences,
  certificates,
}) {

  const normalizedEmail =
    form.email
      .trim()
      .toLowerCase();

  // 이메일 중복 검사
  const {
    data: existingInstructor,
    error: duplicateCheckError
  } = await supabase
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

  // 로그인 사용자 확인: 제거됨
  

  // 강사 기본정보 저장
  const {
    profile_image_file,
    auth_user_id,
    ...safeForm
  } = form;
  
  const {
    data: inserted,
    error: insertError
  } = await supabase
    .from("instructors")
    .insert([
      {
        ...safeForm,
  
        email:
          normalizedEmail,
  
        public_status:
          "검토중",
  
        update_status:
          "정상",
      },
    ])
    .select("id")
    .single();
  if (insertError) {

    throw new Error(
      "강사 기본정보 저장 실패: " +
      insertError.message
    );

  }

  const instructor_id =
    inserted.id;

  // 프로필 이미지 업로드
  if(form.profile_image_file){
  
    const profileImageUrl =
      await uploadProfileImage(
        form.profile_image_file,
        instructor_id
      );
  
    const { error: imageUpdateError } =
      await supabase
        .from("instructors")
        .update({
          profile_image:
            profileImageUrl
        })
        .eq(
          "id",
          instructor_id
        );
  
    if(imageUpdateError){
  
      throw new Error(
        "프로필 이미지 저장 실패: " +
        imageUpdateError.message
      );
    }
  }

  // 양성과정 정리
  const validTrainings = [];
    for (const x of trainingCourses) {
      const isValid =
        x.course_name ||
        x.institution ||
        x.completion_year;
      if (!isValid) {
        continue;
      }
      let attachmentUrl =
        x.attachment_url || null;
      if (x.attachment_file) {
        attachmentUrl =
          await uploadExperienceAttachment(
            x.attachment_file,
            instructor_id,
            x.attachment_url
          );
      }
      validTrainings.push({
        instructor_id,
        course_name:
          x.course_name || "",
        institution:
          x.institution || "",
        completion_year:
          x.completion_year || "",
        attachment_url:
          attachmentUrl
      });
    }

  // 실무경력 정리
  const validWelfare = [];
    for (const x of welfareExperiences) {
      const isValid =
        x.organization ||
        x.role ||
        x.start_date ||
        x.end_date ||
        x.description;
      if (!isValid) {
        continue;
      }
      let attachmentUrl =
        x.attachment_url || null;
      if (x.attachment_file) {
        attachmentUrl =
          await uploadExperienceAttachment(
            x.attachment_file,
            instructor_id,
            x.attachment_url
          );
      }
      validWelfare.push({
        instructor_id,
        organization:
          x.organization || "",
        role:
          x.role || "",
        start_date:
          x.start_date || null,
        end_date:
          x.end_date || null,
        description:
          x.description || "",
        attachment_url:
          attachmentUrl
      });
    }

  // 강의경력 정리
  const validLectures = [];
    for (const x of lectureExperiences) {
      const isValid =
        x.organization ||
        x.target ||
        x.topic ||
        x.start_date ||
        x.end_date ||
        x.count;
      if (!isValid) {
        continue;
      }
      let attachmentUrl =
        x.attachment_url || null;
      if (x.attachment_file) {
        attachmentUrl =
          await uploadExperienceAttachment(
            x.attachment_file,
            instructor_id,
            x.attachment_url
          );
      }
      validLectures.push({
        instructor_id,
        organization:
          x.organization || "",
        target:
          x.target || "",
        topic:
          x.topic || "",
        start_date:
          x.start_date || null,
        end_date:
          x.end_date || null,
        count:
          x.count || "",
        attachment_url:
          attachmentUrl
      });
    }

  // 자격증 정리
  const validCertificates = [];
    
    for (const cert of certificates) {
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
            instructor_id,
            cert.attachment_url
          );
      }
      validCertificates.push({
        instructor_id,
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
    };

  // 양성과정 저장
  if (validTrainings.length) {

    const { error } =
      await supabase
        .from("training_courses")
        .insert(validTrainings);

    if (error) {

      throw new Error(
        "양성과정 저장 오류: " +
        error.message
      );

    }
  }

  // 실무경력 저장
  if (validWelfare.length) {

    const { error } =
      await supabase
        .from("welfare_experiences")
        .insert(validWelfare);

    if (error) {

      throw new Error(
        "실무경력 저장 오류: " +
        error.message
      );

    }
  }

  // 강의경력 저장
  if (validLectures.length) {

    const { error } =
      await supabase
        .from("lecture_experiences")
        .insert(validLectures);

    if (error) {

      throw new Error(
        "강의경력 저장 오류: " +
        error.message
      );

    }
  }

  // 자격증 저장
  if (validCertificates.length) {

    const { error } =
      await supabase
        .from("certificates")
        .insert(validCertificates);

    if (error) {

      throw new Error(
        "자격증 저장 오류: " +
        error.message
      );

    }
  }

  return {
    success: true,
    instructor_id,
    email: normalizedEmail
  };
}

export async function searchInstructors() {

  const {
    data,
    error
  } = await supabase
    .from("instructors")
    .select(`
      *,
      training_courses(*),
      welfare_experiences(*),
      lecture_experiences(*),
      certificates(*)
    `)
    .eq(
      "public_status",
      "공개"
    )
    .eq(
      "show_profile",
      true
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {

    throw new Error(
      "검색 실패: " +
      error.message
    );

  }

  return data || [];
}

export async function submitInstructorUpdateRequest(
  instructorId,
  payload
) {

  // 기존 검토중 요청 대체 처리
  const {
    error: replaceError
  } = await supabase
    .from(
      "instructor_update_requests"
    )
    .update({
      request_status:
        "대체됨",

      admin_memo:
        "강사가 수정 요청을 다시 제출하여 최신 요청으로 대체됨",

      reviewed_at:
        new Date()
          .toISOString(),
    })
    .eq(
      "instructor_id",
      instructorId
    )
    .eq(
      "request_status",
      "검토중"
    );

  if (replaceError) {

    throw new Error(
      "기존 요청 정리 실패: " +
      replaceError.message
    );

  }

  // 새 요청 생성
  const {
    error: insertError
  } = await supabase
    .from(
      "instructor_update_requests"
    )
    .insert([
      {
        instructor_id:
          instructorId,

        requested_data:
          payload,
      },
    ]);

  if (insertError) {

    throw new Error(
      "요청 실패: " +
      insertError.message
    );

  }

  return true;
}

export async function checkAdmin() {

  const {
    data: sessionData
  } =
    await supabase.auth.getSession();

  const user =
    sessionData?.session?.user;

  if (!user) return false;

  const {
    data,
    error
  } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {

    throw new Error(
      error.message
    );

  }

  return !!data;
}
