export default function ActiveFilters({
  region,
  setRegion,
  target,
  setTarget,
  type,
  setType,
  specialty,
  setSpecialty,
  onlyVerified,
  setOnlyVerified,
}) {

  return (
    <div className="active-filters">

      {region && (
        <span
          className="filter-chip"
          onClick={()=>setRegion("")}
        >
          지역: {region} ✕
        </span>
      )}

      {target && (
        <span
          className="filter-chip"
          onClick={()=>setTarget("")}
        >
          대상: {target} ✕
        </span>
      )}

      {type && (
        <span
          className="filter-chip"
          onClick={()=>setType("")}
        >
          유형: {type} ✕
        </span>
      )}

      {specialty && (
        <span
          className="filter-chip"
          onClick={()=>setSpecialty("")}
        >
          분야: {specialty} ✕
        </span>
      )}

      {onlyVerified && (
        <span
          className="filter-chip"
          onClick={()=>setOnlyVerified(false)}
        >
          개발원 과정 수료자 ✕
        </span>
      )}

    </div>
  );
}
