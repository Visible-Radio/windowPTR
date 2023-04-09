export function makeCanvas(container: HTMLDivElement) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("id", "__PTRwindow_canvas_element");
  canvas.style.background = "black";
  // canvas.style.outline = `2px solid rgb(200, 0, 120)`;
  container.appendChild(canvas);
  return canvas;
}
