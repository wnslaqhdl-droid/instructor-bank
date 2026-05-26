import {
  isValidEmail,
  isValidPhone
} from "./validators";

import {
  submitInstructorUpdateRequest
} from "../services/instructorService";

import { uploadProfileImage } from "./uploadProfileImage";
import { uploadCertificateAttachment } from "./uploadCertificateAttachment";
import { uploadExperienceAttachment } from "./uploadExperienceAttachment";

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

  function normalizeValue(value) {
    if (
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

  if (!isValidEmail(found.email)) {
    setError(
      "이메일은 이메일@도메인.com 형식으로 입력해 주세요."
    );
    scrollToTop();
    return;
  }

  if (!isValidPhone(found.phone)) {
    setError(
      "전화번호는 00-0000-0000, 000-0000-0000 또는 010-0000-0000 형식으로 입력해 주세요."
    );
    scrollToTop();
    return;
  }

  const hasInstructorChange = [
    isChangedValue(originalInstructor?.name, found.name),
    isChangedValue(originalInstructor?.phone, found.phone),
    isChangedValue(originalInstructor?.email, found.email),
    isChangedValue(originalInstructor?.region, found.region),
    isChangedValue(originalInstructor?.activity_regions, found.activity_regions),
    isChangedValue(originalInstructor?.organization, found.organization),
    isChangedValue(originalInstructor?.position, found.position),
    isChangedValue(originalInstructor?.main_topic, found.main_topic),
    isChangedValue(originalInstructor?.specialties, found.specialties),
    isChangedValue(originalInstructor?.other_specialty, found.other_specialty),
    isChangedValue(originalInstructor?.targets, found.targets),
    isChangedValue(originalInstructor?.types, found.types),
    isChangedValue(originalInstructor?.intro, found.intro),
    isChangedValue(originalInstructor?.show_phone, found.show_phone),
    isChangedValue(originalInstructor?.show_email, found.show_email),
    isChangedValue(originalInstructor?.show_profile, found.show_profile),
    isChangedValue(originalInstructor?.center_verified, found.center_verified)
  ].some(Boolean);

  const hasAnyChange =
    hasInstructorChange ||
    isChangedValue(originalTrainings, modifyTrainings) ||
    isChangedValue(originalWelfares, modifyWelfares) ||
    isChangedValue(originalLectures, modifyLectures) ||
    isChangedValue(originalCertificates, modifyCertificates);

  if (!hasAnyChange) {
    setError(
      "변경된 항목이 없습니다. 수정 후 다시 제출해 주세요."
    );
    scrollToTop();
    return;
  }

  if (
    !window.confirm(
      "수정 요청을 제출하시겠습니까?"
    )
  ) {
    return;
  }

  try {
    let profileImageUrl =
      found.profile_image || "";

    if (found.profile_image_file) {
      profileImageUrl =
        await uploadProfileImage(
          found.profile_image_file,
          found.id,
          found.profile_image
        );
    }

    const processedCertificates = [];

    for (const cert of modifyCertificates) {
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
            found.id,
            cert.attachment_url
          );
      }

      processedCertificates.push({
        name: cert.name || "",
        organization: cert.organization || "",
        acquired_date: cert.acquired_date || null,
        expire_date: cert.expire_date || null,
        is_public: !!cert.is_public,
        attachment_url: attachmentUrl
      });
    }

    const processedWelfares = [];

    for (const w of modifyWelfares) {
      const isValid =
        w.organization ||
        w.role ||
        w.start_date ||
        w.end_date ||
        w.description;

      if (!isValid) {
        continue;
      }

      let attachmentUrl =
        w.attachment_url || null;

      if (w.attachment_file) {
        attachmentUrl =
          await uploadExperienceAttachment(
            w.attachment_file,
            found.id,
            w.attachment_url
          );
      }

      processedWelfares.push({
        organization: w.organization || "",
        role: w.role || "",
        start_date: w.start_date || null,
        end_date: w.end_date || null,
        description: w.description || "",
        is_current: !!w.is_current,
        attachment_url: attachmentUrl
      });
    }

    const processedLectures = [];

    for (const l of modifyLectures) {
      const isValid =
        l.organization ||
        l.target ||
        l.topic ||
        l.start_date ||
        l.end_date ||
        l.count;

      if (!isValid) {
        continue;
      }

      let attachmentUrl =
        l.attachment_url || null;

      if (l.attachment_file) {
        attachmentUrl =
          await uploadExperienceAttachment(
            l.attachment_file,
            found.id,
            l.attachment_url
          );
      }

      processedLectures.push({
        organization: l.organization || "",
        target: l.target || "",
        topic: l.topic || "",
        start_date: l.start_date || null,
        end_date: l.end_date || null,
        count: l.count || "",
        is_current: !!l.is_current,
        attachment_url: attachmentUrl
      });
    }

    const safeInstructor = {
      ...found,
      profile_image: profileImageUrl
    };

    delete safeInstructor.profile_image_file;

    const payload = {
      instructor: safeInstructor,
      training_courses: modifyTrainings,
      welfare_experiences: processedWelfares,
      lecture_experiences: processedLectures,
      certificates: processedCertificates
    };

    console.log("수정요청 payload", payload);

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
