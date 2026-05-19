import PageSizeSelector from "./PageSizeSelector";

export default function AdminInstructorTableSection({
  adminKeyword,
  setAdminKeyword,

  adminStatus,
  setAdminStatus,

  setAdminPage,

  paginatedAdminItems,
  items,
  filteredItems,

  adminPage,
  adminTotalPages,

  adminItemsPerPage,
  setAdminItemsPerPage,

  updateStatus,
  startEdit,
  deleteItem,

  formatPeriod,

  Field,
  Pagination
}) {
  return (
    <>
      <div
        className="grid grid-3"
        style={{
          marginTop: "14px",
          marginBottom: "14px"
        }}
      >

        <Field label="검색어">
          <input
            value={adminKeyword}
            onChange={(e)=>
              setAdminKeyword(
                e.target.value
              )
            }
            placeholder="
이름, 이메일, 연락처, 지역, 주제 검색"
          />
        </Field>

        <Field label="공개상태">
          <select
            value={adminStatus}
            onChange={(e)=>
              setAdminStatus(
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

            <option value="공개">
              공개
            </option>

            <option value="비공개">
              비공개
            </option>
          </select>
        </Field>

        <div
          style={{
            display: "flex",
            alignItems: "end",
            gap: "8px"
          }}
        >
          <button
            className="btn"
            onClick={()=>{
              setAdminKeyword("");
              setAdminStatus("");
            }}
          >
            필터 초기화
          </button>
        </div>

      </div>

      <div className="table-wrap">

        <table>

          <thead>
            <tr>
              <th>성명</th>
              <th>지역</th>
              <th>주요 주제</th>
              <th>양성과정</th>
              <th>실무경력</th>
              <th>강의경력</th>
              <th>상태</th>
              <th>연락처</th>
              <th>관리</th>
            </tr>
          </thead>

          <tbody>

            {paginatedAdminItems.map(
              (item)=>(
                <tr key={item.id}>

                  <td>
                    {item.name || "-"}
                  </td>

                  <td>
                    {item.region || "-"}
                  </td>

                  <td>
                    {item.main_topic || "-"}
                  </td>

                  <td>
                    {item.training_courses
                      ?.length
                      ? item.training_courses.map(
                          (c)=>(
                            <div key={c.id}>
                              {c.course_name ||
                                "-"}{" "}
                              /{" "}
                              {c.institution ||
                                "-"}{" "}
                              /{" "}
                              {c.completion_year ||
                                "-"}
                            </div>
                          )
                        )
                      : "-"
                    }
                  </td>

                  <td>
                    {item.welfare_experiences
                      ?.length
                      ? item.welfare_experiences.map(
                          (
                            w,
                            i
                          )=>(
                            <div
                              key={
                                w.id || i
                              }
                            >
                              {w.organization ||
                                "-"}{" "}
                              /{" "}
                              {w.role ||
                                "-"}{" "}
                              /{" "}
                              {formatPeriod(
                                w.start_date,
                                w.end_date
                              )}
                            </div>
                          )
                        )
                      : "-"
                    }
                  </td>

                  <td>
                    {item.lecture_experiences
                      ?.length
                      ? item.lecture_experiences.map(
                          (
                            l,
                            i
                          )=>(
                            <div
                              key={
                                l.id || i
                              }
                            >
                              {l.organization ||
                                "-"}{" "}
                              /{" "}
                              {l.topic ||
                                "-"}{" "}
                              /{" "}
                              {l.count ||
                                "-"}
                              회 /{" "}
                              {formatPeriod(
                                l.start_date,
                                l.end_date
                              )}
                            </div>
                          )
                        )
                      : "-"
                    }
                  </td>

                  <td>
                    {item.public_status ||
                      "-"}
                  </td>

                  <td>
                    {item.phone || "-"}
                    <br/>
                    {item.email || "-"}
                  </td>

                  <td>

                    <button
                      className="btn success"
                      onClick={()=>
                        updateStatus(
                          item.id,
                          "공개"
                        )
                      }
                    >
                      승인
                    </button>{" "}

                    <button
                      className="btn"
                      onClick={()=>
                        updateStatus(
                          item.id,
                          "비공개"
                        )
                      }
                    >
                      비공개
                    </button>{" "}

                    <button
                      className="btn"
                      onClick={()=>
                        startEdit(item)
                      }
                    >
                      수정
                    </button>{" "}

                    <button
                      className="btn danger"
                      onClick={()=>
                        deleteItem(
                          item.id
                        )
                      }
                    >
                      삭제
                    </button>

                  </td>

                </tr>
              )
            )}

            {!items.length ? (
              <tr>
                <td
                  colSpan="9"
                  className="muted"
                >
                  목록을 불러오세요.
                </td>
              </tr>
            ) : null}

            {items.length > 0 &&
            filteredItems.length ===
              0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="muted"
                >
                  필터 조건에 맞는
                  강사가 없습니다.
                </td>
              </tr>
            ) : null}

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
          currentPage={adminPage}
          totalPages={adminTotalPages}
          onPageChange={setAdminPage}
        />
      
        <PageSizeSelector
          value={adminItemsPerPage}
          onChange={setAdminItemsPerPage}
        />
      </div>
    </>
  );
}
