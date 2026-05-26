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

          <Field label="증빙파일">
            {item.attachment_url && (
              <div style={{marginBottom:8}}>
                <a
                  href={cert.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  기존 첨부파일 보기
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e)=>{
                const file =
                  e.target.files?.[0];
                if(!file){
                  return;
                }
                updateItem(
                  index,
                  "attachment_file",
                  file
                );
              }}
            />
            <div
              className="muted small"
              style={{marginTop:4}}
            >
              PDF, JPG, PNG 업로드 가능
            </div>
          </Field>

        </div>
      )}
    />
  );
}
