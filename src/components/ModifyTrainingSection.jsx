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
        <div key={i} className="repeat">

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
