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

          <Field label="증빙파일">
            {item.attachment_url && (
              <div style={{marginBottom:8}}>
                <a
                  href={item.attachment_url}
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
