export function getTodaysDate() {
  const date = new Date();
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const localDate = new Date(msLocal).toISOString().split('T')[0];
  return localDate!;
}

export function getLocaleDateString(timestamp: Date) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' : ''}${
    date.getMonth() + 1
  }-${date.getDate() + 1 < 10 ? '0' : ''}${date.getDate() + 1}`;
}
