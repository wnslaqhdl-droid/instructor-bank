import React from "react";
import PageSizeSelector from "./PageSizeSelector";

export default function AdminRequestSection({
  requestStatusFilter,
  setRequestStatusFilter,

  paginatedRequests,
  updateRequests,
  filteredUpdateRequests,

  requestPage,
  requestTotalPages,
  setRequestPage,

  requestItemsPerPage,
  setRequestItemsPerPage,

  openRequestId,
  setOpenRequestId,

  approveRequest,
  rejectRequest,

  renderChangedField,
  renderChangedList,
  isChanged,

  formatKST,
  formatPeriod,

  Field,
  Pagination
}) {
  return (
    <section className="card">
      <h2>수정 요청 목록</h2>

      <div
        className="grid grid-3"
        style={{ marginBottom: 12 }}
      >
        <Field label="요청 상태">
          <select
            value={requestStatusFilter}
            onChange={(e)=>
              setRequestStatusFilter(
                e.target.value
              )
            }
          >
            <option value="">
              전체
            </option>

            <option value="검토중">
              검토중
            </option>

            <option value="승인">
              승인
            </option>

            <option value="반려">
              반려
            </option>

            <option value="대체됨">
              대체됨
            </option>
          </select>
        </Field>

        <div
          style={{
            display: "flex",
            alignItems: "end"
          }}
        >
          <button
            className="btn"
            onClick={()=>
              setRequestStatusFilter("")
            }
          >
            상태 필터 초기화
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>요청일</th>
              <th>강사명</th>
              <th>상태</th>
              <th>반려 사유</th>
              <th>관리</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRequests.map((req)=>(
              <React.Fragment key={req.id}>

                <tr
                  className={
                    req.request_status !==
                    "검토중"
                      ? "processed-row"
                      : ""
                  }
                >
                  <td>
                    {formatKST(
                      req.requested_at
                    )}
                  </td>

                  <td>
                    {req.instructors?.name ||
                      "-"}
                  </td>

                  <td>
                    <div>
                      {req.request_status}
                    </div>

                    {req.reviewed_at && (
                      <div className="muted small">
                        {formatKST(
                          req.reviewed_at
                        )}
                      </div>
                    )}
                  </td>

                  <td>
                    {req.admin_memo || "-"}
                  </td>

                  <td>

                    <button
                      className="btn primary"
                      onClick={()=>
                        approveRequest(req)
                      }
                      disabled={
                        req.request_status !==
                        "검토중"
                      }
                    >
                      승인
                    </button>

                    <button
                      className="btn danger"
                      onClick={()=>
                        rejectRequest(req)
                      }
                      disabled={
                        req.request_status !==
                        "검토중"
                      }
                      style={{
                        marginLeft: 6
                      }}
                    >
                      반려
                    </button>

                    <button
                      className="btn"
                      onClick={()=>{
                        setOpenRequestId(
                          openRequestId ===
                          req.id
                            ? null
                            : req.id
                        );
                      }}
                      style={{
                        marginLeft: 6
                      }}
                    >
                      상세
                    </button>

                  </td>
                </tr>

                {openRequestId ===
                  req.id && (

                  <tr
                    className={
                      req.request_status !==
                      "검토중"
                        ? "processed-row"
                        : ""
                    }
                  >
                    <td colSpan="5">

                      <div className="request-detail-box">

                        <div className="change-summary">
                          <b>
                            변경 요청 상세
                          </b>

                          <p>
                            변경된 항목만
                            표시됩니다.
                          </p>
                        </div>

                        {renderChangedField(
                          "성명",
                          req.instructors?.name,
                          req.requested_data
                            ?.instructor?.name
                        )}

                        {renderChangedField(
                          "연락처",
                          req.instructors?.phone,
                          req.requested_data
                            ?.instructor?.phone
                        )}

                        {renderChangedField(
                          "이메일",
                          req.instructors?.email,
                          req.requested_data
                            ?.instructor?.email
                        )}

                        {renderChangedField(
                          "거주지역",
                          req.instructors?.region,
                          req.requested_data
                            ?.instructor?.region
                        )}

                        {renderChangedField(
                          "활동 가능 지역",
                          req.instructors
                            ?.activity_regions,
                          req.requested_data
                            ?.instructor
                            ?.activity_regions
                        )}

                        {renderChangedField(
                          "소속기관",
                          req.instructors
                            ?.organization,
                          req.requested_data
                            ?.instructor
                            ?.organization
                        )}

                        {renderChangedField(
                          "직위/직업군",
                          req.instructors
                            ?.position,
                          req.requested_data
                            ?.instructor
                            ?.position
                        )}

                        {renderChangedField(
                          "주요 강의주제",
                          req.instructors
                            ?.main_topic,
                          req.requested_data
                            ?.instructor
                            ?.main_topic
                        )}

                        {renderChangedField(
                          "강의 분야",
                          req.instructors
                            ?.specialties,
                          req.requested_data
                            ?.instructor
                            ?.specialties
                        )}

                        {renderChangedField(
                          "그 외 주제",
                          req.instructors
                            ?.other_specialty,
                          req.requested_data
                            ?.instructor
                            ?.other_specialty
                        )}

                        {renderChangedField(
                          "교육대상",
                          req.instructors
                            ?.targets,
                          req.requested_data
                            ?.instructor
                            ?.targets
                        )}

                        {renderChangedField(
                          "교육유형",
                          req.instructors
                            ?.types,
                          req.requested_data
                            ?.instructor
                            ?.types
                        )}

                        {renderChangedField(
                          "강사 소개",
                          req.instructors
                            ?.intro,
                          req.requested_data
                            ?.instructor
                            ?.intro
                        )}

                        {renderChangedField(
                          "연락처 공개",
                          req.instructors
                            ?.show_phone,
                          req.requested_data
                            ?.instructor
                            ?.show_phone
                        )}

                        {renderChangedField(
                          "이메일 공개",
                          req.instructors
                            ?.show_email,
                          req.requested_data
                            ?.instructor
                            ?.show_email
                        )}

                        {renderChangedField(
                          "프로필 공개",
                          req.instructors
                            ?.show_profile,
                          req.requested_data
                            ?.instructor
                            ?.show_profile
                        )}

                        {renderChangedField(
                          "개발원 과정 수료 확인",
                          req.instructors
                            ?.center_verified,
                          req.requested_data
                            ?.instructor
                            ?.center_verified
                        )}

                        {renderChangedList(
                          "양성과정",
                          req.instructors?.training_courses,
                          req.requested_data?.training_courses
                        )}
                        
                        {renderChangedList(
                          "실무경력",
                          req.instructors?.welfare_experiences,
                          req.requested_data?.welfare_experiences
                        )}
                        
                        {renderChangedList(
                          "강의경력",
                          req.instructors?.lecture_experiences,
                          req.requested_data?.lecture_experiences
                        )}
                        
                        {renderChangedList(
                          "자격증",
                          req.instructors?.certificates,
                          req.requested_data?.certificates
                        )}

                      </div>

                    </td>
                  </tr>

                )}

              </React.Fragment>
            ))}

            {updateRequests.length > 0 &&
              !filteredUpdateRequests.length && (
                <tr>
                  <td
                    colSpan="5"
                    className="muted"
                  >
                    선택한 상태의 수정 요청이
                    없습니다.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          marginTop: "16px"
        }}
      >
        <Pagination
          currentPage={requestPage}
          totalPages={requestTotalPages}
          onPageChange={setRequestPage}
        />
      
        <PageSizeSelector
          value={requestItemsPerPage}
          onChange={setRequestItemsPerPage}
        />
      </div>
    </section>
  );
}
