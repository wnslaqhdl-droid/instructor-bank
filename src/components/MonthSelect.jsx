import {
  getCurrentMonthKST,
  toMonthValue,
  monthToDate
} from "../utils/date";

export default function MonthSelect({
  label,
  value,
  min,
  max,
  disabled,
  onChange
}) {
  const currentYear = Number(
    getCurrentMonthKST().slice(0, 4)
  );

  const years = Array.from(
    {
      length:
        currentYear - 1950 + 1
    },
    (_, i) =>
      String(currentYear - i)
  );

  const months = Array.from(
    { length: 12 },
    (_, i) =>
      String(i + 1).padStart(
        2,
        "0"
      )
  );

  const monthValue =
    toMonthValue(value);

  const selectedYear =
    monthValue
      ? monthValue.slice(0, 4)
      : "";

  const selectedMonth =
    monthValue
      ? monthValue.slice(5, 7)
      : "";

  function isDisabledMonth(
    year,
    month
  ) {
    if (!year || !month)
      return false;

    const ym =
      `${year}-${month}`;

    if (min && ym < min)
      return true;

    if (max && ym > max)
      return true;

    return false;
  }

  function apply(
    nextYear,
    nextMonth
  ) {
    if (!nextYear) {
      onChange(null);
      return;
    }

    const safeMonth =
      nextMonth || "01";

    const ym =
      `${nextYear}-${safeMonth}`;

    if (min && ym < min)
      return;

    if (max && ym > max)
      return;

    onChange(
      monthToDate(ym)
    );
  }

  return (
    <div className="field">
      <span>{label}</span>

      <div className="month-row">

        <select
          value={selectedYear}
          disabled={disabled}
          onChange={(e) =>
            apply(
              e.target.value,
              selectedMonth ||
                "01"
            )
          }
        >
          <option value="">
            연도
          </option>

          {years.map((y) => (
            <option
              key={y}
              value={y}
              disabled={
                (min &&
                  `${y}-12` <
                    min) ||
                (max &&
                  `${y}-01` >
                    max)
              }
            >
              {y}년
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          disabled={
            disabled ||
            !selectedYear
          }
          onChange={(e) =>
            apply(
              selectedYear,
              e.target.value
            )
          }
        >
          <option value="">
            월
          </option>

          {months.map((m) => (
            <option
              key={m}
              value={m}
              disabled={isDisabledMonth(
                selectedYear,
                m
              )}
            >
              {Number(m)}월
            </option>
          ))}
        </select>

      </div>
    </div>
  );
}
