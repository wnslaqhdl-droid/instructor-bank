export default function RegisterLectureExperience({
  lectureExperiences,
  setLectureExperiences,
  emptyLecture,
  Field,
  Repeater,
  MonthSelect,
  getCurrentMonthKST,
  toMonthValue,
  monthToDate,
  clone
}) {

  return (
    <Repeater
      title="4. 발달장애인 대상 성교육 강의경력 자기신고"
      items={lectureExperiences}
      setItems={setLectureExperiences}
      emptyItem={emptyLecture}
      clone={clone}
      render={(item, index, updateItem) => (
        <div className="grid grid-3">

          <Field label="강의기관">
            <input
              value={item.organization}
              onChange={(e)=>
                updateItem(
                  index,
                  "organization",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="교육대상">
            <input
              value={item.target}
              onChange={(e)=>
                updateItem(
                  index,
                  "target",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="강의주제">
            <input
              value={item.topic}
              onChange={(e)=>
                updateItem(
                  index,
                  "topic",
                  e.target.value
                )
              }
            />
          </Field>

          <MonthSelect
            label="시작월"
            value={item.start_date}
            max={getCurrentMonthKST()}
            onChange={(date)=>{
              const nextStartMonth =
                toMonthValue(date);

              const currentEndMonth =
                toMonthValue(item.end_date);

              updateItem(
                index,
                "start_date",
                date
              );

              if (
                currentEndMonth &&
                nextStartMonth &&
                nextStartMonth > currentEndMonth
              ) {
                updateItem(
                  index,
                  "end_date",
                  null
                );
              }
            }}
          />

          <MonthSelect
            label="종료월"
            value={item.end_date}
            min={toMonthValue(item.start_date)}
            max={getCurrentMonthKST()}
            disabled={!!item.is_current}
            onChange={(date)=>{
              updateItem(
                index,
                "end_date",
                date
              );
            }}
          />

          <label className="check">
            <input
              type="checkbox"
              checked={!!item.is_current}
              onChange={(e)=>{
                const checked =
                  e.target.checked;

                const copy =
                  [...lectureExperiences];

                copy[index] = {
                  ...copy[index],
                  is_current: checked,
                  end_date: checked
                    ? null
                    : (
                        copy[index].end_date ||
                        monthToDate(
                          getCurrentMonthKST()
                        )
                      )
                };

                setLectureExperiences(copy);
              }}
            />

            <span>현재 진행 중</span>
          </label>

          <Field label="강의횟수">
            <input
              value={item.count}
              onChange={(e)=>
                updateItem(
                  index,
                  "count",
                  e.target.value
                )
              }
            />
          </Field>

        </div>
      )}
    />
  );
}
