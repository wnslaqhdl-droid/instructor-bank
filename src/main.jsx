import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabase";
import { regionOptions, targetOptions, typeOptions, specialtyOptions, emptyInstructor, emptyTraining, emptyWelfare, emptyLecture } from "./constants";
import "./styles.css";

const clone = (v) => JSON.parse(JSON.stringify(v));

function getCurrentMonthKST(){
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 7);
}

function toMonthValue(value){
  if(!value) return "";
  return String(value).slice(0, 7);
}

function monthToDate(value){
  if(!value) return null;
  return `${value}-01`;
}

function formatMonth(value){
  if(!value) return "";
  const [year, month] = String(value).slice(0, 7).split("-");
  if(!year || !month) return "";
  return `${year}.${month}`;
}

function formatPeriod(startDate, endDate){
  const start = formatMonth(startDate) || "-";
  const end = endDate ? formatMonth(endDate) : "현재";
  return `${start} ~ ${end}`;
}

function Field({ label, required, help, children }) {
  return (
    <label className="field">
      <span>{label}{required ? " *" : ""}</span>
      {children}
      {help ? <div className="help">{help}</div> : null}
    </label>
  );
}

function MonthSelect({ label, value, min, max, disabled, onChange }){
  const currentYear = Number(getCurrentMonthKST().slice(0, 4));
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  const monthValue = toMonthValue(value);
  const selectedYear = monthValue ? monthValue.slice(0, 4) : "";
  const selectedMonth = monthValue ? monthValue.slice(5, 7) : "";

  function isDisabledMonth(year, month){
    if(!year || !month) return false;
    const ym = `${year}-${month}`;
    if(min && ym < min) return true;
    if(max && ym > max) return true;
    return false;
  }

  function apply(nextYear, nextMonth){
    if(!nextYear){
      onChange(null);
      return;
    }

    const safeMonth = nextMonth || "01";
    const ym = `${nextYear}-${safeMonth}`;

    if(min && ym < min) return;
    if(max && ym > max) return;

    onChange(monthToDate(ym));
  }

return (
        <div className="field">
          <span>{label}</span>
      
          <div className="month-row">
            <select
              value={selectedYear}
              disabled={disabled}
              onChange={(e)=>apply(e.target.value, selectedMonth || "01")}
            >
              <option value="">연도</option>
              {years.map((y)=>(
                <option
                  key={y}
                  value={y}
                  disabled={
                    (min && `${y}-12` < min) ||
                    (max && `${y}-01` > max)
                  }
                >
                  {y}년
                </option>
              ))}
            </select>
      
            <select
              value={selectedMonth}
              disabled={disabled || !selectedYear}
              onChange={(e)=>apply(selectedYear, e.target.value)}
            >
              <option value="">월</option>
              {months.map((m)=>(
                <option
                  key={m}
                  value={m}
                  disabled={isDisabledMonth(selectedYear, m)}
                >
                  {Number(m)}월
                </option>
              ))}
            </select>
          </div>
        </div>
      );
}

function CheckboxGroup({ options, values, onChange }) {
  function toggle(option) {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  }

  return (
    <div className="check-grid">
      {options.map((option) => (
        <label key={option} className="check">
          <input
            type="checkbox"
            checked={values.includes(option)}
            onChange={() => toggle(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

function Repeater({ title, help, items, setItems, emptyItem, render }) {
  const updateItem = (index, key, value) => setItems(items.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const add = () => setItems([...items, clone(emptyItem)]);
  const remove = (index) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };
  return <section className="card"><div className="instructor-top"><div><h2>{title}</h2>{help ? <p className="muted small">{help}</p> : null}</div><button className="btn primary" type="button" onClick={add}>추가</button></div>{items.map((item, index) => <div className="repeat" key={index}><div className="instructor-top"><strong>입력 {index + 1}</strong><button className="btn danger" type="button" onClick={() => remove(index)}>삭제</button></div>{render(item, index, updateItem)}</div>)}</section>;
}

function RegisterPage() {
  const [form, setForm] = useState(clone(emptyInstructor));
  const [trainingCourses, setTrainingCourses] = useState([clone(emptyTraining)]);
  const [welfareExperiences, setWelfareExperiences] = useState([clone(emptyWelfare)]);
  const [lectureExperiences, setLectureExperiences] = useState([clone(emptyLecture)]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

async function submitForm() {
  function scrollToTop() {
    window.scrollTo({ top: 0 });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  setMessage("");
  setError("");

  if (!form.name || !form.email || !form.phone || !form.region || !form.main_topic) {
    setError("성명, 연락처, 이메일, 거주지역, 주요 강의주제는 필수입니다.");
    scrollToTop();
    return;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("instructors")
    .insert([{ ...form, public_status: "검토중", update_status: "정상" }])
    .select("id")
    .single();

  if (insertError) {
    setError("강사 기본정보 저장 실패: " + insertError.message);
    scrollToTop();
    return;
  }

  const instructor_id = inserted.id;

  const validTrainings = trainingCourses
    .filter((x) => x.course_name || x.institution || x.completion_year)
    .map((x) => ({ instructor_id, ...x }));

  const validWelfare = welfareExperiences
    .filter((x) => x.organization || x.role || x.start_date || x.end_date || x.description)
    .map((x) => ({
      instructor_id,
      ...x,
      start_date: x.start_date || null,
      end_date: x.end_date || null
    }));

  const validLectures = lectureExperiences
    .filter((x) => x.organization || x.target || x.topic || x.start_date || x.end_date || x.count)
    .map((x) => ({
      instructor_id,
      ...x,
      start_date: x.start_date || null,
      end_date: x.end_date || null
    }));

  if (validTrainings.length) {
    const { error } = await supabase
      .from("training_courses")
      .insert(validTrainings);

    if (error) {
      setError("양성과정 저장 오류: " + error.message);
      scrollToTop();
      return;
    }
  }

  if (validWelfare.length) {
    const { error } = await supabase
      .from("welfare_experiences")
      .insert(validWelfare);

    if (error) {
      setError("실무경력 저장 오류: " + error.message);
      scrollToTop();
      return;
    }
  }

  if (validLectures.length) {
    const { error } = await supabase
      .from("lecture_experiences")
      .insert(validLectures);

    if (error) {
      setError("강의경력 저장 오류: " + error.message);
      scrollToTop();
      return;
    }
  }

  setMessage("등록 신청이 완료되었습니다. 관리자 검토 후 공개됩니다.");

  setForm(clone(emptyInstructor));
  setTrainingCourses([clone(emptyTraining)]);
  setWelfareExperiences([clone(emptyWelfare)]);
  setLectureExperiences([clone(emptyLecture)]);

  scrollToTop();
}

  return <div><section className="hero"><h1>성인권 교육 강사 등록</h1><p>입력하신 정보는 관리자 검토 후 강사뱅크에 공개됩니다. 실무경력 및 강의경력은 강사 본인의 자기신고 내용을 기준으로 관리되며, 중앙센터는 발달장애인 성인권 부모교육지원사업 내 양성과정 수료 여부만 확인합니다.</p>
  </section>{message ? <div className="notice">{message}</div> : null}{error ? <div className="error">{error}</div> : null}
    <section className="card">
      <h2>1. 기본정보</h2>
      <div className="grid grid-2">
        <Field label="성명" required>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} />
        </Field>
        <Field label="연락처" required>
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="010-0000-0000" />
        </Field>
        <Field label="이메일" required>
          <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="example@email.com" />
        </Field>
        <Field label="거주지역" required>
          <select value={form.region} onChange={(e) => update("region", e.target.value)}><option value="">선택</option>{regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="소속기관"><input value={form.organization} onChange={(e) => update("organization", e.target.value)} />
        </Field>
        <Field label="직위/직업군">
          <input value={form.position} onChange={(e) => update("position", e.target.value)} />
        </Field>
      </div>
    </section>
    <Repeater title="2. 양성과정 수료 정보" help="수료한 과정명을 이력 단위로 입력합니다." items={trainingCourses} setItems={setTrainingCourses} emptyItem={emptyTraining} render={(item, index, updateItem) =>
    <div className="grid grid-3">
      <Field label="양성과정명">
        <input value={item.course_name} onChange={(e) => updateItem(index, "course_name", e.target.value)} />
      </Field>
      <Field label="수료기관">
        <input value={item.institution} onChange={(e) => updateItem(index, "institution", e.target.value)} />
      </Field>
      <Field label="수료연도">
        <input value={item.completion_year} onChange={(e) => updateItem(index, "completion_year", e.target.value)} />
      </Field>
    </div>} />
    <Repeater title="3. 장애인복지 분야 실무경력 자기신고" help="중앙센터가 개별 검증하지 않는 자기신고 영역입니다." items={welfareExperiences} setItems={setWelfareExperiences} emptyItem={emptyWelfare} render={(item, index, updateItem) => 
    <div className="grid grid-2">
      <Field label="기관명">
        <input value={item.organization} onChange={(e) => updateItem(index, "organization", e.target.value)} />
      </Field>
      <Field label="역할">
        <input value={item.role} onChange={(e) => updateItem(index, "role", e.target.value)} />
      </Field>
     <MonthSelect
        label="시작월"
        value={item.start_date}
        max={getCurrentMonthKST()}
        onChange={(date)=>{
          const nextStartMonth = toMonthValue(date);
          const currentEndMonth = toMonthValue(item.end_date);
      
          updateItem(index, "start_date", date);
      
          if(currentEndMonth && nextStartMonth && nextStartMonth > currentEndMonth){
            updateItem(index, "end_date", null);
          }
        }}
      />
      
      <MonthSelect
        label="종료월"
        value={item.end_date}
        min={toMonthValue(item.start_date)}
        max={getCurrentMonthKST()}
        disabled={!!item.is_current}
        onChange={(date)=>{
          updateItem(index, "end_date", date);
        }}
      />
      
      <label className="check">
        <input
          type="checkbox"
          checked={!!item.is_current}
          onChange={(e)=>{
            const checked = e.target.checked;
      
            updateItem(index, "is_current", checked);
      
            if(checked){
              updateItem(index, "end_date", null);
            }else if(!item.end_date){
              updateItem(index, "end_date", monthToDate(getCurrentMonthKST()));
            }
          }}
        />
        <span>현재 진행 중</span>
      </label>
      <Field label="주요 업무">
        <textarea value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} />
      </Field>
    </div>
    } />
    <Repeater title="4. 발달장애인 대상 성교육 강의경력 자기신고" items={lectureExperiences} setItems={setLectureExperiences} emptyItem={emptyLecture} render={(item, index, updateItem) => 
    <div className="grid grid-3">
      <Field label="강의기관">
        <input value={item.organization} onChange={(e) => updateItem(index, "organization", e.target.value)} />
      </Field>
      <Field label="교육대상">
        <input value={item.target} onChange={(e) => updateItem(index, "target", e.target.value)} />
      </Field>
      <Field label="강의주제">
        <input value={item.topic} onChange={(e) => updateItem(index, "topic", e.target.value)} />
      </Field>
      <MonthSelect
        label="시작월"
        value={item.start_date}
        max={getCurrentMonthKST()}
        onChange={(date)=>{
          const copy = [...lectureExperiences];
          const nextStartMonth = toMonthValue(date);
          const currentEndMonth = toMonthValue(copy[i].end_date);
      
          copy[i] = {
            ...copy[i],
            start_date: date,
            end_date:
              currentEndMonth && nextStartMonth && nextStartMonth > currentEndMonth
                ? null
                : copy[i].end_date
          };
      
          setLectureExperiences(copy);
        }}
      />
      
      <MonthSelect
        label="종료월"
        value={item.end_date}
        min={toMonthValue(item.start_date)}
        max={getCurrentMonthKST()}
        disabled={!!item.is_current}
        onChange={(date)=>{
          const copy = [...lectureExperiences];
          copy[i] = { ...copy[i], end_date: date };
          setLectureExperiences(copy);
        }}
      />
      
      <label className="check">
        <input
          type="checkbox"
          checked={!!item.is_current}
          onChange={(e)=>{
            const checked = e.target.checked;
            const copy = [...lectureExperiences];
      
            copy[i] = {
              ...copy[i],
              is_current: checked,
              end_date: checked
                ? null
                : (copy[i].end_date || monthToDate(getCurrentMonthKST()))
            };
      
            setLectureExperiences(copy);
          }}
        />
        <span>현재 진행 중</span>
      </label>
      <Field label="강의횟수">
        <input value={item.count} onChange={(e) => updateItem(index, "count", e.target.value)} />
      </Field>
    </div>
    } />
    <section className="card">
      <h2>5. 강의 정보 및 공개 설정</h2>
      <p className="muted small">연락처와 이메일은 강사가 공개에 동의한 경우에만 검색 페이지에 표시됩니다. 공개를 원하지 않는 항목은 체크하지 않아도 됩니다.</p>
      <div className="grid"><Field label="활동 가능 지역">
        <CheckboxGroup options={regionOptions} values={form.activity_regions} onChange={(v) => update("activity_regions", v)} />
      </Field>
        <Field label="교육대상">
          <CheckboxGroup options={targetOptions} values={form.targets} onChange={(v) => update("targets", v)} />
        </Field>
        <Field label="교육유형">
          <CheckboxGroup options={typeOptions} values={form.types} onChange={(v) => update("types", v)} />
        </Field>
        <Field label="강의 분야" help="이 항목은 검색 필터에 표시됩니다.">
          <CheckboxGroup options={specialtyOptions} values={form.specialties} onChange={(v) => update("specialties", v)} />
        </Field>
        <Field label="그 외 주제" help="검색 필터에는 표시하지 않고 키워드 검색에만 활용합니다.">
          <input value={form.other_specialty} onChange={(e) => update("other_specialty", e.target.value)} />
        </Field>
        <Field label="주요 강의주제 한 줄"  required  help="검색 목록에 표시됩니다. 80자 이내로 핵심 주제만 입력해 주세요.">  
          <input    value={form.main_topic}    maxLength={80}    onChange={(e) => update("main_topic", e.target.value)}  />  
          <div className="help">{(form.main_topic || "").length} / 80</div>
        </Field>
        <Field label="강사 소개">
          <textarea value={form.intro} onChange={(e) => update("intro", e.target.value)} />
        </Field>
        <div className="check-grid">
          <label className="check">
            <input type="checkbox" checked={form.show_phone} onChange={(e) => update("show_phone", e.target.checked)} /> 연락처 공개</label>
          <label className="check"><input type="checkbox" checked={form.show_email} onChange={(e) => update("show_email", e.target.checked)} /> 이메일 공개</label>
          <label className="check"><input type="checkbox" checked={form.show_profile} onChange={(e) => update("show_profile", e.target.checked)} /> 공개 프로필 게시</label>
        </div>
      </div>
    </section>
    <div className="actions"><button className="btn primary" onClick={submitForm}>등록 신청</button></div></div>;
}

function SearchPage(){
 const [items,setItems]=useState([]);
 const [keyword,setKeyword]=useState("");
 const [region,setRegion]=useState("");
 const [target,setTarget]=useState("");
 const [type,setType]=useState("");
 const [specialty,setSpecialty]=useState("");
 const [message,setMessage]=useState("");
 const [openId,setOpenId]=useState(null);
 const [openBadgeId,setOpenBadgeId]=useState(null);  
 const [sortType,setSortType]=useState("latest");
 const [onlyVerified,setOnlyVerified]=useState(false);
 async function load(){ const {data,error}=await supabase
   .from("instructors")
   .select("*, training_courses(*), welfare_experiences(*), lecture_experiences(*)")
   .eq("public_status","공개")
   .eq("show_profile",true)
   .order("created_at",{ascending:false}); if(error)setMessage("검색 실패: "+error.message); else setItems(data||[]); }
 useEffect(()=>{load()},[]);
 function toggleDetail(id){ setOpenId(prev => (prev === id ? null : id))}
 const filtered = items.filter((item) => {
    const text = [
      item.name,
      item.region,
      item.main_topic,
      item.other_specialty,
      item.intro,
      (item.activity_regions || []).join(" "),
      (item.targets || []).join(" "),
      (item.types || []).join(" "),
      (item.specialties || []).join(" ")
    ].join(" ").toLowerCase();

    return (
      (!onlyVerified || item.center_verified) &&
      (!keyword || text.includes(keyword.toLowerCase())) &&
      (!region || item.region === region || (item.activity_regions || []).includes(region)) &&
      (!target || (item.targets || []).includes(target)) &&
      (!type || (item.types || []).includes(type)) &&
      (!specialty || (item.specialties || []).includes(specialty))
    );
  })
  .sort((a, b) => {
    if (sortType === "latest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortType === "name") return (a.name || "").localeCompare(b.name || "");
    if (sortType === "region") return (a.region || "").localeCompare(b.region || "");
    return 0;
  });
 return <div><section className="hero">
   <h1>성인권 교육 강사 검색</h1>
   <p>공개 승인된 강사를 지역, 교육대상, 교육유형, 강의 분야로 검색합니다.</p>
 </section>
   {message?<div className="error">{message}</div>:null}
   <section className="card">
     <div className="grid grid-4">
       <Field label="키워드">
       <input value={keyword} onChange={(e)=>setKeyword(e.target.value)} 
         placeholder="이름, 주제, 소개 검색"/></Field>
       
       <Field label="지역">
           <select value={region} onChange={(e)=>setRegion(e.target.value)}>
           <option value="">전체</option>{regionOptions.map((r)=><option key={r} value={r}>{r}</option>)}</select>
       </Field>
       <Field label="교육대상">
         <select value={target} onChange={(e)=>setTarget(e.target.value)}>
           <option value="">전체</option>{targetOptions.map((r)=>
           <option key={r} value={r}>{r}</option>)}</select>
       </Field>
       <Field label="교육유형">
         <select value={type} onChange={(e)=>setType(e.target.value)}>
           <option value="">전체</option>{typeOptions.map((r)=><option key={r} value={r}>{r}</option>)}</select>
       </Field></div>
     <div className="grid grid-3" style={{marginTop:14}}>
  <Field label="강의 분야">
    <select value={specialty} onChange={(e)=>setSpecialty(e.target.value)}>
      <option value="">전체</option>
      {specialtyOptions.map((r)=><option key={r} value={r}>{r}</option>)}
    </select>
  </Field>

  <Field label="정렬">
    <select value={sortType} onChange={(e)=>setSortType(e.target.value)}>
      <option value="latest">최신순</option>
      <option value="name">이름순</option>
      <option value="region">지역순</option>
    </select>
  </Field>
  <label style={{display:"block", marginTop:8}}>
    <input
      type="checkbox"
      checked={onlyVerified}
      onChange={(e)=>setOnlyVerified(e.target.checked)}
    />
    <span style={{marginLeft:6}}>개발원 과정 수료자만 보기</span>
  </label>

  <div style={{display:"flex",alignItems:"end",justifyContent:"flex-end"}}>
    <button className="btn" onClick={()=>{
      setKeyword("");
      setRegion("");
      setTarget("");
      setType("");
      setSpecialty("");
      setOnlyVerified(false);
      setSortType("latest");
    }}>
      필터 초기화
    </button>
  </div>
</div>
 </section><div className="list">
     <div className="muted small" style={{marginBottom:8}}>
     검색 결과: 총 {filtered.length}명
     </div>
     <div className="muted small" style={{marginBottom:8}}>
       정렬 기준: {sortType === "latest" ? "최신순" : sortType === "name" ? "이름순" : "지역순"}
     </div>
     <div className="active-filters">
      {region && (
        <span className="filter-chip" onClick={()=>setRegion("")}>
          지역: {region} ✕
        </span>
      )}
      {target && (
        <span className="filter-chip" onClick={()=>setTarget("")}>
          대상: {target} ✕
        </span>
      )}
      {type && (
        <span className="filter-chip" onClick={()=>setType("")}>
          유형: {type} ✕
        </span>
      )}
      {specialty && (
        <span className="filter-chip" onClick={()=>setSpecialty("")}>
          분야: {specialty} ✕
        </span>
      )}
      {onlyVerified && (
        <span className="filter-chip" onClick={()=>setOnlyVerified(false)}>
          개발원 과정 수료자 ✕
        </span>
      )}
    </div>
    <div className="compact-row header-row">
    <span className="compact-name">이름</span>
    <span>주요 강의주제</span>
    <span className="col-region">활동지역</span>
    <span className="col-target">교육대상</span>
    <span className="col-type">교육유형</span>
  </div>{filtered.length===0?<div className="card muted">검색 결과가 없습니다.</div>:null}{filtered.map((item)=><article className="instructor-card compact-card"  key={item.id}  onClick={() => toggleDetail(item.id)}  style={{ cursor: "pointer" }}
>
  <div className="compact-row">
    <span className="compact-name name-cell">
      <span className="name-text">{item.name || "-"}</span>
    
      {item.center_verified && (
        <button
          type="button"
          className="badge verified-badge"
          onClick={(e)=>{
            e.stopPropagation();
            setOpenBadgeId(openBadgeId === item.id ? null : item.id);
          }}
        >
          개발원 과정 수료자
        </button>
      )}
    </span>
    <span className="col-topic">{item.main_topic || "-"}</span>
    <span className="col-region">{(item.activity_regions || []).join(", ") || item.region || "-"}</span>
    <span className="col-target">{(item.targets || []).join(", ") || "-"}</span>
    <span className="col-type">{(item.types || []).join(", ") || "-"}</span>
  </div>
    {openBadgeId === item.id && (
      <div className="badge-info-box">
        한국장애인개발원에서 운영한 관련 교육과정 수료 이력이 확인된 강사입니다.
        강사의 전체 경력 또는 모든 교육과정 이수를 인증하는 의미는 아닙니다.
      </div>
    )}
   {openId === item.id && (
  <div className="detail-box">
    <div className="detail-grid">
      <div><b>활동지역</b><br/>        {(item.activity_regions || []).join(", ") || item.region || "-"}      </div>
      <div><b>교육대상</b><br/>        {(item.targets || []).join(", ") || "-"}      </div>
      <div><b>교육유형</b><br/>        {(item.types || []).join(", ") || "-"}      </div>
      <div><b>강의분야</b><br/>        {(item.specialties || []).join(", ") || "-"}      </div>
      <div style={{gridColumn:"1 / -1"}}>        <b>강의 소개</b><br/>        {item.intro || "-"}      </div>
      <div style={{gridColumn:"1 / -1"}}>
        <b>양성과정 수료 정보</b><br/>
        {(item.training_courses || []).length ? (
          item.training_courses.map((t, i)=>(
            <div key={i}>
              {t.course_name || "-"} / {t.institution || "-"} / {t.completion_year || "-"}
            </div>
          ))
        ) : "-"}
      </div>
    
      <div style={{gridColumn:"1 / -1"}}>
        <b>실무경력</b><br/>
        {(item.welfare_experiences || []).length ? (
          item.welfare_experiences.map((w, i)=>(
            <div key={i}>
              {w.organization || "-"} / {w.role || "-"} / {formatPeriod(w.start_date, w.end_date)}
              {w.description ? ` / ${w.description}` : ""}
            </div>
          ))
        ) : "-"}
      </div>
    
      <div style={{gridColumn:"1 / -1"}}>
        <b>강의경력</b><br/>
        {(item.lecture_experiences || []).length ? (
          item.lecture_experiences.map((l, i)=>(
            <div key={i}>
              {l.organization || "-"} / {l.target || "-"} / {l.topic || "-"} / {l.count || "-"}회
            </div>
          ))
        ) : "-"}
      </div>
      {item.show_phone && (        <div><b>연락처</b><br/>{item.phone ? (<a href={`tel:${item.phone}`}>{item.phone}</a>) : "-"}</div>      )}
      {item.show_email && (        <div><b>이메일</b><br/>{item.email ? (<a href={`mailto:${item.email}`}>{item.email}</a>) : "-"}</div>      )}
    </div>
  </div>
)}
</article>)}</div></div>;
}

function ModifyPage(){
  const [email,setEmail]=useState("");
  const [found,setFound]=useState(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [latestRequest,setLatestRequest]=useState(null);
  const [modifyTrainings,setModifyTrainings]=useState([]);
  const [modifyWelfares,setModifyWelfares]=useState([]);
  const [modifyLectures,setModifyLectures]=useState([]);
  const [originalInstructor,setOriginalInstructor]=useState(null);
  const [originalTrainings,setOriginalTrainings]=useState([]);
  const [originalWelfares,setOriginalWelfares]=useState([]);
  const [originalLectures,setOriginalLectures]=useState([]);

  async function search(){
    setError("");
    setMessage("");
  
    const {data,error} = await supabase
      .from("instructors")
      .select("*")
      .eq("email", email)
      .maybeSingle();
  
    if(error){
      setError("조회 실패: " + error.message);
      return;
    }
  
    if(!data){
      setError("해당 이메일로 등록된 강사를 찾을 수 없습니다.");
      return;
    }
  
    // 원본 기본정보 저장
    setOriginalInstructor(data);
  
    // 양성과정
    const { data: trainingData } = await supabase
      .from("training_courses")
      .select("*")
      .eq("instructor_id", data.id);
  
    setOriginalTrainings(trainingData || []);
  
    // 실무경력
    const { data: welfareData } = await supabase
      .from("welfare_experiences")
      .select("*")
      .eq("instructor_id", data.id);
  
    setOriginalWelfares(welfareData || []);
  
    // 강의경력
    const { data: lectureData } = await supabase
      .from("lecture_experiences")
      .select("*")
      .eq("instructor_id", data.id);
  
    setOriginalLectures(lectureData || []);
  
    // 최근 수정요청 조회
    const { data: requestData } = await supabase
      .from("instructor_update_requests")
      .select("*")
      .eq("instructor_id", data.id)
      .order("requested_at", { ascending:false })
      .limit(1)
      .maybeSingle();
  
    setLatestRequest(requestData || null);
  
    // 검토중/반려 요청이 있으면 요청 데이터를 수정폼에 표시
    if(
      requestData &&
      (requestData.request_status === "검토중" || requestData.request_status === "반려") &&
      requestData.requested_data?.instructor
    ){
      setFound(requestData.requested_data.instructor);
      setModifyTrainings(requestData.requested_data.training_courses || []);
    
      setModifyWelfares((requestData.requested_data.welfare_experiences || []).map((w)=>({
        ...w,
        is_current: !w.end_date
      })));
    
      setModifyLectures((requestData.requested_data.lecture_experiences || []).map((l)=>({
        ...l,
        is_current: !l.end_date
      })));
    }else{
      setFound(data);
      setModifyTrainings(trainingData || []);
      setModifyWelfares((requestData.requested_data.welfare_experiences || []).map((w)=>({
        ...w,
        is_current: !w.end_date
      })));
      setModifyLectures((requestData.requested_data.lecture_experiences || []).map((l)=>({
        ...l,
        is_current: !l.end_date
      })));
    }
  }

  function normalizeValue(value){
    if(value === null || value === undefined) return "";
    return value;
  }
  
  function isChangedValue(oldValue, newValue){
    return JSON.stringify(normalizeValue(oldValue)) !== JSON.stringify(normalizeValue(newValue));
  }
  
  async function submitRequest(){
    function scrollToTop(){
      window.scrollTo({ top: 0 });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    setError(""); setMessage("");

    const payload = {
      instructor: { ...found },
      training_courses: modifyTrainings,
      welfare_experiences: modifyWelfares,
      lecture_experiences: modifyLectures
    };
    
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
      isChangedValue(originalLectures, modifyLectures);
    
    if(!hasAnyChange){
      setError("변경된 항목이 없습니다. 수정 후 다시 제출해 주세요.");
      scrollToTop();
      return;
    }
    
    await supabase
      .from("instructor_update_requests")
      .update({
        request_status: "대체됨",
        admin_memo: "강사가 수정 요청을 다시 제출하여 최신 요청으로 대체됨",
        reviewed_at: new Date().toISOString()
      })
      .eq("instructor_id", found.id)
      .eq("request_status", "검토중");
    
    console.log("수정요청 payload", payload);
    
    const {error} = await supabase
      .from("instructor_update_requests")
      .insert([{
        instructor_id: found.id,
        requested_data: payload
      }]);
    
    if(error){
      setError("요청 실패: " + error.message);
      scrollToTop();
      return;
    }

    setMessage("수정 요청이 접수되었습니다. 관리자 검토 후 반영됩니다.");
    setFound(null);
    setEmail("");
    scrollToTop();
  }

  function updateField(key,value){
    setFound(prev => ({...prev, [key]: value}));
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
  
  return (
    <div>
      <section className="hero">
        <h1>강사 정보 수정 요청</h1>
        <p>
          등록 시 입력한 이메일로 본인 정보를 조회하고 수정 요청을 제출할 수 있습니다.
          이미 검토 중인 수정 요청이 있는 경우, 다시 제출하면 이전 요청은 최신 요청으로 대체됩니다.
        </p>
      </section>

      {message && <div className="notice">{message}</div>}
      {error && <div className="error">{error}</div>}

      <section className="card">
        <h2>1. 이메일로 조회</h2>

        <div className="grid grid-3">
          <Field label="이메일">
            <input value={email} onChange={(e)=>setEmail(e.target.value)} />
          </Field>

          <div style={{display:"flex",alignItems:"end"}}>
            <button className="btn primary" onClick={search}>
              조회
            </button>
          </div>
        </div>
      </section>
      
      {latestRequest && (
        <section className="card">
          <h2>최근 수정 요청 상태</h2>
      
          <p>
            현재 상태: <b>{latestRequest.request_status}</b>
          </p>
      
          <p className="muted small">
            요청일시: {formatKST ? formatKST(latestRequest.requested_at) : new Date(latestRequest.requested_at).toLocaleString()}
          </p>
      
          {latestRequest.reviewed_at && (
            <p className="muted small">
              처리일시: {formatKST ? formatKST(latestRequest.reviewed_at) : new Date(latestRequest.reviewed_at).toLocaleString()}
            </p>
          )}
      
          {latestRequest.request_status === "검토중" && (
            <p className="help">
              아직 관리자 검토 전입니다. 아래 수정폼에는 기존 제출한 수정 요청 내용이 표시됩니다.
              다시 제출하면 이전 검토중 요청은 대체되고 최신 요청만 관리자에게 표시됩니다.
            </p>
          )}
      
          {latestRequest.request_status === "반려" && (
            <p className="error">
              반려 사유: {latestRequest.admin_memo || "반려 사유가 입력되지 않았습니다."}
            </p>
          )}
      
          {latestRequest.request_status === "승인" && (
            <p className="help">
              최근 수정 요청이 승인되어 현재 강사 정보에 반영되었습니다.
            </p>
          )}
        </section>
      )}
      
      {found && (
        <section className="card">
          <h2>2. 정보 수정</h2>

          <div className="grid grid-2">
            <Field label="성명">
              <input value={found.name || ""} onChange={(e)=>updateField("name", e.target.value)} />
            </Field>

            <Field label="거주지역">
              <input value={found.region || ""} onChange={(e)=>updateField("region", e.target.value)} />
            </Field>

            <Field label="주요 강의주제">
              <input value={found.main_topic || ""} maxLength={80} onChange={(e)=>updateField("main_topic", e.target.value)} />
            </Field>
          </div>
          <h3>양성과정 수료 정보</h3>

          {modifyTrainings.map((t, i) => (
            <div key={i} className="repeat">
              <div className="grid grid-3">
                <Field label="양성과정명">
                  <input
                    value={t.course_name || ""}
                    onChange={(e)=>{
                      const copy = [...modifyTrainings];
                      copy[i] = { ...copy[i], course_name: e.target.value };
                      setModifyTrainings(copy);
                    }}
                  />
                </Field>
          
                <Field label="수료기관">
                  <input
                    value={t.institution || ""}
                    onChange={(e)=>{
                      const copy = [...modifyTrainings];
                      copy[i] = { ...copy[i], institution: e.target.value };
                      setModifyTrainings(copy);
                    }}
                  />
                </Field>
          
                <Field label="수료연도">
                  <input
                    value={t.completion_year || ""}
                    onChange={(e)=>{
                      const copy = [...modifyTrainings];
                      copy[i] = { ...copy[i], completion_year: e.target.value };
                      setModifyTrainings(copy);
                    }}
                  />
                </Field>
              </div>
          
              <div className="actions">
                <button
                  className="btn danger"
                  onClick={()=>{
                    setModifyTrainings(modifyTrainings.filter((_, idx)=>idx !== i));
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          
          <button
            className="btn"
            onClick={()=>{
              setModifyTrainings([
                ...modifyTrainings,
                { course_name:"", institution:"", completion_year:"" }
              ]);
            }}
          >
            양성과정 추가
          </button>

          <h3>실무경력</h3>

          {modifyWelfares.map((w, i) => (
            <div key={i} className="repeat">
              <div className="grid grid-2">
                <Field label="기관명">
                  <input
                    value={w.organization || ""}
                    onChange={(e)=>{
                      const copy = [...modifyWelfares];
                      copy[i] = { ...copy[i], organization: e.target.value };
                      setModifyWelfares(copy);
                    }}
                  />
                </Field>
          
                <Field label="역할">
                  <input
                    value={w.role || ""}
                    onChange={(e)=>{
                      const copy = [...modifyWelfares];
                      copy[i] = { ...copy[i], role: e.target.value };
                      setModifyWelfares(copy);
                    }}
                  />
                </Field>
          
                <MonthSelect
                  label="시작월"
                  value={w.start_date}
                  max={getCurrentMonthKST()}
                  onChange={(date)=>{
                    const copy = [...modifyWelfares];
                    const nextStartMonth = toMonthValue(date);
                    const currentEndMonth = toMonthValue(copy[i].end_date);
                
                    copy[i] = {
                      ...copy[i],
                      start_date: date,
                      end_date:
                        currentEndMonth && nextStartMonth && nextStartMonth > currentEndMonth
                          ? null
                          : copy[i].end_date
                    };
                
                    setModifyWelfares(copy);
                  }}
                />
                
                <MonthSelect
                  label="종료월"
                  value={w.end_date}
                  min={toMonthValue(w.start_date)}
                  max={getCurrentMonthKST()}
                  disabled={!!w.is_current}
                  onChange={(date)=>{
                    const copy = [...modifyWelfares];
                    copy[i] = { ...copy[i], end_date: date };
                    setModifyWelfares(copy);
                  }}
                />
                
                <label className="check">
                  <input
                    type="checkbox"
                    checked={!!w.is_current}
                    onChange={(e)=>{
                      const checked = e.target.checked;
                      const copy = [...modifyWelfares];
                
                      copy[i] = {
                        ...copy[i],
                        is_current: checked,
                        end_date: checked
                          ? null
                          : (copy[i].end_date || monthToDate(getCurrentMonthKST()))
                      };
                
                      setModifyWelfares(copy);
                    }}
                  />
                  <span>현재 진행 중</span>
                </label>
          
                <Field label="주요 업무">
                  <textarea
                    value={w.description || ""}
                    onChange={(e)=>{
                      const copy = [...modifyWelfares];
                      copy[i] = { ...copy[i], description: e.target.value };
                      setModifyWelfares(copy);
                    }}
                  />
                </Field>
              </div>
          
              <div className="actions">
                <button
                  className="btn danger"
                  onClick={()=>{
                    setModifyWelfares(modifyWelfares.filter((_, idx)=>idx !== i));
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          
          <button
            className="btn"
            onClick={()=>{
              setModifyWelfares([
                ...modifyWelfares,
                {
                  organization:"",
                  role:"",
                  start_date:"",
                  end_date:"",
                  description:"",
                  is_current:false
                }
              ]);
            }}
          >
            실무경력 추가
          </button>
          
          <h3>강의경력</h3>
          
          {modifyLectures.map((l, i) => (
            <div key={i} className="repeat">
              <div className="grid grid-2">
                <Field label="강의기관">
                  <input
                    value={l.organization || ""}
                    onChange={(e)=>{
                      const copy = [...modifyLectures];
                      copy[i] = { ...copy[i], organization: e.target.value };
                      setModifyLectures(copy);
                    }}
                  />
                </Field>
          
                <Field label="교육대상">
                  <input
                    value={l.target || ""}
                    onChange={(e)=>{
                      const copy = [...modifyLectures];
                      copy[i] = { ...copy[i], target: e.target.value };
                      setModifyLectures(copy);
                    }}
                  />
                </Field>
          
                <Field label="강의주제">
                  <input
                    value={l.topic || ""}
                    onChange={(e)=>{
                      const copy = [...modifyLectures];
                      copy[i] = { ...copy[i], topic: e.target.value };
                      setModifyLectures(copy);
                    }}
                  />
                </Field>
          
                <Field label="강의횟수">
                  <input
                    value={l.count || ""}
                    onChange={(e)=>{
                      const copy = [...modifyLectures];
                      copy[i] = { ...copy[i], count: e.target.value };
                      setModifyLectures(copy);
                    }}
                  />
                </Field>
          
                <MonthSelect
                  label="시작월"
                  value={l.start_date}
                  max={getCurrentMonthKST()}
                  onChange={(date)=>{
                    const copy = [...modifyLectures];
                    const nextStartMonth = toMonthValue(date);
                    const currentEndMonth = toMonthValue(copy[i].end_date);
                
                    copy[i] = {
                      ...copy[i],
                      start_date: date,
                      end_date:
                        currentEndMonth && nextStartMonth && nextStartMonth > currentEndMonth
                          ? null
                          : copy[i].end_date
                    };
                
                    setModifyLectures(copy);
                  }}
                />
                
                <MonthSelect
                  label="종료월"
                  value={l.end_date}
                  min={toMonthValue(l.start_date)}
                  max={getCurrentMonthKST()}
                  disabled={!!l.is_current}
                  onChange={(date)=>{
                    const copy = [...modifyLectures];
                    copy[i] = { ...copy[i], end_date: date };
                    setModifyLectures(copy);
                  }}
                />
                
                <label className="check">
                  <input
                    type="checkbox"
                    checked={!!l.is_current}
                    onChange={(e)=>{
                      const checked = e.target.checked;
                      const copy = [...modifyLectures];
                
                      copy[i] = {
                        ...copy[i],
                        is_current: checked,
                        end_date: checked
                          ? null
                          : (copy[i].end_date || monthToDate(getCurrentMonthKST()))
                      };
                
                      setModifyLectures(copy);
                    }}
                  />
                  <span>현재 진행 중</span>
                </label>
              </div>
          
              <div className="actions">
                <button
                  className="btn danger"
                  onClick={()=>{
                    setModifyLectures(modifyLectures.filter((_, idx)=>idx !== i));
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          
          <button
            className="btn"
            onClick={()=>{
              setModifyLectures([
                ...modifyLectures,
                {
                  organization:"",
                  target:"",
                  topic:"",
                  start_date:"",
                  end_date:"",
                  count:"",
                  is_current:false
                }
              ]);
            }}
          >
            강의경력 추가
          </button>

          
          <div style={{marginTop:16}}>
            <button className="btn primary" onClick={submitRequest}>
              수정 요청 제출
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function AdminPage(){
  const [session,setSession]=useState(null);
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

  async function refreshSession(){
    const {data}=await supabase.auth.getSession();
    setSession(data.session);
  }

  useEffect(()=>{refreshSession()},[]);

  async function login(){
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error)setMessage("로그인 실패: "+error.message);
    else{setMessage("로그인 완료"); refreshSession();}
  }

  async function logout(){
    await supabase.auth.signOut();
    setSession(null);
    setItems([]);
    setEditingItem(null);
    setMessage("로그아웃 완료");
  }

  async function loadAdmin(){
    if(!session){setMessage("관리자 로그인이 필요합니다.");return;}

    const {data,error}=await supabase
      .from("instructors")
      .select(`
        *,
        training_courses(*),
        welfare_experiences(*),
        lecture_experiences(*)
      `)
      .order("created_at",{ascending:false});

    if(error)setMessage("조회 실패: "+error.message);
    else setItems(data||[]);
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
  
  async function loadRequests(){
    const {data,error} = await supabase
      .from("instructor_update_requests")
      .select(`
        *,
        instructors(
          *,
          training_courses(*),
          welfare_experiences(*),
          lecture_experiences(*)
        )
      `)
      .order("requested_at",{ascending:false});

    if(error){
      setMessage("수정 요청 조회 실패: " + error.message);
      }else{
    setUpdateRequests(data || []);
    }
  }
  async function approveRequest(req){
  if(!confirm("이 수정 요청을 승인하고 실제 강사 정보에 반영하시겠습니까?")){
    return;
  }
  setMessage("");
  // 실제 instructors 테이블 업데이트
  const requested = req.requested_data;
  const instructorData = requested.instructor || requested;
  const { error: updateError } = await supabase
    .from("instructors")
    .update({
      name: instructorData.name,
      phone: instructorData.phone,
      email: instructorData.email,
      region: instructorData.region,
      activity_regions: instructorData.activity_regions,
      organization: instructorData.organization,
      position: instructorData.position,
      main_topic: instructorData.main_topic,
      specialties: instructorData.specialties,
      other_specialty: instructorData.other_specialty,
      targets: instructorData.targets,
      types: instructorData.types,
      intro: instructorData.intro,
      show_phone: instructorData.show_phone,
      show_email: instructorData.show_email,
      show_profile: instructorData.show_profile,
      center_verified: instructorData.center_verified
    })
    .eq("id", req.instructor_id);
  if(updateError){
    setMessage("반영 실패: " + updateError.message);
    return;
  }
  // 1. 양성과정 반영
  await supabase
    .from("training_courses")
    .delete()
    .eq("instructor_id", req.instructor_id);
  
  const trainings = req.requested_data.training_courses || [];
  
  if (trainings.length) {
    await supabase
      .from("training_courses")
      .insert(
        trainings.map((t) => ({
          instructor_id: req.instructor_id,
          course_name: t.course_name || "",
          institution: t.institution || "",
          completion_year: t.completion_year || ""
        }))
      );
  }
  
  // 2. 실무경력 반영
  await supabase
    .from("welfare_experiences")
    .delete()
    .eq("instructor_id", req.instructor_id);
  
  const welfares = req.requested_data.welfare_experiences || [];
  
  if (welfares.length) {
    await supabase
      .from("welfare_experiences")
      .insert(
        welfares.map((w) => ({
          instructor_id: req.instructor_id,
          organization: w.organization || "",
          role: w.role || "",
          start_date: w.start_date || null,
          end_date: w.end_date || null,
          description: w.description || ""
        }))
      );
  }
  
  // 3. 강의경력 반영
  await supabase
    .from("lecture_experiences")
    .delete()
    .eq("instructor_id", req.instructor_id);
  
  const lectures = req.requested_data.lecture_experiences || [];
  
  if (lectures.length) {
    await supabase
      .from("lecture_experiences")
      .insert(
        lectures.map((l) => ({
          instructor_id: req.instructor_id,
          organization: l.organization || "",
          target: l.target || "",
          topic: l.topic || "",
          start_date: l.start_date || null,
          end_date: l.end_date || null,
          count: l.count || ""
        }))
      );
  }
      
      
  // 2. 요청 상태 변경
  const { error: statusError } = await supabase
    .from("instructor_update_requests")
    .update({
      request_status: "승인",
      reviewed_at: new Date().toISOString()
    })
    .eq("id", req.id);
  if(statusError){
    setMessage("상태 변경 실패: " + statusError.message);
    return;
  }
  setMessage("수정 요청 반영 완료");
  // 새로고침
  loadRequests();
  loadAdmin();
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
  const reason = prompt("반려 사유를 입력하세요.");

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
    setMessage("반려 처리 실패: " + error.message);
    return;
  }

  setMessage("수정 요청을 반려 처리했습니다.");
  loadRequests();
}
  
  async function updateStatus(id,status){
    const {error}=await supabase
      .from("instructors")
      .update({public_status:status})
      .eq("id",id);

    if(error)setMessage("상태 변경 실패: "+error.message);
    else{setMessage(`${status} 처리 완료`); loadAdmin();}
  }

  async function deleteItem(id){
    if(!confirm("정말 삭제하시겠습니까?"))return;

    const {error}=await supabase
      .from("instructors")
      .delete()
      .eq("id",id);

    if(error)setMessage("삭제 실패: "+error.message);
    else{setMessage("삭제 완료"); loadAdmin();}
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
      
      setMessage("수정 완료");
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
  
  return (
    <div>
      <section className="hero">
        <h1>관리자 페이지</h1>
        <p>강사 승인, 비공개, 수정, 삭제, CSV 다운로드를 수행합니다.</p>
      </section>

      {message?<div className="notice">{message}</div>:null}

      <section className="card">
        <h2>관리자 로그인</h2>
        <p className="muted small">현재 상태: {session?`${session.user.email} 로그인`:"미로그인"}</p>
        <div className="grid grid-3">
          <Field label="이메일"><input value={email} onChange={(e)=>setEmail(e.target.value)}/></Field>
          <Field label="비밀번호"><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/></Field>
          <div style={{display:"flex",gap:8,alignItems:"end"}}>
            <button className="btn primary" onClick={login}>로그인</button>
            <button className="btn" onClick={logout}>로그아웃</button>
          </div>
        </div>
      </section>

{editingItem && (
  <section className="card">
    <h2>강사 정보 수정</h2>
    <p className="muted small">
      관리자가 수정한 내용은 즉시 공개 정보에 반영됩니다.
      중앙센터 수료 확인은 중앙센터에서 확인 가능한 경우에만 체크합니다.
    </p>

          <div className="grid grid-2">
            <Field label="성명"><input value={editingItem.name||""} onChange={(e)=>updateEdit("name",e.target.value)}/></Field>
            <Field label="연락처"><input value={editingItem.phone||""} onChange={(e)=>updateEdit("phone",e.target.value)}/></Field>
            <Field label="이메일"><input value={editingItem.email||""} onChange={(e)=>updateEdit("email",e.target.value)}/></Field>
            <Field label="거주지역">
              <select value={editingItem.region||""} onChange={(e)=>updateEdit("region",e.target.value)}>
                <option value="">선택</option>
                {regionOptions.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="소속기관"><input value={editingItem.organization||""} onChange={(e)=>updateEdit("organization",e.target.value)}/></Field>
            <Field label="직위/직업군"><input value={editingItem.position||""} onChange={(e)=>updateEdit("position",e.target.value)}/></Field>
          </div>

          <Field label="활동 가능 지역">
            <CheckboxGroup options={regionOptions} values={editingItem.activity_regions||[]} onChange={(v)=>updateEdit("activity_regions",v)}/>
          </Field>

          <Field label="교육대상">
            <CheckboxGroup options={targetOptions} values={editingItem.targets||[]} onChange={(v)=>updateEdit("targets",v)}/>
          </Field>

          <Field label="교육유형">
            <CheckboxGroup options={typeOptions} values={editingItem.types||[]} onChange={(v)=>updateEdit("types",v)}/>
          </Field>

          <Field label="강의 분야">
            <CheckboxGroup options={specialtyOptions} values={editingItem.specialties||[]} onChange={(v)=>updateEdit("specialties",v)}/>
          </Field>

          <div className="grid grid-2">
            <Field label="그 외 주제"><input value={editingItem.other_specialty||""} onChange={(e)=>updateEdit("other_specialty",e.target.value)}/></Field>
            <Field label="주요 강의주제"><input value={editingItem.main_topic||""} maxLength={80} onChange={(e)=>updateEdit("main_topic",e.target.value)}/></Field>
          </div>

          <Field label="강사 소개">
            <textarea value={editingItem.intro||""} onChange={(e)=>updateEdit("intro",e.target.value)}/>
          </Field>
    <h3>양성과정 수료 정보</h3>
    
    {editingTrainings.map((t, i) => (
      <div key={i} className="repeat">
        <div className="grid grid-3">
          <Field label="양성과정명">
            <input
              value={t.course_name || ""}
              onChange={(e)=>{
                const copy = [...editingTrainings];
                copy[i] = { ...copy[i], course_name: e.target.value };
                setEditingTrainings(copy);
              }}
            />
          </Field>
    
          <Field label="수료기관">
            <input
              value={t.institution || ""}
              onChange={(e)=>{
                const copy = [...editingTrainings];
                copy[i] = { ...copy[i], institution: e.target.value };
                setEditingTrainings(copy);
              }}
            />
          </Field>
    
          <Field label="수료연도">
            <input
              value={t.completion_year || ""}
              onChange={(e)=>{
                const copy = [...editingTrainings];
                copy[i] = { ...copy[i], completion_year: e.target.value };
                setEditingTrainings(copy);
              }}
            />
          </Field>
        </div>
    
        <div className="actions">
          <button
            className="btn danger"
            onClick={()=>{
              setEditingTrainings(editingTrainings.filter((_, idx)=>idx !== i));
            }}
          >
            삭제
          </button>
        </div>
      </div>
    ))}
    
    <button
      className="btn"
      onClick={()=>{
        setEditingTrainings([
          ...editingTrainings,
          { course_name:"", institution:"", completion_year:"" }
        ]);
      }}
    >
      양성과정 추가
    </button>
    <h3>실무경력</h3>

    {editingWelfares.map((w, i) => (
      <div key={i} className="repeat">
        <div className="grid grid-2">
    
          <Field label="기관명">
            <input
              value={w.organization || ""}
              onChange={(e)=>{
                const copy = [...editingWelfares];
                copy[i] = { ...copy[i], organization: e.target.value };
                setEditingWelfares(copy);
              }}
            />
          </Field>
    
          <Field label="역할">
            <input
              value={w.role || ""}
              onChange={(e)=>{
                const copy = [...editingWelfares];
                copy[i] = { ...copy[i], role: e.target.value };
                setEditingWelfares(copy);
              }}
            />
          </Field>
    
          <MonthSelect
            label="시작월"
            value={w.start_date}
            max={getCurrentMonthKST()}
            onChange={(date)=>{
              const copy = [...editingWelfares];
              const nextStartMonth = toMonthValue(date);
              const currentEndMonth = toMonthValue(copy[i].end_date);
          
              copy[i] = {
                ...copy[i],
                start_date: date,
                end_date:
                  currentEndMonth && nextStartMonth && nextStartMonth > currentEndMonth
                    ? null
                    : copy[i].end_date
              };
          
              setEditingWelfares(copy);
            }}
          />
          
          <MonthSelect
            label="종료월"
            value={w.end_date}
            min={toMonthValue(w.start_date)}
            max={getCurrentMonthKST()}
            disabled={!!w.is_current}
            onChange={(date)=>{
              const copy = [...editingWelfares];
              copy[i] = { ...copy[i], end_date: date };
              setEditingWelfares(copy);
            }}
          />
          
          <label className="check">
            <input
              type="checkbox"
              checked={!!w.is_current}
              onChange={(e)=>{
                const checked = e.target.checked;
                const copy = [...editingWelfares];
          
                copy[i] = {
                  ...copy[i],
                  is_current: checked,
                  end_date: checked
                    ? null
                    : (copy[i].end_date || monthToDate(getCurrentMonthKST()))
                };
          
                setEditingWelfares(copy);
              }}
            />
            <span>현재 진행 중</span>
          </label>
    
          <Field label="주요 업무">
            <textarea
              value={w.description || ""}
              onChange={(e)=>{
                const copy = [...editingWelfares];
                copy[i] = { ...copy[i], description: e.target.value };
                setEditingWelfares(copy);
              }}
            />
          </Field>
    
        </div>
    
        <div className="actions">
          <button
            className="btn danger"
            onClick={()=>{
              setEditingWelfares(editingWelfares.filter((_, idx)=>idx !== i));
            }}
          >
            삭제
          </button>
        </div>
      </div>
    ))}
    
    <button
      className="btn"
      onClick={()=>{
        setEditingWelfares([
          ...editingWelfares,
          {
            organization:"",
            role:"",
            start_date:"",
            end_date:"",
            description:"",
            is_current:false
          }
        ]);
      }}
    >
      실무경력 추가
    </button>

    <h3>강의경력</h3>

    {editingLectures.map((l, i) => (
      <div key={i} className="repeat">
        <div className="grid grid-2">
    
          <Field label="강의기관">
            <input
              value={l.organization || ""}
              onChange={(e)=>{
                const copy = [...editingLectures];
                copy[i] = { ...copy[i], organization: e.target.value };
                setEditingLectures(copy);
              }}
            />
          </Field>
    
          <Field label="교육대상">
            <input
              value={l.target || ""}
              onChange={(e)=>{
                const copy = [...editingLectures];
                copy[i] = { ...copy[i], target: e.target.value };
                setEditingLectures(copy);
              }}
            />
          </Field>
    
          <Field label="강의주제">
            <input
              value={l.topic || ""}
              onChange={(e)=>{
                const copy = [...editingLectures];
                copy[i] = { ...copy[i], topic: e.target.value };
                setEditingLectures(copy);
              }}
            />
          </Field>
    
          <Field label="강의횟수">
            <input
              value={l.count || ""}
              onChange={(e)=>{
                const copy = [...editingLectures];
                copy[i] = { ...copy[i], count: e.target.value };
                setEditingLectures(copy);
              }}
            />
          </Field>
    
          <MonthSelect
            label="시작월"
            value={l.start_date}
            max={getCurrentMonthKST()}
            onChange={(date)=>{
              const copy = [...editingLectures];
              const nextStartMonth = toMonthValue(date);
              const currentEndMonth = toMonthValue(copy[i].end_date);
          
              copy[i] = {
                ...copy[i],
                start_date: date,
                end_date:
                  currentEndMonth && nextStartMonth && nextStartMonth > currentEndMonth
                    ? null
                    : copy[i].end_date
              };
          
              setEditingLectures(copy);
            }}
          />
          
          <MonthSelect
            label="종료월"
            value={l.end_date}
            min={toMonthValue(l.start_date)}
            max={getCurrentMonthKST()}
            disabled={!!l.is_current}
            onChange={(date)=>{
              const copy = [...editingLectures];
              copy[i] = { ...copy[i], end_date: date };
              setEditingLectures(copy);
            }}
          />
          
          <label className="check">
            <input
              type="checkbox"
              checked={!!l.is_current}
              onChange={(e)=>{
                const checked = e.target.checked;
                const copy = [...editingLectures];
          
                copy[i] = {
                  ...copy[i],
                  is_current: checked,
                  end_date: checked
                    ? null
                    : (copy[i].end_date || monthToDate(getCurrentMonthKST()))
                };
          
                setEditingLectures(copy);
              }}
            />
            <span>현재 진행 중</span>
          </label>
    
        </div>
    
        <div className="actions">
          <button
            className="btn danger"
            onClick={()=>{
              setEditingLectures(editingLectures.filter((_, idx)=>idx !== i));
            }}
          >
            삭제
          </button>
        </div>
      </div>
    ))}
    
    <button
      className="btn"
      onClick={()=>{
        setEditingLectures([
          ...editingLectures,
          {
            organization:"",
            target:"",
            topic:"",
            start_date:"",
            end_date:"",
            count:"",
            is_current:false
          }
        ]);
      }}
    >
      강의경력 추가
    </button>
    
          <div className="check-grid">
            <label className="check"><input type="checkbox" checked={editingItem.show_phone} onChange={(e)=>updateEdit("show_phone",e.target.checked)}/> 연락처 공개</label>
            <label className="check"><input type="checkbox" checked={editingItem.show_email} onChange={(e)=>updateEdit("show_email",e.target.checked)}/> 이메일 공개</label>
            <label className="check"><input type="checkbox" checked={editingItem.show_profile} onChange={(e)=>updateEdit("show_profile",e.target.checked)}/> 프로필 공개</label>
            <label className="check"><input type="checkbox" checked={!!editingItem.center_verified} onChange={(e)=>updateEdit("center_verified",e.target.checked)}/> 중앙센터 수료 확인</label>
          </div>

          <div className="actions">
            <button className="btn" onClick={()=>setEditingItem(null)}>취소</button>
            <button className="btn primary" onClick={saveEdit}>저장</button>
          </div>
        </section>
      )}

      <section className="card">
        <div className="actions">
          <button className="btn primary" onClick={loadAdmin}>목록 불러오기</button>
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
                {filteredUpdateRequests.map((req)=>(
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
              {filteredItems.map((item)=>(
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
      </section>
    </div>
  )
}
function App(){
  const [page,setPage]=useState(()=>window.location.hash.replace("#","")||"search")

  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) return

      const { data } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) setIsAdmin(true)
    }

    checkUser()
  }, [])

  function go(next){
    window.location.hash = next
    setPage(next)
  }

  return (
    <div>
      <nav>
        <button onClick={()=>go("search")}>검색</button>
        <button onClick={()=>go("register")}>등록</button>
        <button  className={page==="modify"?"active":""}  onClick={()=>go("modify")}>
  정보 수정 요청
</button>

<button  className={page==="admin"?"active":""}  onClick={()=>go("admin")}>  관리자</button>
      </nav>

      <main>
        {page==="search" && <SearchPage />}
        {page==="register" && <RegisterPage />}
        {page==="admin" && <AdminPage />}
        {page==="modify" && <ModifyPage />}
      </main>
    </div>
  )
}


createRoot(document.getElementById("root")).render(<App />);
