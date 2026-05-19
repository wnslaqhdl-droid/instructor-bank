import { useState } from "react";
import { submitInstructorForm } from "../utils/submitInstructorForm";

export default function useRegisterForm({
  clone,
  emptyInstructor,
  emptyTraining,
  emptyWelfare,
  emptyLecture,
  emptyCertificate,
  supabase,
  registerInstructor
}) {

  const [form, setForm] =
    useState(clone(emptyInstructor));

  const [trainingCourses,
    setTrainingCourses] =
    useState([clone(emptyTraining)]);

  const [welfareExperiences,
    setWelfareExperiences] =
    useState([clone(emptyWelfare)]);

  const [lectureExperiences,
    setLectureExperiences] =
    useState([clone(emptyLecture)]);

  const [certificates,
    setCertificates] = 
    useState([clone(emptyCertificate)]);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [password, setPassword] =
    useState("");

  const update = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value
    }));

  async function submitForm() {

    await submitInstructorForm({
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
    });

  }

  return {
    form,
    setForm,

    trainingCourses,
    setTrainingCourses,

    welfareExperiences,
    setWelfareExperiences,

    lectureExperiences,
    setLectureExperiences,

    certificates,
    setCertificates,

    message,
    error,

    password,
    setPassword,

    update,
    submitForm
  };
}
