export default function CheckboxGroup({
  options,
  values,
  onChange
}) {

  function toggle(option) {

    if (
      values.includes(option)
    ) {
      onChange(
        values.filter(
          (v) => v !== option
        )
      );

    } else {

      onChange([
        ...values,
        option
      ]);
    }
  }

  return (
    <div className="check-grid">

      {options.map(
        (option) => (
          <label
            key={option}
            className="check"
          >
            <input
              type="checkbox"
              checked={values.includes(
                option
              )}
              onChange={() =>
                toggle(option)
              }
            />

            <span>
              {option}
            </span>
          </label>
        )
      )}

    </div>
  );
}
