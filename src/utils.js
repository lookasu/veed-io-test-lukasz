export function nDaysAgo(n) {
  // https://stackoverflow.com/questions/1296358/how-to-subtract-days-from-a-plain-date
  return new Date(new Date() - n * 86400000);
}
