// SHUT UP I WANT TO DO MY FP THINGS HERE
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
export function trace(args) {
  console.log(args);
  return args;
}

export function compose(...functions) {
  return (...args) => functions.reduceRight((acc, fn) => fn(acc), ...args);
}
