import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabase";
import { regionOptions, targetOptions, typeOptions, specialtyOptions, emptyInstructor, emptyTraining, emptyWelfare, emptyLecture } from "./constants";
import "./styles.css";

const clone = (v) => JSON.parse(JSON.stringify(v));

function Field({ label, required, help, children }) {
  return <label className="field"><span>{label}{required ? " *" : ""}</span>{children}{help ? <div className="help">{help}</div> : null}</label>;
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
    setMessage(""); setError("");
    if (!form.name || !form.email || !form.phone || !form.region || !form.main_topic) { setError("성명, 연락처, 이메일, 거주지역, 주요 강의주제는 필수입니다."); return; }
    const { data: inserted, error: insertError } = await supabase.from("instructors").insert([{ ...form, public_status: "검토중", update_status: "정상" }]).select("id").single();
    if (insertError) { setError("강사 기본정보 저장 실패: " + insertError.message); return; }
    const instructor_id = inserted.id;
    const validTrainings = trainingCourses.filter((x) => x.course_name || x.institution || x.completion_year).map((x) => ({ instructor_id, ...x }));
    const validWelfare = welfareExperiences.filter((x) => x.organization || x.role || x.start_date || x.end_date || x.description).map((x) => ({ instructor_id, ...x, start_date: x.start_date || null, end_date: x.end_date || null }));
    const validLectures = lectureExperiences.filter((x) => x.organization || x.target || x.topic || x.start_date || x.end_date || x.count).map((x) => ({ instructor_id, ...x, start_date: x.start_date || null, end_date: x.end_date || null }));
    if (validTrainings.length) { const { error } = await supabase.from("training_courses").insert(validTrainings); if (error) setError("양성과정 저장 오류: " + error.message); }
    if (validWelfare.length) { const { error } = await supabase.from("welfare_experiences").insert(validWelfare); if (error) setError("실무경력 저장 오류: " + error.message); }
    if (validLectures.length) { const { error } = await supabase.from("lecture_experiences").insert(validLectures); if (error) setError("강의경력 저장 오류: " + error.message); }
    setMessage("등록 신청이 완료되었습니다. 관리자 검토 후 공개됩니다.");
    setForm(clone(emptyInstructor)); setTrainingCourses([clone(emptyTraining)]); setWelfareExperiences([clone(emptyWelfare)]); setLectureExperiences([clone(emptyLecture)]);
  }

  return <div><section className="hero"><h1>성인권 교육 강사 등록</h1><p>입력하신 정보는 관리자 검토 후 강사뱅크에 공개됩니다. 실무경력 및 강의경력은 강사 본인의 자기신고 내용을 기준으로 관리되며, 중앙센터는 발달장애인 성인권 부모교육지원사업 내 양성과정 수료 여부만 확인합니다.</p></section>{message ? <div className="notice">{message}</div> : null}{error ? <div className="error">{error}</div> : null}
    <section className="card"><h2>1. 기본정보</h2><div className="grid grid-2"><Field label="성명" required><input value={form.name} onChange={(e) => update("name", e.target.value)} /></Field><Field label="연락처" required><input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="010-0000-0000" /></Field><Field label="이메일" required><input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="example@email.com" /></Field><Field label="거주지역" required><select value={form.region} onChange={(e) => update("region", e.target.value)}><option value="">선택</option>{regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field><Field label="소속기관"><input value={form.organization} onChange={(e) => update("organization", e.target.value)} /></Field><Field label="직위/직업군"><input value={form.position} onChange={(e) => update("position", e.target.value)} /></Field></div></section>
    <Repeater title="2. 양성과정 수료 정보" help="수료한 과정명을 이력 단위로 입력합니다." items={trainingCourses} setItems={setTrainingCourses} emptyItem={emptyTraining} render={(item, index, updateItem) => <div className="grid grid-3"><Field label="양성과정명"><input value={item.course_name} onChange={(e) => updateItem(index, "course_name", e.target.value)} /></Field><Field label="수료기관"><input value={item.institution} onChange={(e) => updateItem(index, "institution", e.target.value)} /></Field><Field label="수료연도"><input value={item.completion_year} onChange={(e) => updateItem(index, "completion_year", e.target.value)} /></Field></div>} />
    <Repeater title="3. 장애인복지 분야 실무경력 자기신고" help="중앙센터가 개별 검증하지 않는 자기신고 영역입니다." items={welfareExperiences} setItems={setWelfareExperiences} emptyItem={emptyWelfare} render={(item, index, updateItem) => <div className="grid grid-2"><Field label="기관명"><input value={item.organization} onChange={(e) => updateItem(index, "organization", e.target.value)} /></Field><Field label="역할"><input value={item.role} onChange={(e) => updateItem(index, "role", e.target.value)} /></Field><Field label="시작일"><input type="date" value={item.start_date} onChange={(e) => updateItem(index, "start_date", e.target.value)} /></Field><Field label="종료일"><input type="date" value={item.end_date} onChange={(e) => updateItem(index, "end_date", e.target.value)} /></Field><Field label="주요 업무"><textarea value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} /></Field></div>} />
    <Repeater title="4. 발달장애인 대상 성교육 강의경력 자기신고" items={lectureExperiences} setItems={setLectureExperiences} emptyItem={emptyLecture} render={(item, index, updateItem) => <div className="grid grid-3"><Field label="강의기관"><input value={item.organization} onChange={(e) => updateItem(index, "organization", e.target.value)} /></Field><Field label="교육대상"><input value={item.target} onChange={(e) => updateItem(index, "target", e.target.value)} /></Field><Field label="강의주제"><input value={item.topic} onChange={(e) => updateItem(index, "topic", e.target.value)} /></Field><Field label="시작일"><input type="date" value={item.start_date} onChange={(e) => updateItem(index, "start_date", e.target.value)} /></Field><Field label="종료일"><input type="date" value={item.end_date} onChange={(e) => updateItem(index, "end_date", e.target.value)} /></Field><Field label="강의횟수"><input value={item.count} onChange={(e) => updateItem(index, "count", e.target.value)} /></Field></div>} />
    <section className="card"><h2>5. 강의 정보 및 공개 설정</h2><p className="muted small">연락처와 이메일은 강사가 공개에 동의한 경우에만 검색 페이지에 표시됩니다. 공개를 원하지 않는 항목은 체크하지 않아도 됩니다.</p><div className="grid"><Field label="활동 가능 지역"><CheckboxGroup options={regionOptions} values={form.activity_regions} onChange={(v) => update("activity_regions", v)} /></Field><Field label="교육대상"><CheckboxGroup options={targetOptions} values={form.targets} onChange={(v) => update("targets", v)} /></Field><Field label="교육유형"><CheckboxGroup options={typeOptions} values={form.types} onChange={(v) => update("types", v)} /></Field><Field label="강의 분야" help="이 항목은 검색 필터에 표시됩니다."><CheckboxGroup options={specialtyOptions} values={form.specialties} onChange={(v) => update("specialties", v)} /></Field><Field label="그 외 주제" help="검색 필터에는 표시하지 않고 키워드 검색에만 활용합니다."><input value={form.other_specialty} onChange={(e) => update("other_specialty", e.target.value)} /></Field><Field label="주요 강의주제 한 줄" required><input value={form.main_topic} onChange={(e) => update("main_topic", e.target.value)} /></Field><Field label="강사 소개"><textarea value={form.intro} onChange={(e) => update("intro", e.target.value)} /></Field><div className="check-grid"><label className="check"><input type="checkbox" checked={form.show_phone} onChange={(e) => update("show_phone", e.target.checked)} /> 연락처 공개</label><label className="check"><input type="checkbox" checked={form.show_email} onChange={(e) => update("show_email", e.target.checked)} /> 이메일 공개</label><label className="check"><input type="checkbox" checked={form.show_profile} onChange={(e) => update("show_profile", e.target.checked)} /> 공개 프로필 게시</label></div></div></section>
    <div className="actions"><button className="btn primary" onClick={submitForm}>등록 신청</button></div></div>;
}

function SearchPage(){
 const [items,setItems]=useState([]); const [keyword,setKeyword]=useState(""); const [region,setRegion]=useState(""); const [target,setTarget]=useState(""); const [type,setType]=useState(""); const [specialty,setSpecialty]=useState(""); const [message,setMessage]=useState("");
 async function load(){ const {data,error}=await supabase.from("instructors").select("*").eq("public_status","공개").eq("show_profile",true).order("created_at",{ascending:false}); if(error)setMessage("검색 실패: "+error.message); else setItems(data||[]); }
 useEffect(()=>{load()},[]);
 const filtered=items.filter((item)=>{ const text=[item.name,item.region,item.main_topic,item.other_specialty,item.intro,(item.targets||[]).join(" "),(item.types||[]).join(" "),(item.specialties||[]).join(" ")].join(" "); return (!keyword||text.includes(keyword))&&(!region||item.region===region||(item.activity_regions||[]).includes(region))&&(!target||(item.targets||[]).includes(target))&&(!type||(item.types||[]).includes(type))&&(!specialty||(item.specialties||[]).includes(specialty)); });
 return <div><section className="hero"><h1>성인권 교육 강사 검색</h1><p>공개 승인된 강사를 지역, 교육대상, 교육유형, 강의 분야로 검색합니다.</p></section>{message?<div className="error">{message}</div>:null}<section className="card"><div className="grid grid-4"><Field label="키워드"><input value={keyword} onChange={(e)=>setKeyword(e.target.value)} placeholder="이름, 주제, 소개 검색"/></Field><Field label="지역"><select value={region} onChange={(e)=>setRegion(e.target.value)}><option value="">전체</option>{regionOptions.map((r)=><option key={r} value={r}>{r}</option>)}</select></Field><Field label="교육대상"><select value={target} onChange={(e)=>setTarget(e.target.value)}><option value="">전체</option>{targetOptions.map((r)=><option key={r} value={r}>{r}</option>)}</select></Field><Field label="교육유형"><select value={type} onChange={(e)=>setType(e.target.value)}><option value="">전체</option>{typeOptions.map((r)=><option key={r} value={r}>{r}</option>)}</select></Field></div><div className="grid grid-2" style={{marginTop:14}}><Field label="강의 분야"><select value={specialty} onChange={(e)=>setSpecialty(e.target.value)}><option value="">전체</option>{specialtyOptions.map((r)=><option key={r} value={r}>{r}</option>)}</select></Field><div style={{display:"flex",alignItems:"end",justifyContent:"flex-end"}}><button className="btn" onClick={()=>{setKeyword("");setRegion("");setTarget("");setType("");setSpecialty("")}}>필터 초기화</button></div></div></section><div className="list">{filtered.length===0?<div className="card muted">검색 결과가 없습니다.</div>:null}{filtered.map((item)=><article className="instructor-card compact-card" key={item.id}>
  <div className="compact-row">
    <span className="compact-name">{item.name || "-"}</span>
    <span className="col-topic">{item.main_topic || "-"}</span>
    <span className="col-region">{(item.activity_regions || []).join(", ") || item.region || "-"}</span>
    <span className="col-target">{(item.targets || []).join(", ") || "-"}</span>
    <span className="col-type">{(item.types || []).join(", ") || "-"}</span>
  </div>
</article>)}</div></div>;
}

function AdminPage(){
  const [session,setSession]=useState(null);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [items,setItems]=useState([]);
  const [message,setMessage]=useState("");
  const [editingItem,setEditingItem]=useState(null);
  const [adminKeyword,setAdminKeyword]=useState("");
  const [adminStatus,setAdminStatus]=useState("");

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

  function startEdit(item){
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
            <Field label="주요 강의주제"><input value={editingItem.main_topic||""} onChange={(e)=>updateEdit("main_topic",e.target.value)}/></Field>
          </div>

          <Field label="강사 소개">
            <textarea value={editingItem.intro||""} onChange={(e)=>updateEdit("intro",e.target.value)}/>
          </Field>

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
          <button className="btn" onClick={downloadCSV}>CSV 다운로드</button>
        </div>
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
                  <td>{item.welfare_experiences?.length?item.welfare_experiences.map(w=><div key={w.id}>{w.organization||"-"} / {w.role||"-"}</div>):"-"}</td>
                  <td>{item.lecture_experiences?.length?item.lecture_experiences.map(l=><div key={l.id}>{l.organization||"-"} / {l.topic||"-"} / {l.count||"-"}</div>):"-"}</td>
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

        {isAdmin && (
          <button
            className={page==="admin"?"active":""}
            onClick={()=>go("admin")}
          >
            관리자
          </button>
        )}
      </nav>

      <main>
        {page==="search" && <SearchPage />}
        {page==="register" && <RegisterPage />}

        {page==="admin" ? (
          isAdmin ? (
            <AdminPage />
          ) : (
            <div>관리자 권한이 필요합니다.</div>
          )
        ) : null}
      </main>
    </div>
  )
}


createRoot(document.getElementById("root")).render(<App />);
