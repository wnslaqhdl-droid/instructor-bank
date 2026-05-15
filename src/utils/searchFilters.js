export function filterAndSortInstructors({
  items,
  normalizedKeyword,
  region,
  target,
  type,
  specialty,
  sortType,
  onlyVerified
}) {

  return items
    .filter((item) => {

      const text = [
        item.name,
        item.region,
        item.main_topic,
        item.other_specialty,
        item.intro,
        (item.activity_regions || []).join(" "),
        (item.targets || []).join(" "),
        (item.types || []).join(" "),
        (item.specialties || []).join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!onlyVerified || item.center_verified) &&
        (!normalizedKeyword ||
          text.includes(normalizedKeyword)) &&
        (!region ||
          item.region === region ||
          (item.activity_regions || []).includes(region)) &&
        (!target ||
          (item.targets || []).includes(target)) &&
        (!type ||
          (item.types || []).includes(type)) &&
        (!specialty ||
          (item.specialties || []).includes(specialty))
      );
    })

    .sort((a, b) => {

      if (sortType === "latest") {
        return (
          new Date(b.created_at) -
          new Date(a.created_at)
        );
      }

      if (sortType === "name") {
        return (a.name || "")
          .localeCompare(b.name || "");
      }

      if (sortType === "region") {
        return (a.region || "")
          .localeCompare(b.region || "");
      }

      return 0;

    });
}
