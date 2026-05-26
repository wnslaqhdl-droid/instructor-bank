export default function RegisterProfileSettings({
  form,
  update,
  regionOptions,
  targetOptions,
  typeOptions,
  specialtyOptions,
  Field,
  CheckboxGroup,
  submitForm
}) {

  return (
    <>
      <section className="card">

        <h2>
          5. 강의 정보 및 공개 설정
        </h2>

        <p className="muted small">
          연락처와 이메일은
          강사가 공개에 동의한 경우에만
          검색 페이지에 표시됩니다.
        </p>

        <div className="grid">
          <Field label="활동 가능 지역">
            <CheckboxGroup
              options={regionOptions}
              values={form.activity_regions}
              onChange={(v)=>
                update(
                  "activity_regions",
                  v
                )
              }
            />
          </Field>

          <Field label="교육대상">
            <CheckboxGroup
              options={targetOptions}
              values={form.targets}
              onChange={(v)=>
                update("targets", v)
              }
            />
          </Field>

          <Field label="교육유형">
            <CheckboxGroup
              options={typeOptions}
              values={form.types}
              onChange={(v)=>
                update("types", v)
              }
            />
          </Field>

          <Field
            label="강의 분야"
            help="검색 필터에 표시됩니다."
          >
            <CheckboxGroup
              options={specialtyOptions}
              values={form.specialties}
              onChange={(v)=>
                update(
                  "specialties",
                  v
                )
              }
            />
          </Field>

          <Field
            label="그 외 주제"
            help="키워드 검색에만 활용됩니다."
          >
            <input
              value={form.other_specialty}
              onChange={(e)=>
                update(
                  "other_specialty",
                  e.target.value
                )
              }
            />
          </Field>

          <Field
            label="주요 강의주제 한 줄"
            required
          >
            <input
              value={form.main_topic}
              maxLength={80}
              onChange={(e)=>
                update(
                  "main_topic",
                  e.target.value
                )
              }
            />

            <div className="help">
              {(form.main_topic || "").length}
              {" / 80"}
            </div>
          </Field>

          <Field label="강사 소개">
            <textarea
              value={form.intro}
              onChange={(e)=>
                update(
                  "intro",
                  e.target.value
                )
              }
            />
          </Field>

          <div className="check-grid">

            <label className="check">
              <input
                type="checkbox"
                checked={form.show_phone}
                onChange={(e)=>
                  update(
                    "show_phone",
                    e.target.checked
                  )
                }
              />

              연락처 공개
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={form.show_email}
                onChange={(e)=>
                  update(
                    "show_email",
                    e.target.checked
                  )
                }
              />

              이메일 공개
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={form.show_profile}
                onChange={(e)=>
                  update(
                    "show_profile",
                    e.target.checked
                  )
                }
              />

              공개 프로필 게시
            </label>

          </div>

        </div>

      </section>

      <div className="actions">
        <button
          className="btn primary"
          onClick={submitForm}
        >
          등록 신청
        </button>
      </div>
    </>
  );
}
