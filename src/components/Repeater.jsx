export default function Repeater({
  title,
  help,
  items,
  setItems,
  emptyItem,
  render,
  clone
}) {

  const updateItem = (index, key, value) =>
    setItems(
      items.map((item, i) =>
        i === index
          ? { ...item, [key]: value }
          : item
      )
    );

  const add = () =>
    setItems([
      ...items,
      clone(emptyItem)
    ]);

  const remove = (index) => {
    if (items.length > 1) {
      setItems(
        items.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <section className="card">

      <div className="instructor-top">
        <div>
          <h2>{title}</h2>

          {help ? (
            <p className="muted small">
              {help}
            </p>
          ) : null}

        </div>

        <button
          className="btn primary"
          type="button"
          onClick={add}
        >
          추가
        </button>

      </div>

      {items.map((item, index) => (
        <div className="repeat" key={index}>

          <div className="instructor-top">
            <strong>
              입력 {index + 1}
            </strong>

            <button
              className="btn danger"
              type="button"
              onClick={() => remove(index)}
            >
              삭제
            </button>

          </div>

          {render(
            item,
            index,
            updateItem
          )}

        </div>
      ))}

    </section>
  );
}
