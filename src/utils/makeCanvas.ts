export function makeCanvas(container: HTMLDivElement) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("id", "__PTRwindow_canvas_element");
  canvas.style.outline = `1px solid blue`;
  container.appendChild(canvas);
  return canvas;
}
