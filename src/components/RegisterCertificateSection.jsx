export default function RegisterCertificateSection({
  certificates,
  setCertificates,
  emptyCertificate,
  Field,
  Repeater,
  clone
}) {

  return (

    <Repeater
      clone={clone}

      title="5. 자격증 정보"

      help="보유 자격증을 입력합니다."

      items={certificates}

      setItems={setCertificates}

      emptyItem={emptyCertificate}

      render={(item, index, updateItem) => (

        <div className="grid grid-3">

          <Field label="자격증명">
            <input
              value={item.name || ""}
              onChange={(e)=>
                updateItem(
                  index,
                  "name",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="발급기관">
            <input
              value={item.organization || ""}
              onChange={(e)=>
                updateItem(
                  index,
                  "organization",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="취득일">
            <input
              type="date"
              value={item.acquired_date || ""}
              onChange={(e)=>
                updateItem(
                  index,
                  "acquired_date",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="만료일">
            <input
              type="date"
              value={item.expire_date || ""}
              onChange={(e)=>
                updateItem(
                  index,
                  "expire_date",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="공개 여부">
            <select
              value={String(item.is_public)}
              onChange={(e)=>
                updateItem(
                  index,
                  "is_public",
                  e.target.value === "true"
                )
              }
            >
              <option value="true">
                공개
              </option>

              <option value="false">
                비공개
              </option>
            </select>
          </Field>

        </div>
      )}
    />
  );
}
