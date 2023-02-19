import { makeCanvas, modifyDefs } from "./lib/init";
import configureCanvas from "./lib/configureCanvas";
import customDefs from "./lib/customDefs_charWidth_7";
import drawBorder from "./lib/drawBorder";
import drawCellOutlines from "./lib/drawCellOutlines";
import calculateDisplayMetrics from "./lib/calculateDisplayMetrics";
import { createSubscribableStore } from "./stateContainer/createSubscribableStore";
import { useDrawingTools } from "./lib/makeDrawingTools";
import { ptrEventEmitter } from "./pubsub/ptrEmitter";
import { DisplayMetrics } from "./utils/typeUtils/configuredCanvas";

/* this works, but we've probably broken limited reactivity by putting functions and complex objects in state*/
/* types are also fucked */

const store = createSubscribableStore({
  dm: undefined as unknown as DisplayMetrics,
  charDefs: undefined,
});

ptrEventEmitter.subscribe("init", ({ data }) => {
  const { charDefs, root } = data;
  const dm = calculateDisplayMetrics(charDefs.charWidth, root);
  const ctx = makeCanvas(root).getContext("2d")!;
  const getTools = useDrawingTools(ctx);
  configureCanvas(ctx, dm);
  drawBorder(getTools, dm);
  drawCellOutlines(getTools, dm);
  window.addEventListener("resize", onWindowResize);
  store.setState(prev => ({ ...prev, dm, root, ctx, getTools }));
});

ptrEventEmitter.publish("init", {
  root: document.getElementById("root") as HTMLDivElement,
  charDefs: modifyDefs(customDefs),
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
  ({ dm, ctx, getTools }) => ({ dm, ctx, getTools }),
  ({ dm, ctx, getTools }) => {
    configureCanvas(ctx, dm);
    drawBorder(getTools, dm);
    drawCellOutlines(getTools, dm);
  }
);

function onWindowResize() {
  const newDm = calculateDisplayMetrics(
    store.getState().dm.cellWidth_du,
    store.getState().root
  );
  if (store.getState().dm.displayColumns !== newDm.displayColumns) {
    store.setState(prev => ({ ...prev, dm: newDm }));
  }
}

// const root = document.getElementById("root") as HTMLDivElement;
// const modifiedDefs = modifyDefs(customDefs);
// const canvas = makeCanvas(root);
// const dm = calculateDisplayMetrics(modifiedDefs.charWidth, root);

// export const ctx = canvas.getContext("2d")!;
// export const getTools = useDrawingTools(ctx);

// ptrEventEmitter.subscribe("init", ({ data }) => {
//   const { dm, ctx } = data;
//   configureCanvas(ctx, dm);
//   drawBorder(getTools, dm);
//   drawCellOutlines(getTools, dm);
//   window.addEventListener("resize", onWindowResize);
// });

// ptrEventEmitter.publish("init", {
//   charDefs: modifiedDefs,
//   dm,
//   ctx,
// });

// const store = createSubscribableStore({
//   dm,
//   charDefs: modifiedDefs,
// });

// store.subscribe(
//   ({ dm }) => dm.displayWidth_px,
//   displayCols => console.log(`displayWidth_px is ${displayCols}`)
// );

// store.subscribe(
//   ({ dm }) => dm.displayColumns,
//   displayCols => {
//     console.log(`display cols are ${displayCols}`);
//   }
// );

// store.subscribe(
//   ({ dm }) => dm,
//   dm => {
//     configureCanvas(ctx, dm);
//     drawBorder(getTools, dm);
//     drawCellOutlines(getTools, dm);
//   }
// );

// function onWindowResize() {
//   const newDm = calculateDisplayMetrics(modifiedDefs.charWidth, root);
//   if (store.getState().dm.displayColumns !== newDm.displayColumns) {
//     store.setState(prev => ({ ...prev, dm: newDm }));
//   }
// }
