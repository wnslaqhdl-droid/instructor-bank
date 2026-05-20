import ModifyBasicInfo from "../ModifyBasicInfo";
import ModifyTrainingSection from "../ModifyTrainingSection";
import ModifyWelfareSection from "../ModifyWelfareSection";
import ModifyLectureSection from "../ModifyLectureSection";
import ModifyCertificateSection from "../ModifyCertificateSection";

export default function AdminEditPanel({
  editingItem,
  setEditingItem,

  updateEdit,
  saveEdit,

  editingTrainings,
  setEditingTrainings,

  editingWelfares,
  setEditingWelfares,

  editingLectures,
  setEditingLectures,

  editingCertificates,
  setEditingCertificates,

  regionOptions,
  targetOptions,
  typeOptions,
  specialtyOptions,

  Field,
  CheckboxGroup,

  MonthSelect,
  getCurrentMonthKST,
  toMonthValue,
  monthToDate
}) {

  if (!editingItem) {
    return null;
  }

  return (
    <section className="card">

      <h2>
        강사 정보 수정
      </h2>

      <p className="muted small">
        관리자가 수정한 내용은 즉시 공개 정보에 반영됩니다.
        중앙센터 수료 확인은 중앙센터에서 확인 가능한 경우에만 체크합니다.
      </p>

      <ModifyBasicInfo
        found={editingItem}
        updateField={updateEdit}

        regionOptions={regionOptions}
        targetOptions={targetOptions}
        typeOptions={typeOptions}
        specialtyOptions={specialtyOptions}

        Field={Field}
        CheckboxGroup={CheckboxGroup}
      />

      <ModifyTrainingSection
        modifyTrainings={editingTrainings}
        setModifyTrainings={
          setEditingTrainings
        }
        Field={Field}
      />

      <ModifyWelfareSection
        modifyWelfares={editingWelfares}
        setModifyWelfares={
          setEditingWelfares
        }

        Field={Field}

        MonthSelect={MonthSelect}

        getCurrentMonthKST={
          getCurrentMonthKST
        }

        toMonthValue={toMonthValue}

        monthToDate={monthToDate}
      />

      <ModifyLectureSection
        modifyLectures={editingLectures}
        setModifyLectures={
          setEditingLectures
        }

        Field={Field}

        MonthSelect={MonthSelect}

        getCurrentMonthKST={
          getCurrentMonthKST
        }

        toMonthValue={toMonthValue}

        monthToDate={monthToDate}
      />

      <ModifyCertificateSection
        modifyCertificates={
          editingCertificates
        }

        setModifyCertificates={
          setEditingCertificates
        }

        Field={Field}
      />

      <div className="check-grid">

        <label className="check">
          <input
            type="checkbox"
            checked={
              !!editingItem.center_verified
            }
            onChange={(e)=>
              updateEdit(
                "center_verified",
                e.target.checked
              )
            }
          />

          중앙센터 수료 확인
        </label>

      </div>

      <div className="actions">

        <button
          className="btn"
          onClick={()=>
            setEditingItem(null)
          }
        >
          취소
        </button>

        <button
          className="btn primary"
          onClick={saveEdit}
        >
          저장
        </button>

      </div>

    </section>
  );
}
