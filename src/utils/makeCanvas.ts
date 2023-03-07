export function makeCanvas(container: HTMLDivElement) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("id", "__PTRwindow_canvas_element");
  canvas.style.outline = `1px solid blue`;
  canvas.style.background = "black";
  container.appendChild(canvas);
  return canvas;
}
