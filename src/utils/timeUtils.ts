export function getTodaysDate() {
  const date = new Date();
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const localDate = new Date(msLocal).toISOString().split('T')[0];
  return localDate!;
}

export function getUTCDateString(timestamp: Date) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getUTCMonth() + 1 < 10 ? '0' : ''}${
    date.getMonth() + 1
  }-${date.getUTCDate() < 10 ? '0' : ''}${date.getUTCDate()}`;
}

export function getHowLongAgo(timestamp: Date) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(timestamp).getTime()) / 1000
  );

  let interval = seconds / 31536000;

  if (interval > 1) {
    return `${Math.floor(interval)} years ago`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${Math.floor(interval)} months ago`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${Math.floor(interval)} days ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `${Math.floor(interval)} hours ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${Math.floor(interval)} minutes ago`;
  }
  return `${Math.floor(seconds)} seconds ago`;
}
