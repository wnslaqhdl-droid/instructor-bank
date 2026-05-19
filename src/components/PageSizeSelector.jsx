export default function PageSizeSelector({
  value,
  onChange
}) {

  return (
    <select
      value={value}
      onChange={(e)=>
        onChange(
          Number(e.target.value)
        )
      }
      className="select"
    >
      <option value={10}>
        10개씩
      </option>

      <option value={20}>
        20개씩
      </option>

      <option value={50}>
        50개씩
      </option>

      <option value={100}>
        100개씩
      </option>
    </select>
  );
}
