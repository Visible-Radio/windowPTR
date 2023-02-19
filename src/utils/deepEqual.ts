// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function deepEqual(a: any, b: any): boolean {
  if (a === b) {
    // skip other comparisons if same memory reference or primitives
    return true;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length === 0 && bKeys.length === 0) return true;
    if (aKeys.length !== bKeys.length) return false;
    if (bKeys.some(k => !aKeys.includes(k))) return false;

    for (const key of aKeys) {
      if (!bKeys.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  if (typeof a !== typeof b) return false;
  if (typeof a === "function" && typeof b === "function") {
    return a.toString() === b.toString();
  }
  return false;
}
