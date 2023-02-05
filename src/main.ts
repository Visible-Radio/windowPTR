import { makeCanvas, modifyDefs } from "./lib/init";
import configureCanvas from "./lib/configureCanvas";
import customDefs from "./lib/customDefs_charWidth_7";
import drawBorder from "./lib/drawBorder";
import drawCellOutlines from "./lib/drawCellOutlines";
import calculateDisplayMetrics from "./lib/calculateDisplayMetrics";
import { createSubscribableStore } from "./stateContainer/createSubscribableStore";

/* root div to attach canvas to */
const root = document.getElementById("root") as HTMLDivElement;

const modifiedDefs = modifyDefs(customDefs);

/* subscribe to window size changes */
window.addEventListener("resize", onWindowResize);

/* initial setup */
const cb = configureCanvas(
  makeCanvas(root),
  calculateDisplayMetrics(modifiedDefs.charWidth, root)
);

/* initial draw */
drawBorder(cb);
drawCellOutlines(cb);

const store = createSubscribableStore({
  dm: calculateDisplayMetrics(modifiedDefs.charWidth, root),
});

store.subscribe(
  ({ dm }) => dm.displayWidth_px,
  displayCols => console.log(`displayWidth_px is ${displayCols}`)
);

store.subscribe(
  ({ dm }) => dm.displayColumns,
  displayCols => {
    console.log(`display cols are ${displayCols}`);
  }
);

store.subscribe(
  ({ dm }) => dm,
  dm => {
    const canvasBundle = configureCanvas(cb.canvas, dm);
    drawCellOutlines(drawBorder(canvasBundle));
  }
);

function onWindowResize() {
  const newDm = calculateDisplayMetrics(modifiedDefs.charWidth, root);
  if (store.getState().dm.displayColumns !== newDm.displayColumns) {
    store.setState(prev => ({ ...prev, dm: newDm }));
  }
}
