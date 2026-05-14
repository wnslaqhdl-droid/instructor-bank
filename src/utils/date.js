export function getCurrentMonthKST(){
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 7);
}

export function toMonthValue(value){
  if(!value) return "";
  return String(value).slice(0, 7);
}

export function monthToDate(value){
  if(!value) return null;
  return `${value}-01`;
}

export function formatMonth(value){
  if(!value) return "";
  const [year, month] = String(value).slice(0, 7).split("-");
  if(!year || !month) return "";
  return `${year}.${month}`;
}

export function formatPeriod(startDate, endDate){
  const start = formatMonth(startDate) || "-";
  const end = endDate ? formatMonth(endDate) : "현재";
  return `${start} ~ ${end}`;
}
