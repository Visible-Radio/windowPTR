import { makeCanvas, modifyDefs } from "./lib/init";
import configureCanvas from "./lib/configureCanvas";
import customDefs from "./lib/customDefs_charWidth_7";
import drawBorder from "./lib/drawBorder";
import drawCellOutlines from "./lib/drawCellOutlines";
import calculateDisplayMetrics, {
  canvasConfigOptionsDefault,
} from "./lib/calculateDisplayMetrics";
import { createSubscribableStore } from "./stateContainer/createSubscribableStore";
import { useDrawingTools } from "./lib/makeDrawingTools";
import { ptrEventEmitter } from "./pubsub/ptrEmitter";

const charDefs = modifyDefs(customDefs);
const initRoot = document.getElementById("root") as HTMLDivElement;
const initCtx = makeCanvas(initRoot).getContext("2d")!;
const intDrawingTools = useDrawingTools(initCtx);

const store = createSubscribableStore({
  dm: calculateDisplayMetrics(charDefs.charWidth, initRoot),
  charDefs,
  root: initRoot,
  ctx: initCtx,
  getTools: intDrawingTools,
});

ptrEventEmitter.subscribe("init", ({ data }) => {
  const { getTools, ctx, charDefs, root } = data;
  const dm = calculateDisplayMetrics(charDefs.charWidth, root);
  configureCanvas(ctx, dm);
  drawBorder(getTools, dm);
  drawCellOutlines(getTools, dm);
  window.addEventListener("resize", onWindowResize);
  store.setState(prev => ({ ...prev, dm }));
});

ptrEventEmitter.publish("init", {
  ...store.getState(),
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
    store.getState().root,
    {
      ...canvasConfigOptionsDefault,
      scale: store.getState().dm.scale,
    }
  );
  if (store.getState().dm.displayColumns !== newDm.displayColumns) {
    store.setState(prev => ({ ...prev, dm: newDm }));
  }
}

store.setState(prev => ({
  ...prev,
  dm: calculateDisplayMetrics(prev.dm.cellWidth_du, prev.root, {
    ...canvasConfigOptionsDefault,
    scale: 5,
  }),
}));

function setScale(userScale: number) {
  store.setState(prev => ({
    ...prev,
    dm: calculateDisplayMetrics(prev.dm.cellWidth_du, prev.root, {
      ...canvasConfigOptionsDefault,
      scale: userScale,
    }),
  }));
}

const PTR = {
  setScale,
};

window._PTR = PTR;
