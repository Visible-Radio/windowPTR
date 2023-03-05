interface gridPositionFromIndexArgs {
  index: number;
  columns: number;
}

/** Converts a 2D point represented as an index to (x,y) coordinates */
export function gridPositionFromIndex({
  index,
  columns,
}: gridPositionFromIndexArgs) {
  if (index >= 0) {
    const y = Math.floor(index / columns);
    const x = index % columns;
    return {
      x,
      y,
    };
  }
  if (index < 0) {
    const y = Math.floor(index / columns);
    const x =
      index % columns === 0 ? index % columns : (index % columns) + columns;

    return {
      x,
      y,
    };
  }
  /* fallback...not sure how we'd ever get here, but this shuts TS up. */
  return { x: 0, y: 0 };
}
