export default function InstructorCard({
  item,
  openId,
  openBadgeId,
  toggleDetail,
  setOpenBadgeId,
  formatPeriod,
}) {

  return (
    <article
      className="instructor-card compact-card"
      onClick={() => toggleDetail(item.id)}
      style={{ cursor: "pointer" }}
    >

      <div className="compact-row">

        <div className="profile-col">
          {item.profile_image ? (
            <img
              src={item.profile_image}
              alt={item.name}
              className="card-profile-image"
            />
          ) : (
            <div className="empty-profile" />
          )}
        </div>

        <span className="compact-name name-cell">
          <span className="name-text">
            {item.name || "-"}
          </span>

          {item.center_verified && (
            <button
              type="button"
              className="badge verified-badge"
              onClick={(e)=>{
                e.stopPropagation();

                setOpenBadgeId(
                  openBadgeId === item.id
                    ? null
                    : item.id
                );
              }}
            >
              개발원 과정 수료자
            </button>
          )}
        </span>

        <span className="col-topic">
          {item.main_topic || "-"}
        </span>

        <span className="col-region">
          {(item.activity_regions || []).join(", ")
            || item.region
            || "-"}
        </span>

        <span className="col-target">
          {(item.targets || []).join(", ")
            || "-"}
        </span>

        <span className="col-type">
          {(item.types || []).join(", ")
            || "-"}
        </span>

      </div>

      {openBadgeId === item.id && (
        <div className="badge-info-box">
          한국장애인개발원에서 운영한 관련 교육과정
          수료 이력이 확인된 강사입니다.
          강사의 전체 경력 또는 모든 교육과정
          이수를 인증하는 의미는 아닙니다.
        </div>
      )}

      {openId === item.id && (

        <div className="detail-box">

          <div className="detail-grid">

            <div>
              <b>활동지역</b>
              <br />
              {(item.activity_regions || []).join(", ")
                || item.region
                || "-"}
            </div>

            <div>
              <b>교육대상</b>
              <br />
              {(item.targets || []).join(", ")
                || "-"}
            </div>

            <div>
              <b>교육유형</b>
              <br />
              {(item.types || []).join(", ")
                || "-"}
            </div>

            <div>
              <b>강의분야</b>
              <br />
              {(item.specialties || []).join(", ")
                || "-"}
            </div>

            <div style={{gridColumn:"1 / -1"}}>
              <b>강의 소개</b>
              <br />
              {item.intro || "-"}
            </div>

            <div style={{gridColumn:"1 / -1"}}>
              <b>양성과정 수료 정보</b>
              <br />

              {(item.training_courses || []).length ? (
                item.training_courses.map((t, i)=>(
                  <div key={`training-${i}`}>
                    {t.course_name || "-"} /
                    {t.institution || "-"} /
                    {t.completion_year || "-"}
                  </div>
                ))
              ) : "-"}
            </div>

            <div style={{gridColumn:"1 / -1"}}>
              <b>실무경력</b>
              <br />

              {(item.welfare_experiences || []).length ? (
                item.welfare_experiences.map((w, i)=>(
                  <div key={`welfare-${i}`}>
                    {w.organization || "-"} /
                    {w.role || "-"} /
                    {formatPeriod(
                      w.start_date,
                      w.end_date
                    )}

                    {w.description
                      ? ` / ${w.description}`
                      : ""}
                  </div>
                ))
              ) : "-"}
            </div>

            <div style={{gridColumn:"1 / -1"}}>
              <b>강의경력</b>
              <br />

              {(item.lecture_experiences || []).length ? (
                item.lecture_experiences.map((l, i)=>(
                  <div key={`lecture-${i}`}>
                    {l.organization || "-"} /
                    {l.target || "-"} /
                    {l.topic || "-"} /
                    {l.count || "-"}회
                  </div>
                ))
              ) : "-"}
            </div>

            <div style={{gridColumn:"1 / -1"}}>
              <b>자격증</b>
              <br />

              {(item.certificates || [])
                .filter((c) => c.is_public)
                .length ? (

                item.certificates
                  .filter((c) => c.is_public)
                  .map((c, i)=>(
                    <div key={`certificate-${i}`}>

                      {c.name || "-"}

                      {" / "}

                      {c.organization || "-"}

                      {" / 취득일: "}

                      {c.acquired_date || "-"}

                      {c.expire_date
                        ? ` / 만료일: ${c.expire_date}`
                        : ""}

                    </div>
                  ))

              ) : "-"}
            </div>

            {item.show_phone && (
              <div>
                <b>연락처</b>
                <br />

                {item.phone ? (
                  <a href={`tel:${item.phone}`}>
                    {item.phone}
                  </a>
                ) : "-"}
              </div>
            )}

            {item.show_email && (
              <div>
                <b>이메일</b>
                <br />

                {item.email ? (
                  <a href={`mailto:${item.email}`}>
                    {item.email}
                  </a>
                ) : "-"}
              </div>
            )}

          </div>
        </div>
      )}
    </article>
  );
}
