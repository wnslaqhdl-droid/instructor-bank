import React, { useState } from "react";

import {
  regionOptions,
  targetOptions,
  typeOptions,
  specialtyOptions
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

export default function ModifyPage() {

}
