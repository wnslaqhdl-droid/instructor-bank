import {
  isValidEmail,
  isValidPhone
} from "./validators";

import {
  submitInstructorUpdateRequest
} from "../services/instructorService";

import { uploadProfileImage } from "./uploadProfileImage";

export default async function submitModifyRequest({

  found,

  modifyTrainings,
  modifyWelfares,
  modifyLectures,
  modifyCertificates,

  originalInstructor,
  originalTrainings,
  originalWelfares,
  originalLectures,
  originalCertificates,

  setError,
  setMessage,
  setFound,
  setEmail,

  monthToDate,
  getCurrentMonthKST,

  scrollToTop
}) {

  function normalizeValue(value){

    if(
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return value;
  }

  function isChangedValue(
    oldValue,
    newValue
  ) {

    return JSON.stringify(
      normalizeValue(oldValue)
    ) !== JSON.stringify(
      normalizeValue(newValue)
    );
  }

  setError("");
  setMessage("");

  if(
    !isValidEmail(found.email)
  ){

    setError(
      "이메일은 이메일@도메인.com 형식으로 입력해 주세요."
    );

    scrollToTop();
    return;
  }

  if(
    !isValidPhone(found.phone)
  ){

    setError(
      "전화번호는 00-0000-0000, 000-0000-0000 또는 010-0000-0000 형식으로 입력해 주세요."
    );

    scrollToTop();
    return;
  }

  const payload = {

    instructor: {
      ...found
    },

    training_courses:
      modifyTrainings,

    welfare_experiences:
      modifyWelfares,

    lecture_experiences:
      modifyLectures,

    certificates:
      modifyCertificates
  };

  const hasInstructorChange = [

    isChangedValue(
      originalInstructor?.name,
      found.name
    ),

    isChangedValue(
      originalInstructor?.phone,
      found.phone
    ),

    isChangedValue(
      originalInstructor?.email,
      found.email
    ),

    isChangedValue(
      originalInstructor?.region,
      found.region
    ),

    isChangedValue(
      originalInstructor?.activity_regions,
      found.activity_regions
    ),

    isChangedValue(
      originalInstructor?.organization,
      found.organization
    ),

    isChangedValue(
      originalInstructor?.position,
      found.position
    ),

    isChangedValue(
      originalInstructor?.main_topic,
      found.main_topic
    ),

    isChangedValue(
      originalInstructor?.specialties,
      found.specialties
    ),

    isChangedValue(
      originalInstructor?.other_specialty,
      found.other_specialty
    ),

    isChangedValue(
      originalInstructor?.targets,
      found.targets
    ),

    isChangedValue(
      originalInstructor?.types,
      found.types
    ),

    isChangedValue(
      originalInstructor?.intro,
      found.intro
    ),

    isChangedValue(
      originalInstructor?.show_phone,
      found.show_phone
    ),

    isChangedValue(
      originalInstructor?.show_email,
      found.show_email
    ),

    isChangedValue(
      originalInstructor?.show_profile,
      found.show_profile
    ),

    isChangedValue(
      originalInstructor?.center_verified,
      found.center_verified
    )

  ].some(Boolean);

  const hasAnyChange =

    hasInstructorChange ||

    isChangedValue(
      originalTrainings,
      modifyTrainings
    ) ||

    isChangedValue(
      originalWelfares,
      modifyWelfares
    ) ||

    isChangedValue(
      originalLectures,
      modifyLectures
    ) ||

    isChangedValue(
      originalCertificates,
      modifyCertificates
    );

  if(!hasAnyChange){

    setError(
      "변경된 항목이 없습니다. 수정 후 다시 제출해 주세요."
    );

    scrollToTop();
    return;
  }

  if(
    !window.confirm(
      "수정 요청을 제출하시겠습니까?"
    )
  ){
    return;
  }

  console.log(
    "수정요청 payload",
    payload
  );

  try {

    if(found.profile_image_file){
      const profileImageUrl =
        await uploadProfileImage(
          found.profile_image_file,
          found.id,
          originalInstructor?.profile_image
        );
      payload.instructor.profile_image =
        profileImageUrl;
    }

    await submitInstructorUpdateRequest(
      found.id,
      payload
    );

    window.alert(
      "수정 요청이 접수되었습니다. 관리자 검토 후 반영됩니다."
    );

    setFound(null);
    setEmail("");

    scrollToTop();

  } catch (err) {

    setError(
      err.message
    );

    scrollToTop();
  }
}
