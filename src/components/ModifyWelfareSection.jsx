import updateArrayItem from "../utils/updateArrayItem";

export default function ModifyWelfareSection({
  modifyWelfares,
  setModifyWelfares,
  Field,
  MonthSelect,
  getCurrentMonthKST,
  toMonthValue,
  monthToDate
}) {
  return (
    <>
      <h3>실무경력</h3>

      {modifyWelfares.map((w, i) => (
        <div key={i} className="repeat">
          <div className="grid grid-2">

            <Field label="기관명">
              <input
                value={w.organization || ""}
                onChange={(e)=>
                  updateArrayItem(
                    modifyWelfares,
                    setModifyWelfares,
                    i,
                    "organization",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="역할">
              <input
                value={w.role || ""}
                onChange={(e)=>
                  updateArrayItem(
                    modifyWelfares,
                    setModifyWelfares,
                    i,
                    "role",
                    e.target.value
                  )
                }
              />
            </Field>

            <MonthSelect
              label="시작월"
              value={w.start_date}
              max={getCurrentMonthKST()}
              onChange={(date) => {
                const copy = [...modifyWelfares];

                const nextStartMonth =
                  toMonthValue(date);

                const currentEndMonth =
                  toMonthValue(
                    copy[i].end_date
                  );

                copy[i] = {
                  ...copy[i],
                  start_date: date,

                  end_date:
                    currentEndMonth &&
                    nextStartMonth &&
                    nextStartMonth >
                      currentEndMonth
                      ? null
                      : copy[i].end_date
                };

                setModifyWelfares(copy);
              }}
            />

            <MonthSelect
              label="종료월"
              value={w.end_date}
              min={toMonthValue(
                w.start_date
              )}
              max={getCurrentMonthKST()}
              disabled={!!w.is_current}
              onChange={(date) => {
                const copy = [
                  ...modifyWelfares
                ];

                copy[i] = {
                  ...copy[i],
                  end_date: date
                };

                setModifyWelfares(copy);
              }}
            />

            <label className="check">
              <input
                type="checkbox"
                checked={!!w.is_current}
                onChange={(e) => {
                  const checked =
                    e.target.checked;

                  const copy = [
                    ...modifyWelfares
                  ];

                  copy[i] = {
                    ...copy[i],
                    is_current:
                      checked,

                    end_date: checked
                      ? null
                      : (
                          copy[i]
                            .end_date ||
                          monthToDate(
                            getCurrentMonthKST()
                          )
                        )
                  };

                  setModifyWelfares(copy);
                }}
              />

              <span>
                현재 진행 중
              </span>
            </label>

            <Field label="주요 업무">
              <textarea
                value={
                  w.description || ""
                }
                onChange={(e) => {
                  const copy = [
                    ...modifyWelfares
                  ];

                  copy[i] = {
                    ...copy[i],
                    description:
                      e.target.value
                  };

                  setModifyWelfares(copy);
                }}
              />
            </Field>

          </div>

          <div className="actions">
            <button
              className="btn danger"
              onClick={() => {
                setModifyWelfares(
                  modifyWelfares.filter(
                    (_, idx) =>
                      idx !== i
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
          setModifyWelfares([
            ...modifyWelfares,
            {
              organization: "",
              role: "",
              start_date: "",
              end_date: "",
              description: "",
              is_current: false
            }
          ]);
        }}
      >
        실무경력 추가
      </button>
    </>
  );
}
