import React, {
  useEffect,
  useState,
  useMemo
} from "react";

import { createRoot } from "react-dom/client";
import { supabase } from "./supabase";

import "./styles.css";


// constants
import {
  regionOptions,
  targetOptions,
  typeOptions,
  specialtyOptions,
  emptyInstructor,
  emptyTraining,
  emptyWelfare,
  emptyLecture
} from "./constants";


// services
import {
  registerInstructor,
  searchInstructors,
  submitInstructorUpdateRequest,
  checkAdmin
} from "./services/instructorService";

import {
  updateInstructorStatus,
  deleteInstructor,
  applyUpdateRequest,
  rejectUpdateRequest,
  getAdminInstructors
} from "./services/adminService";

import {
  getUpdateRequests
} from "./services/requestService";


// hooks
import useRegisterForm from "./hooks/useRegisterForm";
import useSearchPage from "./hooks/useSearchPage";
import ModifyPage from "./pages/ModifyPage";
import useModifyInstructor from "./hooks/useModifyInstructor";
import RegisterPage from "./pages/RegisterPage";


// utils
import {
  isValidEmail,
  isValidPhone,
  hasRequiredInstructorFields
} from "./utils/validators";

import {
  getCurrentMonthKST,
  toMonthValue,
  monthToDate,
  formatMonth,
  formatPeriod
} from "./utils/date";

import {
  submitInstructorForm
} from "./utils/submitInstructorForm";

import {
  filterAndSortInstructors
} from "./utils/searchFilters";

import submitModifyRequest from "./utils/submitModifyRequest";
import { clone } from "./utils/helpers";


// components
import InstructorCard from "./components/InstructorCard";
import Pagination from "./components/Pagination";
import SearchFilters from "./components/SearchFilters";
import ActiveFilters from "./components/ActiveFilters";

import RegisterBasicInfo from "./components/RegisterBasicInfo";
import RegisterTrainingSection from "./components/RegisterTrainingSection";
import RegisterWelfareExperience from "./components/RegisterWelfareExperience";
import RegisterLectureExperience from "./components/RegisterLectureExperience";
import RegisterProfileSettings from "./components/RegisterProfileSettings";

import ModifyRequestStatus from "./components/ModifyRequestStatus";
import ModifyBasicInfo from "./components/ModifyBasicInfo";
import ModifyTrainingSection from "./components/ModifyTrainingSection";
import ModifyWelfareSection from "./components/ModifyWelfareSection";
import ModifyLectureSection from "./components/ModifyLectureSection";

import Repeater from "./components/Repeater";
import Field from "./components/Field";
import MonthSelect from "./components/MonthSelect";
import CheckboxGroup from "./components/CheckboxGroup";

function SearchPage() {

  const {
    keyword,
    setKeyword,
    region,
    setRegion,
    target,
    setTarget,
    type,
    setType,
    specialty,
    setSpecialty,
    message,
    openId,
    openBadgeId,
    setOpenBadgeId,
    sortType,
    setSortType,
    onlyVerified,
    setOnlyVerified,
    currentPage,
    setCurrentPage,
    loading,
    filtered,
    paginatedItems,
    totalPages,
    toggleDetail
  } = useSearchPage({
    searchInstructors
  });
  
  return (
    <div>

      <section className="hero">
        <h1>성인권 교육 강사 검색</h1>

        <p>
          공개 승인된 강사를 지역,
          교육대상, 교육유형,
          강의 분야로 검색합니다.
        </p>
      </section>

      {message ? (
        <div className="error">
          {message}
        </div>
      ) : null}

      <SearchFilters
        keyword={keyword}
        setKeyword={setKeyword}
        region={region}
        setRegion={setRegion}
        target={target}
        setTarget={setTarget}
        type={type}
        setType={setType}
        specialty={specialty}
        setSpecialty={setSpecialty}
        sortType={sortType}
        setSortType={setSortType}
        onlyVerified={onlyVerified}
        setOnlyVerified={setOnlyVerified}
        regionOptions={regionOptions}
        targetOptions={targetOptions}
        typeOptions={typeOptions}
        specialtyOptions={specialtyOptions}
        Field={Field}
      />

      <div className="list">

        <div
          className="muted small"
          style={{ marginBottom: 8 }}
        >
          검색 결과: 총 {filtered.length}명
        </div>

        <div
          className="muted small"
          style={{ marginBottom: 8 }}
        >
          정렬 기준:
          {" "}
          {sortType === "latest"
            ? "최신순"
            : sortType === "name"
            ? "이름순"
            : "지역순"}
        </div>

        <ActiveFilters
          region={region}
          setRegion={setRegion}
          target={target}
          setTarget={setTarget}
          type={type}
          setType={setType}
          specialty={specialty}
          setSpecialty={setSpecialty}
          onlyVerified={onlyVerified}
          setOnlyVerified={setOnlyVerified}
        />

        <div className="compact-row header-row">

          <span className="compact-name">
            이름
          </span>

          <span>
            주요 강의주제
          </span>

          <span className="col-region">
            활동지역
          </span>

          <span className="col-target">
            교육대상
          </span>

          <span className="col-type">
            교육유형
          </span>

        </div>

        {loading && (
          <div className="skeleton-list">

            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton-card"
              />
            ))}

          </div>
        )}

        {!loading &&
          filtered.length === 0 && (
            <div className="card muted">
              검색 결과가 없습니다.
            </div>
          )
        }

        {!loading &&
          paginatedItems.map((item) => (
            <InstructorCard
              key={item.id}
              item={item}
              openId={openId}
              openBadgeId={openBadgeId}
              toggleDetail={toggleDetail}
              setOpenBadgeId={setOpenBadgeId}
              formatPeriod={formatPeriod}
            />
          ))
        }

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

      </div>

    </div>
  );
}

function AdminPage(){
  const [session,setSession]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [loadingAdmin,setLoadingAdmin]=useState(true);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [items,setItems]=useState([]);
  const [message,setMessage]=useState("");
  const [editingItem,setEditingItem]=useState(null);
  const [editingTrainings, setEditingTrainings] = useState([]);
  const [editingWelfares, setEditingWelfares] = useState([]);
  const [editingLectures, setEditingLectures] = useState([]);
  const [adminKeyword,setAdminKeyword]=useState("");
  const [adminStatus,setAdminStatus]=useState("");
  const [updateRequests,setUpdateRequests] = useState([]);
  const [openRequestId,setOpenRequestId]=useState(null);
  const [requestStatusFilter,setRequestStatusFilter]=useState("");
  const [adminPage, setAdminPage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const adminItemsPerPage = 10;
  const requestItemsPerPage = 10;
  
  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
  
    if (!session) return false;
  
    const { data, error } = await supabase
      .from("admin_users")
      .select("email")
      .eq("email", session.user.email)
      .maybeSingle();
  
    if (error) {
      throw new Error("관리자 권한 확인 실패");
    }
  
    return !!data;
  }
  
  async function refreshSession() {
    const { data } = await supabase.auth.getSession();
  
    setSession(data.session);
  
    if (data.session) {
      try {
        const admin = await checkAdmin();
  
        setIsAdmin(admin);
      } catch (err) {
        setMessage(err.message);
      }
    } else {
      setIsAdmin(false);
    }
  
    setLoadingAdmin(false);
  }
  
  useEffect(()=>{
    refreshSession()
  },[]);
  
  if (loadingAdmin) {
    return <div className="card">확인 중...</div>;
  }
  
  if (session && !isAdmin) {
    return (
      <div className="card">
        관리자 권한이 없습니다.
      </div>
    );
  }

  async function login(){
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error)window.alert("로그인 실패: "+error.message);
    else{window.alert("로그인 완료"); refreshSession();}
  }

  async function logout(){
    await supabase.auth.signOut();
  
    setSession(null);
    setIsAdmin(false);
  
    setItems([]);
    setUpdateRequests([]);
  
    setEditingItem(null);
  
    window.alert("로그아웃 완료");
  }

  async function loadAdmin() {
    if (!session || !isAdmin) {
      setMessage("관리자만 접근 가능합니다.");
      return;
    }
  
    try {
      const data = await getAdminInstructors();
  
      setItems(data);
    } catch (err) {
      setMessage(err.message);
    }
  }

   function formatKST(value){
      if(!value) return "-";
    
      const dateValue = String(value).endsWith("Z")
        ? value
        : String(value) + "Z";
    
      return new Date(dateValue).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  
async function loadRequests() {
  if (!session || !isAdmin) {
    setMessage("관리자만 접근 가능합니다.");
    return;
  }

  try {
    const data = await getUpdateRequests();

    setUpdateRequests(data);
  } catch (err) {
    setMessage(err.message);
  }
}
 
async function approveRequest(req) {
  if (openRequestId !== req.id) {
    setMessage("먼저 상세 내용을 확인한 후 승인해 주세요.");
    setOpenRequestId(req.id);
    return;
  }

  if (
    !window.confirm(
      "이 수정 요청을 승인하고 실제 강사 정보에 반영하시겠습니까?"
    )
  ) 
  {return;} 

  setMessage("");

  try {
    await applyUpdateRequest(req);

    window.alert("수정 요청 반영 완료");

    loadRequests();
    loadAdmin();
  } 
  catch (err) {
    window.alert(err.message);
  }
}

  
function isChanged(oldValue, newValue){
  return JSON.stringify(oldValue ?? "") !== JSON.stringify(newValue ?? "");
}

function renderChangedField(label, oldValue, newValue){
  if(!isChanged(oldValue, newValue)) return null;

  return (
    <div className="change-item">
      <b>{label}</b><br/>
      기존: {Array.isArray(oldValue) ? oldValue.join(", ") : (oldValue || "-")}<br/>
      요청: <span className="changed-value">
        {Array.isArray(newValue) ? newValue.join(", ") : (newValue || "-")}
      </span>
    </div>
  );
}

function renderChangedList(label, oldList, newList, renderItem){
  const oldValue = oldList || [];
  const newValue = newList || [];

  if(!isChanged(oldValue, newValue)) return null;

  return (
    <div className="change-item">
      <b>{label}</b><br/>

      <div className="muted small">기존</div>
      {oldValue.length ? oldValue.map((item, i)=>(
        <div key={`old-${i}`}>{renderItem(item)}</div>
      )) : "-"}

      <div className="muted small" style={{marginTop:6}}>요청</div>
      <div className="changed-value">
        {newValue.length ? newValue.map((item, i)=>(
          <div key={`new-${i}`}>{renderItem(item)}</div>
        )) : "-"}
      </div>
    </div>
  );
}  
  
async function rejectRequest(req){
  const reason = window.prompt("반려 사유를 입력하세요.");

  if(reason === null) return;

  const { error } = await supabase
    .from("instructor_update_requests")
    .update({
      request_status: "반려",
      admin_memo: reason,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", req.id);

  if(error){
    window.alert("반려 처리 실패: " + error.message);
    return;
  }

  window.alert("수정 요청을 반려 처리했습니다.");
  loadRequests();
}
  
async function updateStatus(id, status) {
  try {
    await updateInstructorStatus(id, status);

    window.alert(`${status} 처리 완료`);
    loadAdmin();
  } catch (err) {
    window.alert(err.message);
  }
}

async function deleteItem(id) {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    await deleteInstructor(id);

    window.alert("삭제 완료");
    loadAdmin();
  } catch (err) {
    window.alert(err.message);
  }
}

  async function startEdit(item){
  setEditingItem({
    ...item,
    activity_regions:item.activity_regions||[],
    targets:item.targets||[],
    types:item.types||[],
    specialties:item.specialties||[],
    show_phone:!!item.show_phone,
    show_email:!!item.show_email,
    show_profile:!!item.show_profile
  });

  const { data } = await supabase
    .from("training_courses")
    .select("*")
    .eq("instructor_id", item.id);

  setEditingTrainings(data || []);

  const { data: welfareData } = await supabase
    .from("welfare_experiences")
    .select("*")
    .eq("instructor_id", item.id);
    
  setEditingWelfares((welfareData || []).map((w)=>({
    ...w,
    is_current: !w.end_date
  })));
    

    const { data: lectureData } = await supabase
  .from("lecture_experiences")
  .select("*")
  .eq("instructor_id", item.id);

    setEditingLectures((lectureData || []).map((l)=>({
      ...l,
      is_current: !l.end_date
    })));
}

  function updateEdit(key,value){
    setEditingItem(current=>({...current,[key]:value}));
  }

  async function saveEdit(){
    
    if(!isValidEmail(editingItem.email)){
      setMessage("이메일은 이메일@도메인.com 형식으로 입력해 주세요.");
      return;
    }
    
    if(!isValidPhone(editingItem.phone)){
      setMessage("전화번호는 00-0000-0000, 000-0000-0000 또는 010-0000-0000 형식으로 입력해 주세요.");
      return;
    }
    const {error}=await supabase
      .from("instructors")
      .update({
        name:editingItem.name,
        phone:editingItem.phone,
        email:editingItem.email,
        region:editingItem.region,
        activity_regions:editingItem.activity_regions,
        organization:editingItem.organization,
        position:editingItem.position,
        main_topic:editingItem.main_topic,
        specialties:editingItem.specialties,
        other_specialty:editingItem.other_specialty,
        targets:editingItem.targets,
        types:editingItem.types,
        intro:editingItem.intro,
        show_phone:editingItem.show_phone,
        show_email:editingItem.show_email,
        show_profile:editingItem.show_profile,
        center_verified:editingItem.center_verified
      })
      .eq("id",editingItem.id);

    if(error)setMessage("수정 실패: "+error.message);
    else{
            /* 🔥 양성과정 저장 */
            // 1. 기존 삭제
      await supabase
        .from("training_courses")
        .delete()
        .eq("instructor_id", editingItem.id);
            // 2. 새로 insert
      const validTrainings = editingTrainings
        .filter(t => t.course_name || t.institution || t.completion_year)
        .map(t => ({
          instructor_id: editingItem.id,
          course_name: t.course_name || "",
          institution: t.institution || "",
          completion_year: t.completion_year || ""
        }));
      
      if(validTrainings.length){
        await supabase
          .from("training_courses")
          .insert(validTrainings);
      }
            /* 🔥 실무경력 저장 */
            // 1. 기존 삭제
      await supabase
        .from("welfare_experiences")
        .delete()
        .eq("instructor_id", editingItem.id);
      
      const validWelfares = editingWelfares
        .filter(w => w.organization || w.role || w.start_date || w.end_date || w.description)
        .map(w => ({
          instructor_id: editingItem.id,
          organization: w.organization || "",
          role: w.role || "",
          start_date: w.start_date || null,
          end_date: w.end_date || null,
          description: w.description || ""
        }));
      
      if(validWelfares.length){
        await supabase
          .from("welfare_experiences")
          .insert(validWelfares);
      }

      await supabase
        .from("lecture_experiences")
        .delete()
        .eq("instructor_id", editingItem.id);
      
      const validLectures = editingLectures
        .filter(l => l.organization || l.target || l.topic || l.start_date || l.end_date || l.count)
        .map(l => ({
          instructor_id: editingItem.id,
          organization: l.organization || "",
          target: l.target || "",
          topic: l.topic || "",
          start_date: l.start_date || null,
          end_date: l.end_date || null,
          count: l.count || ""
        }));
      
      if(validLectures.length){
        await supabase
          .from("lecture_experiences")
          .insert(validLectures);
      }
      
      window.alert("수정 완료");
      setEditingItem(null);
      loadAdmin();
    }
  }

  function downloadCSV(){
    if(!items.length){alert("먼저 목록을 불러오세요.");return;}

    const headers=["성명","전화","이메일","지역","활동지역","주요강의주제","교육대상","교육유형","강의분야","그외주제","공개상태"];
    const rows=items.map((item)=>[
      item.name||"",
      item.phone||"",
      item.email||"",
      item.region||"",
      (item.activity_regions||[]).join(", "),
      item.main_topic||"",
      (item.targets||[]).join(", "),
      (item.types||[]).join(", "),
      (item.specialties||[]).join(", "),
      item.other_specialty||"",
      item.public_status||""
    ]);

    const csv=[headers,...rows]
      .map((row)=>row.map((v)=>`"${String(v).replaceAll('"','""')}"`).join(","))
      .join("\n");

    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="강사목록.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredItems = items.filter((item) => {
    const keywordText = [
      item.name,
      item.email,
      item.phone,
      item.region,
      item.main_topic,
      item.organization
    ].join(" ");
  
    return (
      (!adminKeyword || keywordText.includes(adminKeyword)) &&
      (!adminStatus || item.public_status === adminStatus)
    );
  });
  
  const filteredUpdateRequests = updateRequests.filter((req)=>{
    if(requestStatusFilter){
      return req.request_status === requestStatusFilter;
    }
  
    return req.request_status !== "대체됨";
  });
  
  const adminTotalPages = Math.ceil(
    filteredItems.length / adminItemsPerPage
  );
  
  const paginatedAdminItems = filteredItems.slice(
    (adminPage - 1) * adminItemsPerPage,
    adminPage * adminItemsPerPage
  );
  
  const requestTotalPages = Math.ceil(
    filteredUpdateRequests.length / requestItemsPerPage
  );
  
  const paginatedRequests = filteredUpdateRequests.slice(
    (requestPage - 1) * requestItemsPerPage,
    requestPage * requestItemsPerPage
  );
  
  return (
    <div>
      <section className="hero">
        <h1>관리자 페이지</h1>
        <p>강사 승인, 비공개, 수정, 삭제, CSV 다운로드를 수행합니다.</p>
      </section>

      {message?<div className="notice">{message}</div>:null}

      

      {editingItem && (
        <section className="card">
          <h2>강사 정보 수정</h2>
      
          <p className="muted small">
            관리자가 수정한 내용은 즉시 공개 정보에 반영됩니다.
            중앙센터 수료 확인은 중앙센터에서 확인 가능한 경우에만 체크합니다.
          </p>
      
          <ModifyBasicInfo
            found={editingItem}
            updateField={updateEdit}
            regionOptions={regionOptions}
            targetOptions={targetOptions}
            typeOptions={typeOptions}
            specialtyOptions={specialtyOptions}
            Field={Field}
            CheckboxGroup={CheckboxGroup}
          />
      
          <ModifyTrainingSection
            modifyTrainings={editingTrainings}
            setModifyTrainings={setEditingTrainings}
            Field={Field}
          />
      
          <ModifyWelfareSection
            modifyWelfares={editingWelfares}
            setModifyWelfares={setEditingWelfares}
            Field={Field}
            MonthSelect={MonthSelect}
            getCurrentMonthKST={getCurrentMonthKST}
            toMonthValue={toMonthValue}
            monthToDate={monthToDate}
          />
      
          <ModifyLectureSection
            modifyLectures={editingLectures}
            setModifyLectures={setEditingLectures}
            Field={Field}
            MonthSelect={MonthSelect}
            getCurrentMonthKST={getCurrentMonthKST}
            toMonthValue={toMonthValue}
            monthToDate={monthToDate}
          />
      
          <div className="check-grid">
            <label className="check">
              <input
                type="checkbox"
                checked={!!editingItem.center_verified}
                onChange={(e)=>
                  updateEdit(
                    "center_verified",
                    e.target.checked
                  )
                }
              />
              중앙센터 수료 확인
            </label>
          </div>
      
          <div className="actions">
            <button
              className="btn"
              onClick={()=>
                setEditingItem(null)
              }
            >
              취소
            </button>
      
            <button
              className="btn primary"
              onClick={saveEdit}
            >
              저장
            </button>
          </div>
        </section>
      )}

      <section className="card">
        <div className="actions">
          <button className="btn primary" onClick={loadAdmin}>강사 목록 불러오기</button>
          <button className="btn" onClick={loadRequests}>수정 요청 불러오기</button>
          <button className="btn" onClick={downloadCSV}>CSV 다운로드</button>
        </div>
        
        <section className="card">
          <h2>수정 요청 목록</h2>
          <div className="grid grid-3" style={{marginBottom:12}}>
            <Field label="요청 상태">
              <select
                value={requestStatusFilter}
                onChange={(e)=>setRequestStatusFilter(e.target.value)}
              >
                <option value="">전체</option>
                <option value="검토중">검토중</option>
                <option value="승인">승인</option>
                <option value="반려">반려</option>
                <option value="대체됨">대체됨</option>
              </select>
            </Field>
          
            <div style={{display:"flex", alignItems:"end"}}>
              <button
                className="btn"
                onClick={()=>setRequestStatusFilter("")}
              >
                상태 필터 초기화
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>요청일</th>
                  <th>강사명</th>
                  <th>상태</th>
                  <th>반려 사유</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((req)=>(
                  <React.Fragment key={req.id}>
                    <tr className={req.request_status !== "검토중" ? "processed-row" : ""}>
                      <td>{formatKST(req.requested_at)}</td>
                      <td>{req.instructors?.name || "-"}</td>
                      <td>
                        <div>{req.request_status}</div>
                        {req.reviewed_at && (
                          <div className="muted small">
                           {formatKST(req.reviewed_at)}
                          </div>
                        )}
                      </td>
                      <td>{req.admin_memo || "-"}</td>
                      <td>
                        <button
                          className="btn primary"
                          onClick={()=>approveRequest(req)}
                          disabled={req.request_status !== "검토중"}
                        >
                          승인
                        </button>
                
                        <button
                          className="btn danger"
                          onClick={()=>rejectRequest(req)}
                          disabled={req.request_status !== "검토중"}
                          style={{marginLeft:6}}
                        >
                          반려
                        </button>
                
                        <button
                          className="btn"
                          onClick={()=>{
                            setOpenRequestId(openRequestId === req.id ? null : req.id);
                          }}
                          style={{marginLeft:6}}
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                
                    {openRequestId === req.id && (
                      <tr className={req.request_status !== "검토중" ? "processed-row" : ""}>
                        <td colSpan="5">
                         <div className="request-detail-box">
                          <div className="change-summary">
                            <b>변경 요청 상세</b>
                            <p>변경된 항목만 표시됩니다.</p>
                          </div>
                          {renderChangedField("성명", req.instructors?.name, req.requested_data?.instructor?.name)}
                          {renderChangedField("연락처", req.instructors?.phone, req.requested_data?.instructor?.phone)}
                          {renderChangedField("이메일", req.instructors?.email, req.requested_data?.instructor?.email)}
                          {renderChangedField("거주지역", req.instructors?.region, req.requested_data?.instructor?.region)}
                          {renderChangedField("활동 가능 지역", req.instructors?.activity_regions, req.requested_data?.instructor?.activity_regions)}
                          {renderChangedField("소속기관", req.instructors?.organization, req.requested_data?.instructor?.organization)}
                          {renderChangedField("직위/직업군", req.instructors?.position, req.requested_data?.instructor?.position)}
                          {renderChangedField("주요 강의주제", req.instructors?.main_topic, req.requested_data?.instructor?.main_topic)}
                          {renderChangedField("강의 분야", req.instructors?.specialties, req.requested_data?.instructor?.specialties)}
                          {renderChangedField("그 외 주제", req.instructors?.other_specialty, req.requested_data?.instructor?.other_specialty)}
                          {renderChangedField("교육대상", req.instructors?.targets, req.requested_data?.instructor?.targets)}
                          {renderChangedField("교육유형", req.instructors?.types, req.requested_data?.instructor?.types)}
                          {renderChangedField("강사 소개", req.instructors?.intro, req.requested_data?.instructor?.intro)}
                          {renderChangedField("연락처 공개", req.instructors?.show_phone, req.requested_data?.instructor?.show_phone)}
                          {renderChangedField("이메일 공개", req.instructors?.show_email, req.requested_data?.instructor?.show_email)}
                          {renderChangedField("프로필 공개", req.instructors?.show_profile, req.requested_data?.instructor?.show_profile)}
                          {renderChangedField("개발원 과정 수료 확인", req.instructors?.center_verified, req.requested_data?.instructor?.center_verified)}
                          {renderChangedList(
                            "양성과정 수료 정보",
                            req.instructors?.training_courses,
                            req.requested_data?.training_courses,
                            (t)=>`${t.course_name || "-"} / ${t.institution || "-"} / ${t.completion_year || "-"}`
                          )}
                          
                          {renderChangedList(
                            "실무경력",
                            req.instructors?.welfare_experiences,
                            req.requested_data?.welfare_experiences,
                            (w)=>`${w.organization || "-"} / ${w.role || "-"} / ${formatPeriod(w.start_date, w.end_date)} / ${w.description || "-"}`
                          )}
                          
                          {renderChangedList(
                            "강의경력",
                            req.instructors?.lecture_experiences,
                            req.requested_data?.lecture_experiences,
                            (l)=>`${l.organization || "-"} / ${l.target || "-"} / ${l.topic || "-"} / ${l.count || "-"}회 / ${formatPeriod(l.start_date, l.end_date)}`
                          )}
                        
                          {![
                            isChanged(req.instructors?.name, req.requested_data?.instructor?.name),
                            isChanged(req.instructors?.phone, req.requested_data?.instructor?.phone),
                            isChanged(req.instructors?.email, req.requested_data?.instructor?.email),
                            isChanged(req.instructors?.region, req.requested_data?.instructor?.region),
                            isChanged(req.instructors?.activity_regions, req.requested_data?.instructor?.activity_regions),
                            isChanged(req.instructors?.organization, req.requested_data?.instructor?.organization),
                            isChanged(req.instructors?.position, req.requested_data?.instructor?.position),
                            isChanged(req.instructors?.main_topic, req.requested_data?.instructor?.main_topic),
                            isChanged(req.instructors?.specialties, req.requested_data?.instructor?.specialties),
                            isChanged(req.instructors?.other_specialty, req.requested_data?.instructor?.other_specialty),
                            isChanged(req.instructors?.targets, req.requested_data?.instructor?.targets),
                            isChanged(req.instructors?.types, req.requested_data?.instructor?.types),
                            isChanged(req.instructors?.intro, req.requested_data?.instructor?.intro),
                            isChanged(req.instructors?.show_phone, req.requested_data?.instructor?.show_phone),
                            isChanged(req.instructors?.show_email, req.requested_data?.instructor?.show_email),
                            isChanged(req.instructors?.show_profile, req.requested_data?.instructor?.show_profile),
                            isChanged(req.instructors?.center_verified, req.requested_data?.instructor?.center_verified),
                            isChanged(req.instructors?.training_courses, req.requested_data?.training_courses),
                            isChanged(req.instructors?.welfare_experiences, req.requested_data?.welfare_experiences),
                            isChanged(req.instructors?.lecture_experiences, req.requested_data?.lecture_experiences)
                          ].some(Boolean) && (
                            <div className="muted">변경된 항목이 없습니다.</div>
                          )}
                        </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
        
                {updateRequests.length > 0 && !filteredUpdateRequests.length && (
                  <tr>
                    <td colSpan="5" className="muted">
                      선택한 상태의 수정 요청이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={requestPage}
            totalPages={requestTotalPages}
            onPageChange={setRequestPage}
          />
        </section>
        
<div className="grid grid-3" style={{marginTop: "14px", marginBottom: "14px"}}>
  <Field label="검색어">
    <input
      value={adminKeyword}
      onChange={(e)=>setAdminKeyword(e.target.value)}
      placeholder="이름, 이메일, 연락처, 지역, 주제 검색"
    />
  </Field>

  <Field label="공개상태">
    <select
      value={adminStatus}
      onChange={(e)=>setAdminStatus(e.target.value)}
    >
      <option value="">전체</option>
      <option value="검토중">검토중</option>
      <option value="공개">공개</option>
      <option value="비공개">비공개</option>
    </select>
  </Field>

  <div style={{display:"flex",alignItems:"end",gap:"8px"}}>
    <button className="btn" onClick={()=>{setAdminKeyword("");setAdminStatus("");}}>
      필터 초기화
    </button>
  </div>
</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>성명</th>
                <th>지역</th>
                <th>주요 주제</th>
                <th>양성과정</th>
                <th>실무경력</th>
                <th>강의경력</th>
                <th>상태</th>
                <th>연락처</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdminItems.map((item)=>(
                <tr key={item.id}>
                  <td>{item.name||"-"}</td>
                  <td>{item.region||"-"}</td>
                  <td>{item.main_topic||"-"}</td>
                  <td>{item.training_courses?.length?item.training_courses.map(c=><div key={c.id}>{c.course_name||"-"} / {c.institution||"-"} / {c.completion_year||"-"}</div>):"-"}</td>
                  <td>
                    {item.welfare_experiences?.length
                      ? item.welfare_experiences.map((w, i)=>(
                          <div key={w.id || i}>
                            {w.organization || "-"} / {w.role || "-"} / {formatPeriod(w.start_date, w.end_date)}
                          </div>
                        ))
                      : "-"
                    }
                  </td>
                  <td>
                    {item.lecture_experiences?.length
                      ? item.lecture_experiences.map((l, i)=>(
                          <div key={l.id || i}>
                            {l.organization || "-"} / {l.topic || "-"} / {l.count || "-"}회 / {formatPeriod(l.start_date, l.end_date)}
                          </div>
                        ))
                      : "-"
                    }
                  </td>
                  <td>{item.public_status||"-"}</td>
                  <td>{item.phone||"-"}<br/>{item.email||"-"}</td>
                  <td>
                    <button className="btn success" onClick={()=>updateStatus(item.id,"공개")}>승인</button>{" "}
                    <button className="btn" onClick={()=>updateStatus(item.id,"비공개")}>비공개</button>{" "}
                    <button className="btn" onClick={()=>startEdit(item)}>수정</button>{" "}
                    <button className="btn danger" onClick={()=>deleteItem(item.id)}>삭제</button>
                  </td>
                </tr>
              ))}
              {!items.length ? (<tr><td colSpan="9" className="muted">목록을 불러오세요.</td></tr>) : null}
              {items.length > 0 && filteredItems.length === 0 ? (<tr><td colSpan="9" className="muted">필터 조건에 맞는 강사가 없습니다.</td></tr>) : null}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={adminPage}
          totalPages={adminTotalPages}
          onPageChange={setAdminPage}
        />
      </section>
    </div>
  )
}



function App(){
  const [page,setPage]=useState(()=>window.location.hash.replace("#","")||"search")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userName, setUserName] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      setUser(user);
  
      if (!user) {
        setIsAdmin(false);
        setUserName("");
        return;
      }
  
      // 관리자 확인
      const { data: adminData } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
  
      setIsAdmin(!!adminData);
  
      // 강사 이름 조회
      const { data: instructorData } = await supabase
        .from("instructors")
        .select("name")
        .eq("auth_user_id", user.id)
        .maybeSingle();
  
      if (instructorData?.name) {
        setUserName(instructorData.name);
      } else {
        setUserName("");
      }
    }
  
    checkUser();
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
  
    return () => subscription.unsubscribe();
  }, []);

  function go(next){
    window.location.hash = next
    setPage(next)
  }

  return (
    <div>
      <nav className="top-nav">

        <div className="nav-left">
      
          <button onClick={()=>go("search")}>
            검색
          </button>
      
          {!user && (
            <button onClick={()=>go("register")}>
              등록
            </button>
          )}
      
          {user && !isAdmin && (
            <button
              className={page==="modify"?"active":""}
              onClick={()=>go("modify")}
            >
              정보 수정 요청
            </button>
          )}
      
          {isAdmin && (
            <>
              <button onClick={()=>go("register")}>
                등록
              </button>
      
              <button
                className={page==="modify"?"active":""}
                onClick={()=>go("modify")}
              >
                정보 수정 요청
              </button>
      
              <button
                className={page==="admin"?"active":""}
                onClick={()=>go("admin")}
              >
                관리자
              </button>
            </>
          )}
      
        </div>
      
        <div className="nav-right">
      
          {!user ? (
            <>
              <input
                placeholder="이메일"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
      
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
      
              <button onClick={login}>
                로그인
              </button>
            </>
          ) : (
            <>
              <span className="welcome">
                {isAdmin
                  ? "관리자님 반갑습니다."
                  : `${userName || "강사"}님 반갑습니다.`}
              </span>
      
              <button onClick={logout}>
                로그아웃
              </button>
            </>
          )}
      
        </div>
      
      </nav>

      <main>
        {page==="search" && <SearchPage />}
        {page==="register" && <RegisterPage />}
        {page==="admin" && <AdminPage />}
        {page==="modify" && <ModifyPage />}
      </main>
    </div>
  )
  
  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      window.alert("로그인 실패: " + error.message);
      return;
    }
  
    setEmail("");
    setPassword("");
  
    window.alert("로그인되었습니다.");
  }
  
  async function logout() {
    await supabase.auth.signOut();
  
    setUser(null);
    setIsAdmin(false);
    setUserName("");
  
    window.alert("로그아웃되었습니다.");
  
    go("search");
  }
}


createRoot(document.getElementById("root")).render(<App />);
