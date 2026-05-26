export default function ModifyBasicInfo({
  found,
  updateField,
  regionOptions,
  targetOptions,
  typeOptions,
  specialtyOptions,
  Field,
  CheckboxGroup
}) {

  if (!found) {
    return null;
  }

  return (
    <>

      <h2>
        2. 정보 수정
      </h2>

      <div className="grid grid-2">

        <Field label="성명">
          <input
            value={found.name || ""}
            onChange={(e)=>
              updateField(
                "name",
                e.target.value
              )
            }
          />
        </Field>

        <Field label="연락처">
          <input
            value={found.phone || ""}
            onChange={(e)=>
              updateField(
                "phone",
                e.target.value
              )
            }
          />
        </Field>

        <Field label="이메일">
          <input
            value={found.email || ""}
            onChange={(e)=>
              updateField(
                "email",
                e.target.value
              )
            }
          />
        </Field>

        <Field label="거주지역">
          <select
            value={found.region || ""}
            onChange={(e)=>
              updateField(
                "region",
                e.target.value
              )
            }
          >
            <option value="">
              선택
            </option>

            {regionOptions.map((r)=>(
              <option
                key={r}
                value={r}
              >
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="소속기관">
          <input
            value={
              found.organization || ""
            }
            onChange={(e)=>
              updateField(
                "organization",
                e.target.value
              )
            }
          />
        </Field>

        <Field label="직위/직업군">
          <input
            value={
              found.position || ""
            }
            onChange={(e)=>
              updateField(
                "position",
                e.target.value
              )
            }
          />
        </Field>

      </div>

      <Field label="활동 가능 지역">
        <CheckboxGroup
          options={regionOptions}
          values={
            found.activity_regions || []
          }
          onChange={(v)=>
            updateField(
              "activity_regions",
              v
            )
          }
        />
      </Field>

      <Field label="교육대상">
        <CheckboxGroup
          options={targetOptions}
          values={found.targets || []}
          onChange={(v)=>
            updateField(
              "targets",
              v
            )
          }
        />
      </Field>

      <Field label="교육유형">
        <CheckboxGroup
          options={typeOptions}
          values={found.types || []}
          onChange={(v)=>
            updateField(
              "types",
              v
            )
          }
        />
      </Field>

      <Field label="강의 분야">
        <CheckboxGroup
          options={specialtyOptions}
          values={
            found.specialties || []
          }
          onChange={(v)=>
            updateField(
              "specialties",
              v
            )
          }
        />
      </Field>

      <div className="grid grid-2">

        <Field label="그 외 주제">
          <input
            value={
              found.other_specialty || ""
            }
            onChange={(e)=>
              updateField(
                "other_specialty",
                e.target.value
              )
            }
          />
        </Field>

        <Field
          label="주요 강의주제 한 줄"
          help="검색 목록에 표시됩니다. 80자 이내로 핵심 주제만 입력해 주세요."
        >
          <input
            value={
              found.main_topic || ""
            }
            maxLength={80}
            onChange={(e)=>
              updateField(
                "main_topic",
                e.target.value
              )
            }
          />
        </Field>

      </div>

      <Field label="프로필 사진">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            updateField(
              "profile_image_file",
              file
            );
            updateField(
              "profile_image_preview",
              URL.createObjectURL(file)
            );
          }}
        />
        {(found.profile_image_preview
          || found.profile_image) && (
          <div style={{ marginTop: "12px" }}>
            <img
              src={
                found.profile_image_preview
                || found.profile_image
              }
              alt="프로필 미리보기"
              className="admin-profile-preview"
            />
          </div>
        )}
        <div className="help">
          새 사진 업로드 시 기존 사진은 교체됩니다.
        </div>
      </Field>

      <Field label="강사 소개">
        <textarea
          value={found.intro || ""}
          onChange={(e)=>
            updateField(
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
            checked={
              !!found.show_phone
            }
            onChange={(e)=>
              updateField(
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
            checked={
              !!found.show_email
            }
            onChange={(e)=>
              updateField(
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
            checked={
              !!found.show_profile
            }
            onChange={(e)=>
              updateField(
                "show_profile",
                e.target.checked
              )
            }
          />
          프로필 공개
        </label>

      </div>

    </>
  );
}
