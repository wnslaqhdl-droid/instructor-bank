import { useEffect, useState } from "react";

export default function useModifyInstructor(
  supabase
) {

  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [found, setFound] =
    useState(null);

  const [latestRequest, setLatestRequest] =
    useState(null);

  const [modifyTrainings, setModifyTrainings] =
    useState([]);

  const [modifyWelfares, setModifyWelfares] =
    useState([]);

  const [modifyLectures, setModifyLectures] =
    useState([]);

  const [originalInstructor, setOriginalInstructor] =
    useState(null);

  const [originalTrainings, setOriginalTrainings] =
    useState([]);

  const [originalWelfares, setOriginalWelfares] =
    useState([]);

  const [originalLectures, setOriginalLectures] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    refreshSession();
  }, []);

  async function refreshSession() {

    const { data } =
      await supabase.auth.getSession();

    setSession(data.session);

    if (data.session) {
      await search(
        data.session.user.id
      );
    }

    setLoading(false);
  }

  async function search(userId) {

    setError("");
    setMessage("");

    const {
      data,
      error
    } = await supabase
      .from("instructors")
      .select("*")
      .eq(
        "auth_user_id",
        userId
      )
      .maybeSingle();

    if (error) {
      setError(
        "조회 실패: " +
        error.message
      );
      return;
    }

    if (!data) {
      setError(
        "해당 이메일로 등록된 강사를 찾을 수 없습니다."
      );
      return;
    }

    setOriginalInstructor(data);

    const {
      data: trainingData
    } = await supabase
      .from("training_courses")
      .select("*")
      .eq(
        "instructor_id",
        data.id
      );

    setOriginalTrainings(
      trainingData || []
    );

    const {
      data: welfareData
    } = await supabase
      .from("welfare_experiences")
      .select("*")
      .eq(
        "instructor_id",
        data.id
      );

    setOriginalWelfares(
      welfareData || []
    );

    const {
      data: lectureData
    } = await supabase
      .from("lecture_experiences")
      .select("*")
      .eq(
        "instructor_id",
        data.id
      );

    setOriginalLectures(
      lectureData || []
    );

    const {
      data: requestData
    } = await supabase
      .from(
        "instructor_update_requests"
      )
      .select("*")
      .eq(
        "instructor_id",
        data.id
      )
      .order(
        "requested_at",
        { ascending: false }
      )
      .limit(1)
      .maybeSingle();

    setLatestRequest(
      requestData || null
    );

    if (
      requestData &&
      (
        requestData.request_status === "검토중" ||
        requestData.request_status === "반려"
      ) &&
      requestData.requested_data?.instructor
    ) {

      setFound(
        requestData.requested_data.instructor
      );

      setModifyTrainings(
        requestData.requested_data.training_courses?.length
          ? requestData.requested_data.training_courses
          : (
              trainingData || []
            )
      );

      setModifyWelfares(
        (
          requestData.requested_data.welfare_experiences?.length
            ? requestData.requested_data.welfare_experiences
            : (
                welfareData || []
              )
        ).map((w) => ({
          ...w,
          is_current:
            !w.end_date
        }))
      );

      setModifyLectures(
        (
          requestData.requested_data.lecture_experiences?.length
            ? requestData.requested_data.lecture_experiences
            : (
                lectureData || []
              )
        ).map((l) => ({
          ...l,
          is_current:
            !l.end_date
        }))
      );

    } else {

      setFound(data);

      setModifyTrainings(
        trainingData || []
      );

      setModifyWelfares(
        (
          welfareData || []
        ).map((w) => ({
          ...w,
          is_current:
            !w.end_date
        }))
      );

      setModifyLectures(
        (
          lectureData || []
        ).map((l) => ({
          ...l,
          is_current:
            !l.end_date
        }))
      );
    }
  }

  return {
    session,
    loading,
    found,
    setFound,
    latestRequest,

    modifyTrainings,
    setModifyTrainings,

    modifyWelfares,
    setModifyWelfares,

    modifyLectures,
    setModifyLectures,

    originalInstructor,
    originalTrainings,
    originalWelfares,
    originalLectures,

    message,
    setMessage,

    error,
    setError
  };
}
