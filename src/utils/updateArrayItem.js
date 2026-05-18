export default function updateArrayItem(
  list,
  index,
  patch,
  setter
) {

  const copy = [...list];

  copy[index] = {
    ...copy[index],
    ...patch
  };

  setter(copy);
}
