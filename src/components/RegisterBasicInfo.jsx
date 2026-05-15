export default function RegisterBasicInfo({
  form,
  update,
  password,
  setPassword,
  regionOptions,
  Field
}) {

  return (

    <div>

      <section className="hero">

        <h1>
          성인권 교육 강사 등록
        </h1>

        <p>
          입력하신 정보는 관리자 검토 후 강사뱅크에 공개됩니다.
          실무경력 및 강의경력은 강사 본인의 자기신고 내용을
          기준으로 관리되며,
          중앙센터는 발달장애인 성인권 부모교육지원사업 내
          양성과정 수료 여부만 확인합니다.
        </p>

      </section>

      <section className="card">

        <h2>1. 기본정보</h2>

        <div className="grid grid-2">

          <Field label="성명" required>
            <input
              value={form.name}
              onChange={(e)=>
                update("name", e.target.value)
              }
            />
          </Field>

          <Field label="연락처" required>
            <input
              value={form.phone}
              onChange={(e)=>
                update("phone", e.target.value)
              }
              placeholder="010-0000-0000"
            />
          </Field>

          <Field label="이메일" required>
            <input
              value={form.email}
              onChange={(e)=>
                update("email", e.target.value)
              }
              placeholder="example@email.com"
            />
          </Field>

          <Field label="비밀번호" required>
            <input
              type="password"
              value={password}
              onChange={(e)=>
                setPassword(e.target.value)
              }
              placeholder="8자 이상 입력"
            />
          </Field>

          <Field label="거주지역" required>

            <select
              value={form.region}
              onChange={(e)=>
                update("region", e.target.value)
              }
            >

              <option value="">
                선택
              </option>

              {regionOptions.map((r)=>(
                <option key={r} value={r}>
                  {r}
                </option>
              ))}

            </select>

          </Field>

          <Field label="소속기관">
            <input
              value={form.organization}
              onChange={(e)=>
                update(
                  "organization",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="직위/직업군">
            <input
              value={form.position}
              onChange={(e)=>
                update(
                  "position",
                  e.target.value
                )
              }
            />
          </Field>

        </div>

      </section>

    </div>
  );
}
