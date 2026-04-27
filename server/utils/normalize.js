export function asRollNumber(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}
