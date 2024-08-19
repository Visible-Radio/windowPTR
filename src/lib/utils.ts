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

export function generateRandomColors() {
  const random = () => {
    const num = Math.floor(Math.random() * (350 - 50) + 50);
    return num > 255 ? 255 : num;
  };
  const R = random();
  const G = random();
  const B = random();
  const color = `rgb(${R},${G},${B})`;
  return color;
}
