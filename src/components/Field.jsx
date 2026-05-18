export default function Field({
  label,
  required,
  help,
  children
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>

      {children}

      {help ? (
        <div className="help">
          {help}
        </div>
      ) : null}
    </label>
  );
}
