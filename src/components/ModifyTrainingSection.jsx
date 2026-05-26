import updateArrayItem from "../utils/updateArrayItem";

export default function ModifyTrainingSection({
  modifyTrainings,
  setModifyTrainings,
  Field
}) {
  return (
    <>
      <h3>양성과정 수료 정보</h3>

      {modifyTrainings.map((t, i) => (
        <div
          key={`training-${t.id || i}`}
          className="repeat"
        >

          <div className="grid grid-3">

            <Field label="양성과정명">
              <input
                value={t.course_name || ""}
                onChange={(e) => {
                  updateArrayItem(
                    modifyTrainings,
                    i,
                    {
                      course_name:
                        e.target.value
                    },
                    setModifyTrainings
                  );
                }}
              />
            </Field>

            <Field label="수료기관">
              <input
                value={t.institution || ""}
                onChange={(e) => {
                  updateArrayItem(
                    modifyTrainings,
                    i,
                    {
                      institution:
                        e.target.value
                    },
                    setModifyTrainings
                  );
                }}
              />
            </Field>

            <Field label="수료연도">
              <input
                value={t.completion_year || ""}
                onChange={(e) => {
                  updateArrayItem(
                    modifyTrainings,
                    i,
                    {
                      completion_year:
                        e.target.value
                    },
                    setModifyTrainings
                  );
                }}
              />
            </Field>

            <Field label="증빙파일">
              {t.attachment_url && (
                <div style={{marginBottom:8}}>
                  <a
                    href={t.attachment_url}
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
                    modifyTrainings,
                    i,
                    {
                      attachment_file:file
                    },
                    setModifyTrainings
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

          <div className="actions">
            <button
              className="btn danger"
              onClick={() => {
                setModifyTrainings(
                  modifyTrainings.filter(
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
          setModifyTrainings([
            ...modifyTrainings,
            {
              course_name: "",
              institution: "",
              completion_year: ""
            }
          ]);
        }}
      >
        양성과정 추가
      </button>
    </>
  );
}
