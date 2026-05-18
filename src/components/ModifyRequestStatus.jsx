export default function ModifyRequestStatus({
  latestRequest,
  formatKST
}) {

  if (!latestRequest) {
    return null;
  }

  return (
    <section className="card">

      <h2>
        최근 수정 요청 상태
      </h2>

      <p>
        현재 상태:
        {" "}
        <b>
          {latestRequest.request_status}
        </b>
      </p>

      <p className="muted small">
        요청일시:
        {" "}
        {formatKST(
          latestRequest.requested_at
        )}
      </p>

      {latestRequest.reviewed_at && (
        <p className="muted small">
          처리일시:
          {" "}
          {formatKST(
            latestRequest.reviewed_at
          )}
        </p>
      )}

      {latestRequest.request_status === "검토중" && (
        <p className="help">
          아직 관리자 검토 전입니다.
          아래 수정폼에는 기존 제출한
          수정 요청 내용이 표시됩니다.
          다시 제출하면 이전 검토중
          요청은 대체되고 최신 요청만
          관리자에게 표시됩니다.
        </p>
      )}

      {latestRequest.request_status === "반려" && (
        <p className="error">
          반려 사유:
          {" "}
          {latestRequest.admin_memo ||
            "반려 사유가 입력되지 않았습니다."}
        </p>
      )}

      {latestRequest.request_status === "승인" && (
        <p className="help">
          최근 수정 요청이 승인되어
          현재 강사 정보에
          반영되었습니다.
        </p>
      )}

    </section>
  );
}
