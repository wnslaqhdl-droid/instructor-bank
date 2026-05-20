import React, { useState } from "react";

import Field from "../components/Field";
import MonthSelect from "../components/MonthSelect";
import CheckboxGroup from "../components/CheckboxGroup";

import {
  regionOptions,
  targetOptions,
  typeOptions,
  specialtyOptions,
  emptyCertificate
} from "../constants";

import { supabase } from "../supabase";

import {
  getCurrentMonthKST,
  toMonthValue,
  monthToDate
} from "../utils/date";

import useModifyInstructor from "../hooks/useModifyInstructor";
import submitModifyRequest from "../utils/submitModifyRequest";

import ModifyRequestStatus from "../components/ModifyRequestStatus";
import ModifyBasicInfo from "../components/ModifyBasicInfo";
import ModifyTrainingSection from "../components/ModifyTrainingSection";
import ModifyWelfareSection from "../components/ModifyWelfareSection";
import ModifyLectureSection from "../components/ModifyLectureSection";

import RegisterCertificateSection
  from "../components/RegisterCertificateSection";

import Repeater from "../components/Repeater";

import { clone } from "../utils/helpers";

export default function ModifyPage() {

  const [email,setEmail] =
    useState("");

  const [certificates,
    setCertificates] =
    useState([
      clone(emptyCertificate)
    ]);

  const {
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
  } = useModifyInstructor(
    supabase
  );

  function normalizeValue(value){

    if(
      value === null ||
      value === undefined
    ) return "";

    return value;
  }

  function isChangedValue(
    oldValue,
    newValue
  ){

    return JSON.stringify(
      normalizeValue(oldValue)
    ) !== JSON.stringify(
      normalizeValue(newValue)
    );
  }

  async function submitRequest(){

    function scrollToTop(){

      window.scrollTo({
        top: 0
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    await submitModifyRequest({

      found,

      modifyTrainings,
      modifyWelfares,
      modifyLectures,
      certificates,

      originalInstructor,
      originalTrainings,
      originalWelfares,
      originalLectures,

      setError,
      setMessage,
      setFound,
      setEmail,

      monthToDate,
      getCurrentMonthKST,

      scrollToTop
    });
  }

  function updateField(
    key,
    value
  ){

    setFound(
      prev => ({
        ...prev,
        [key]: value
      })
    );
  }

  function formatKST(value){

    if(!value) return "-";

    const dateValue =
      String(value).endsWith("Z")
        ? value
        : String(value) + "Z";

    return new Date(dateValue)
      .toLocaleString(
        "ko-KR",
        {
          timeZone:
            "Asia/Seoul",

          year:
            "numeric",

          month:
            "2-digit",

          day:
            "2-digit",

          hour:
            "2-digit",

          minute:
            "2-digit"
        }
      );
  }

  if(loading){

    return (
      <div className="card">
        불러오는 중...
      </div>
    );
  }

  if(!session){

    return (
      <section className="card">

        <h2>
          강사 로그인 필요
        </h2>

        <p>
          정보 수정 요청은 로그인 후 이용 가능합니다.
        </p>

      </section>
    );
  }

  return (
    <div>

      <section className="hero">

        <h1>
          강사 정보 수정 요청
        </h1>

        <p>
          등록 시 입력한 이메일로 본인 정보를 조회하고 수정 요청을 제출할 수 있습니다.
          이미 검토 중인 수정 요청이 있는 경우,
          다시 제출하면 이전 요청은 최신 요청으로 대체됩니다.
        </p>

      </section>

      {message && (
        <div className="notice">
          {message}
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <ModifyRequestStatus
        latestRequest={latestRequest}
        formatKST={formatKST}
      />

      {found && (

        <section className="card">

          <ModifyBasicInfo
            found={found}
            updateField={updateField}
            regionOptions={regionOptions}
            targetOptions={targetOptions}
            typeOptions={typeOptions}
            specialtyOptions={specialtyOptions}
            Field={Field}
            CheckboxGroup={CheckboxGroup}
          />

          <ModifyTrainingSection
            modifyTrainings={modifyTrainings}
            setModifyTrainings={setModifyTrainings}
            Field={Field}
          />

          <ModifyWelfareSection
            modifyWelfares={modifyWelfares}
            setModifyWelfares={setModifyWelfares}
            Field={Field}
            MonthSelect={MonthSelect}
            getCurrentMonthKST={getCurrentMonthKST}
            toMonthValue={toMonthValue}
            monthToDate={monthToDate}
          />

          <ModifyLectureSection
            modifyLectures={modifyLectures}
            setModifyLectures={setModifyLectures}
            Field={Field}
            MonthSelect={MonthSelect}
            getCurrentMonthKST={getCurrentMonthKST}
            toMonthValue={toMonthValue}
            monthToDate={monthToDate}
          />

          <RegisterCertificateSection
            certificates={certificates}
            setCertificates={setCertificates}
            emptyCertificate={emptyCertificate}
            Field={Field}
            Repeater={Repeater}
            clone={clone}
          />

          <div style={{marginTop:16}}>

            <button
              className="btn primary"
              onClick={submitRequest}
            >
              수정 요청 제출
            </button>

          </div>

        </section>
      )}

    </div>
  );
}
