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
          key={`certificate-${i}`}
          className="repeat"
        >

          <div className="grid grid-2">

            <Field label="자격증명">
              <input
                value={c.name || ""}
                onChange={(e) =>
                  updateArrayItem(
                    modifyCertificates,
                    setModifyCertificates,
                    i,
                    "name",
                    e.target.value
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
                    setModifyCertificates,
                    i,
                    "organization",
                    e.target.value
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
                    setModifyCertificates,
                    i,
                    "acquired_date",
                    e.target.value
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
                    setModifyCertificates,
                    i,
                    "expire_date",
                    e.target.value
                  )
                }
              />
            </Field>

            <label className="check">
              <input
                type="checkbox"
                checked={!!c.is_public}
                onChange={(e) =>
                  updateArrayItem(
                    modifyCertificates,
                    setModifyCertificates,
                    i,
                    "is_public",
                    e.target.checked
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
              is_public: true
            }
          ]);
        }}
      >
        자격증 추가
      </button>
    </>
  );
}
