import updateArrayItem from "../utils/updateArrayItem";

export default function ModifyCertificateSection({
  modifyCertificates,
  setModifyCertificates,
  Field
}) {

  return (
    <>
      <h3>자격증</h3>

      {modifyCertificates.map((c, i) => (
        <div
          key={`certificate-${c.id || i}`}
          className="repeat"
        >

          <div className="grid grid-2">

            <Field label="자격증명">
              <input
                value={c.name || ""}
                onChange={(e) =>
                  updateArrayItem(
                    modifyCertificates,
                    i,
                    {
                      name: e.target.value
                    },
                    setModifyCertificates
                  )
                }
              />
            </Field>

            <Field label="발급기관">
              <input
                value={c.organization || ""}
                onChange={(e) =>
                  updateArrayItem(
                    modifyCertificates,
                    i,
                    {
                      organization:
                        e.target.value
                    },
                    setModifyCertificates
                  )
                }
              />
            </Field>

            <Field label="취득일">
              <input
                type="date"
                value={c.acquired_date || ""}
                onChange={(e) =>
                  updateArrayItem(
                    modifyCertificates,
                    i,
                    {
                      acquired_date:
                        e.target.value
                    },
                    setModifyCertificates
                  )
                }
              />
            </Field>

            <Field label="만료일">
              <input
                type="date"
                value={c.expire_date || ""}
                onChange={(e) =>
                  updateArrayItem(
                    modifyCertificates,
                    i,
                    {
                      expire_date:
                        e.target.value
                    },
                    setModifyCertificates
                  )
                }
              />
            </Field>

            <Field label="증빙파일">
              {c.attachment_url && (
                <div style={{marginBottom:8}}>
                  <a
                    href={c.attachment_url}
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
                  updateArrayItem(
                    modifyCertificates,
                    i,
                    {
                      attachment_file: file
                    },
                    setModifyCertificates
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

            <label className="check">
              <input
                type="checkbox"
                checked={!!c.is_public}
                onChange={(e) =>
                  updateArrayItem(
                    modifyCertificates,
                    i,
                    {
                      is_public:
                        e.target.checked
                    },
                    setModifyCertificates
                  )
                }
              />

              <span>
                공개
              </span>
            </label>

          </div>

          <div className="actions">
            <button
              className="btn danger"
              onClick={() => {
                setModifyCertificates(
                  modifyCertificates.filter(
                    (_, idx) => idx !== i
                  )
                );
              }}
            >
              삭제
            </button>
          </div>

        </div>
      ))}

      <button
        className="btn"
        onClick={() => {
          setModifyCertificates([
            ...modifyCertificates,
            {
              name: "",
              organization: "",
              acquired_date: "",
              expire_date: "",
              is_public: true,
              attachment_url: ""
            }
          ]);
        }}
      >
        자격증 추가
      </button>
    </>
  );
}
