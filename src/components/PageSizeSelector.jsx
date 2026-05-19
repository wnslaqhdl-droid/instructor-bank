export default function PageSizeSelector({
  value,
  onChange,
  label = "목록 개수"
}) {

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}
    >
      <span className="small muted">
        {label}
      </span>

      <select
        value={value}
        onChange={(e)=>
          onChange(Number(e.target.value))
        }
      >
        <option value={10}>10개</option>
        <option value={20}>20개</option>
        <option value={50}>50개</option>
        <option value={100}>100개</option>
      </select>
    </div>
  );
}
