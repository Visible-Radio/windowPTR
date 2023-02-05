export function trace(args) {
  console.log(args);
  return args;
}

export function compose(...functions) {
  return (...args) => functions.reduceRight((acc, fn) => fn(acc), ...args);
}
