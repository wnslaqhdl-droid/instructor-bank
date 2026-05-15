export default function RegisterBasicInfo({
  form,
  update,
  password,
  setPassword,
  regionOptions,
  Field
}) {

return <div><section className="hero">
    <h1>성인권 교육 강사 등록</h1><p>입력하신 정보는 관리자 검토 후 강사뱅크에 공개됩니다. 실무경력 및 강의경력은 강사 본인의 자기신고 내용을 기준으로 관리되며, 중앙센터는 발달장애인 성인권 부모교육지원사업 내 양성과정 수료 여부만 확인합니다.</p>
              </section>
    {message ? <div className="notice">{message}</div> : null}{error ? <div className="error">{error}</div> : null}
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
        <Field label="비밀번호" required>
          <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="8자 이상 입력"
          />
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
            const copy = [...welfareExperiences];
      
            copy[index] = {
              ...copy[index],
              is_current: checked,
              end_date: checked
                ? null
                : (copy[index].end_date || monthToDate(getCurrentMonthKST()))
            };
      
            setWelfareExperiences(copy);
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
            const copy = [...lectureExperiences];
      
            copy[index] = {
              ...copy[index],
              is_current: checked,
              end_date: checked
                ? null
                : (copy[index].end_date || monthToDate(getCurrentMonthKST()))
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
