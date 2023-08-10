export function makeRoot(container: HTMLDivElement, idExtension?: string) {
  const root = document.createElement("div");
  root.setAttribute("id", `__PTRwindow_root_element-${idExtension}`);
  root.classList.add("PTRwindow_root_element");
  root.style.boxSizing = "border-box";
  container.appendChild(root);
  return root;
}
