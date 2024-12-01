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

const random8Bit = () => {
  const num = Math.floor(Math.random() * (350 - 50) + 50);
  return num > 255 ? 255 : num;
};

export function generateRandomColors(alpha = 1) {
  const R = random8Bit();
  const G = random8Bit();
  const B = random8Bit();
  const color = `rgba(${R},${G},${B},${alpha})`;
  return color;
}

export function generateRandomRgb8Bit() {
  const R = random8Bit();
  const G = random8Bit();
  const B = random8Bit();
  return [R, G, B];
}
