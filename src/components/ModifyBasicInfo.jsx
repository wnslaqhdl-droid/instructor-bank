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

      <Field label="프로필 사진">

        {found.profile_image && (
          <div style={{marginBottom:12}}>
            <img
              src={found.profile_image}
              alt="프로필"
              className="admin-profile-preview"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e)=>{

            const file =
              e.target.files?.[0];

            if(!file){
              return;
            }

            updateField(
              "profile_image_file",
              file
            );

            updateField(
              "profile_image",
              URL.createObjectURL(file)
            );
          }}
        />

      </Field>

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

    </>
  );
}
