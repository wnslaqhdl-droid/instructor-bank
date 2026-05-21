import updateArrayItem from "../utils/updateArrayItem";

export default function ModifyLectureSection({
  modifyLectures,
  setModifyLectures,
  Field,
  MonthSelect,
  getCurrentMonthKST,
  toMonthValue,
  monthToDate
}) {
  return (
    <>
      <h3>강의경력</h3>

      {modifyLectures.map((l, i) => (
        <div
          key={`lecture-${l.id || i}`}
          className="repeat"
        >

          <div className="grid grid-2">

            <Field label="강의기관">
              <input
                value={l.organization || ""}
                onChange={(e)=>
                  updateArrayItem(
                    modifyLectures,
                    i,
                    {
                      organization: e.target.value
                    },
                    setModifyLectures
                  )
                }
              />
            </Field>

            <Field label="교육대상">
              <input
                value={l.target || ""}
                onChange={(e)=>
                  updateArrayItem(
                    modifyLectures,
                    i,
                    {
                      target: e.target.value
                    },
                    setModifyLectures
                  )
                }
              />
            </Field>

            <Field label="강의주제">
              <input
                value={l.topic || ""}
                onChange={(e)=>
                  updateArrayItem(
                    modifyLectures,
                    i,
                    {
                      topic: e.target.value
                    },
                    setModifyLectures
                  )
                }
              />
            </Field>

            <Field label="강의횟수">
              <input
                value={l.count || ""}
                onChange={(e)=>
                  updateArrayItem(
                    modifyLectures,
                    i,
                    {
                      count: e.target.value
                    },
                    setModifyLectures
                  )
                }
              />
            </Field>

            <MonthSelect
              label="시작월"
              value={l.start_date}
              max={getCurrentMonthKST()}
              onChange={(date) => {
                const copy = [
                  ...modifyLectures
                ];

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

                setModifyLectures(copy);
              }}
            />

            <MonthSelect
              label="종료월"
              value={l.end_date}
              min={toMonthValue(
                l.start_date
              )}
              max={getCurrentMonthKST()}
              disabled={!!l.is_current}
              onChange={(date)=>
                updateArrayItem(
                  modifyLectures,
                  i,
                  {
                    end_date: date
                  },
                  setModifyLectures
                )
              }
            />

            <label className="check">
              <input
                type="checkbox"
                checked={!!l.is_current}
                onChange={(e) => {
                  const checked =
                    e.target.checked;

                  const copy = [
                    ...modifyLectures
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

                  setModifyLectures(copy);
                }}
              />

              <span>
                현재 진행 중
              </span>
            </label>

          </div>

          <div className="actions">
            <button
              className="btn danger"
              onClick={() => {
                setModifyLectures(
                  modifyLectures.filter(
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
          setModifyLectures([
            ...modifyLectures,
            {
              organization: "",
              target: "",
              topic: "",
              start_date: "",
              end_date: "",
              count: "",
              is_current: false
            }
          ]);
        }}
      >
        강의경력 추가
      </button>
    </>
  );
}
