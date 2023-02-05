export default function deepEqual(a: object, b: object) {
  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null
  )
    // args were objects other than null
    return Object.keys(a).reduce((acc, key) => {
      // a[key] could be a primitive or an object
      // if it is an object, return deepEqual(a[key], b[key], [...keyPath, key])
      if (typeof a[key] === "object" && a[key] !== null) {
        if (b.hasOwnProperty(key)) {
          return deepEqual(a[key], b[key]);
        } else {
          return acc && false;
        }
      }
      // if it is a primitive, compare it to b[key]
      if (a[key] === b[key]) {
        return acc && true;
      } else {
        return acc && false;
      }
    }, true);
  // args were primities
  return a === b;
}
