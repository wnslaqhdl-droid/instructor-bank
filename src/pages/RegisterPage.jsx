import {
  regionOptions,
  targetOptions,
  typeOptions,
  specialtyOptions,
  emptyInstructor,
  emptyTraining,
  emptyWelfare,
  emptyLecture
} from "../constants";

import { supabase } from "../supabase";
import {
  registerInstructor
} from "../services/instructorService";

import Field from "../components/Field";
import Repeater from "../components/Repeater";
import CheckboxGroup from "../components/CheckboxGroup";

import RegisterBasicInfo from "../components/RegisterBasicInfo";
import RegisterTrainingSection from "../components/RegisterTrainingSection";
import RegisterWelfareExperience from "../components/RegisterWelfareExperience";
import RegisterLectureExperience from "../components/RegisterLectureExperience";
import RegisterProfileSettings from "../components/RegisterProfileSettings";
import MonthSelect from "../components/MonthSelect";

import useRegisterForm from "../hooks/useRegisterForm";
import { clone } from "../utils/helpers";
import {
  getCurrentMonthKST,
  toMonthValue,
  monthToDate
} from "../utils/date";

export default function RegisterPage() {

  const {
    form,
    update,

    password,
    setPassword,

    trainingCourses,
    setTrainingCourses,

    welfareExperiences,
    setWelfareExperiences,

    lectureExperiences,
    setLectureExperiences,

    message,
    error,

    submitForm
      } = useRegisterForm({
        clone,
        emptyInstructor,
        emptyTraining,
        emptyWelfare,
        emptyLecture,
        supabase,
        registerInstructor
      });
  
  return (
    <div>

      {message ? (
        <div className="notice">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="error">
          {error}
        </div>
      ) : null}

      <RegisterBasicInfo
        form={form}
        update={update}
        password={password}
        setPassword={setPassword}
        regionOptions={regionOptions}
        Field={Field}
      />

      <RegisterTrainingSection
        trainingCourses={trainingCourses}
        setTrainingCourses={setTrainingCourses}
        emptyTraining={emptyTraining}
        Field={Field}
        Repeater={Repeater}
        clone={clone}
      />

      <RegisterWelfareExperience
        welfareExperiences={welfareExperiences}
        setWelfareExperiences={setWelfareExperiences}
        emptyWelfare={emptyWelfare}
        Field={Field}
        Repeater={Repeater}
        MonthSelect={MonthSelect}
        getCurrentMonthKST={getCurrentMonthKST}
        toMonthValue={toMonthValue}
        monthToDate={monthToDate}
        clone={clone}
      />

      <RegisterLectureExperience
        lectureExperiences={lectureExperiences}
        setLectureExperiences={setLectureExperiences}
        emptyLecture={emptyLecture}
        Field={Field}
        Repeater={Repeater}
        MonthSelect={MonthSelect}
        getCurrentMonthKST={getCurrentMonthKST}
        toMonthValue={toMonthValue}
        monthToDate={monthToDate}
        clone={clone}
      />

      <RegisterProfileSettings
        form={form}
        update={update}
        regionOptions={regionOptions}
        targetOptions={targetOptions}
        typeOptions={typeOptions}
        specialtyOptions={specialtyOptions}
        Field={Field}
        CheckboxGroup={CheckboxGroup}
        submitForm={submitForm}
      />

    </div>
  );
}
