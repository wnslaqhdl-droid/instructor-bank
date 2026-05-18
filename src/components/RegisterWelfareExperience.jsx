export default function RegisterWelfareExperience({
  welfareExperiences,
  setWelfareExperiences,
  emptyWelfare,
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
      title="3. 장애인복지 분야 실무경력 자기신고"
      help="중앙센터가 개별 검증하지 않는 자기신고 영역입니다."
      items={welfareExperiences}
      setItems={setWelfareExperiences}
      emptyItem={emptyWelfare}
      clone={clone}
      render={(item, index, updateItem) => (
        <div className="grid grid-2">

          <Field label="기관명">
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

          <Field label="역할">
            <input
              value={item.role}
              onChange={(e)=>
                updateItem(
                  index,
                  "role",
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
                  [...welfareExperiences];

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

                setWelfareExperiences(copy);
              }}
            />

            <span>현재 진행 중</span>
          </label>

          <Field label="주요 업무">
            <textarea
              value={item.description}
              onChange={(e)=>
                updateItem(
                  index,
                  "description",
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
