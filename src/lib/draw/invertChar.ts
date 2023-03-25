export function invertChar(def: number[], charWidth: number) {
  const full: number[] = [];
  for (let i = 0; i < charWidth * charWidth; i++) {
    if (!def.includes(i)) full.push(i);
  }
  return full;
}
