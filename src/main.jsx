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

import {
  saveInstructorEdit
} from "./services/saveInstructorEdit";


// hooks
import useRegisterForm from "./hooks/useRegisterForm";
import useSearchPage from "./hooks/useSearchPage";
import ModifyPage from "./pages/ModifyPage";
import useModifyInstructor from "./hooks/useModifyInstructor";
import RegisterPage from "./pages/RegisterPage";
import usePageSize from "./hooks/usePageSize";


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

import AdminEditPanel from "./components/admin/AdminEditPanel";
import AdminRequestSection from "./components/AdminRequestSection";
import AdminInstructorTableSection from "./components/AdminInstructorTableSection";

import PageSizeSelector from "./components/PageSizeSelector";

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
    
    itemsPerPage,
    setItemsPerPage,
    
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
        <PageSizeSelector
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
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

            {[...Array(itemsPerPage)].map((_, i) => (
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
    const [
    adminItemsPerPage,
    setAdminItemsPerPage
  ] = usePageSize(10);
  
  const [requestPage, setRequestPage] = useState(1);
  const [
    requestItemsPerPage,
    setRequestItemsPerPage
  ] = usePageSize(10);
  
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

  async function saveEdit() {

    try {
  
      await saveInstructorEdit({
        supabase,
  
        editingItem,
  
        editingTrainings,
  
        editingWelfares,
  
        editingLectures
      });
  
      window.alert("수정 완료");
  
      setEditingItem(null);
  
      loadAdmin();
  
    }
    catch (err) {
  
      setMessage(err.message);
  
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

      

      <AdminEditPanel
        editingItem={editingItem}
        setEditingItem={setEditingItem}
      
        updateEdit={updateEdit}
        saveEdit={saveEdit}
      
        editingTrainings={editingTrainings}
        setEditingTrainings={setEditingTrainings}
      
        editingWelfares={editingWelfares}
        setEditingWelfares={setEditingWelfares}
      
        editingLectures={editingLectures}
        setEditingLectures={setEditingLectures}
      
        regionOptions={regionOptions}
        targetOptions={targetOptions}
        typeOptions={typeOptions}
        specialtyOptions={specialtyOptions}
      
        Field={Field}
        CheckboxGroup={CheckboxGroup}
      
        MonthSelect={MonthSelect}
      
        getCurrentMonthKST={
          getCurrentMonthKST
        }
      
        toMonthValue={toMonthValue}
      
        monthToDate={monthToDate}
      />

      <section className="card">
        <div className="actions">
          <button
            className="btn primary"
            onClick={loadAdmin}
          >
            강사 목록 불러오기
          </button>
        
          <button
            className="btn"
            onClick={loadRequests}
          >
            수정 요청 불러오기
          </button>
        
          <button
            className="btn"
            onClick={downloadCSV}
          >
            CSV 다운로드
          </button>
        
          <PageSizeSelector
            value={adminItemsPerPage}
            onChange={setAdminItemsPerPage}
          />
        
          <PageSizeSelector
            value={requestItemsPerPage}
            onChange={setRequestItemsPerPage}
          />
        </div>

        <AdminRequestSection
        requestStatusFilter={
          requestStatusFilter
        }
        setRequestStatusFilter={
          setRequestStatusFilter
        }
      
        paginatedRequests={
          paginatedRequests
        }
      
        updateRequests={
          updateRequests
        }
      
        filteredUpdateRequests={
          filteredUpdateRequests
        }
      
        requestPage={requestPage}
      
        requestTotalPages={
          requestTotalPages
        }
      
        setRequestPage={
          setRequestPage
        }
      
        openRequestId={
          openRequestId
        }
      
        setOpenRequestId={
          setOpenRequestId
        }
      
        approveRequest={
          approveRequest
        }
      
        rejectRequest={
          rejectRequest
        }
      
        renderChangedField={
          renderChangedField
        }
      
        renderChangedList={
          renderChangedList
        }
      
        isChanged={isChanged}
      
        formatKST={formatKST}
      
        formatPeriod={
          formatPeriod
        }
      
        Field={Field}
      
        Pagination={Pagination}
      />   
      
      <AdminInstructorTableSection
        adminKeyword={adminKeyword}
        setAdminKeyword={setAdminKeyword}
      
        adminStatus={adminStatus}
        setAdminStatus={setAdminStatus}
      
        setAdminPage={setAdminPage}
      
        paginatedAdminItems={
          paginatedAdminItems
        }
      
        items={items}
      
        filteredItems={filteredItems}
      
        adminPage={adminPage}
      
        adminTotalPages={
          adminTotalPages
        }
      
        updateStatus={updateStatus}
      
        startEdit={startEdit}
      
        deleteItem={deleteItem}
      
        formatPeriod={formatPeriod}
      
        Field={Field}
      
        Pagination={Pagination}
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
