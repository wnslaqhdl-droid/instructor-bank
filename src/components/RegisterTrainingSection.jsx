export default function RegisterTrainingSection({
  trainingCourses,
  setTrainingCourses,
  emptyTraining,
  Field,
  Repeater,
  clone
}) {

  return (

    <Repeater
      clone={clone}
      title="2. 양성과정 수료 정보"
      help="수료한 과정명을 이력 단위로 입력합니다."
      items={trainingCourses}
      setItems={setTrainingCourses}
      emptyItem={emptyTraining}
      clone={clone}
      render={(item, index, updateItem)=>(

        <div className="grid grid-3">

          <Field label="양성과정명">
            <input
              value={item.course_name}
              onChange={(e)=>
                updateItem(
                  index,
                  "course_name",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="수료기관">
            <input
              value={item.institution}
              onChange={(e)=>
                updateItem(
                  index,
                  "institution",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="수료연도">
            <input
              value={item.completion_year}
              onChange={(e)=>
                updateItem(
                  index,
                  "completion_year",
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
