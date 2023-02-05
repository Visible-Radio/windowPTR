/**
 * Takes a scale multiplier and returns a function that will scale it's arguments by that multiplier
 */
export default function makeDu(scale: number) {
  return (...args: number[]) => args.map(a => a * scale);
}
