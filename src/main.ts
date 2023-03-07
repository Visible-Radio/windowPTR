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
import { modifyDefs } from "./utils/modifyDefs";
import { makeCanvas } from "./utils/makeCanvas";
import { DisplayMetrics } from "./utils/typeUtils/configuredCanvas";
import { gridPositionFromIndex } from "./utils/gridPositionFromIndex";
import { rgbToString } from "./utils/rgbToString";

const charDefs = modifyDefs(customDefs);
const initRoot = document.getElementById("root") as HTMLDivElement;
const initCtx = makeCanvas(initRoot).getContext("2d")!;
const initText =
  "The sky was the color of a television tuned to a dead channel";
const initDm = calculateDisplayMetrics(charDefs.charWidth, initRoot);
const intDrawingTools = useDrawingTools(initCtx);

const store = createSubscribableStore({
  dm: initDm,
  charDefs,
  root: initRoot,
  ctx: initCtx,
  getTools: intDrawingTools,
  simpleText: initText,
  scrollY_du: 0,
  layoutList: [],
});

ptrEventEmitter.subscribe("init", ({ data }) => {
  const { getTools, ctx, charDefs, root, simpleText } = data;
  const dm = calculateDisplayMetrics(charDefs.charWidth, root);
  configureCanvas(ctx, dm);
  drawBorder(getTools, dm);
  // drawCellOutlines(getTools, dm);
  const layoutList = layoutPage({ simpleText, dm });
  drawScreen(layoutList);
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") {
      // scrollDown();
      scrollDownOneRow();
    } else if (e.key === "ArrowUp") {
      // scrollUp();
      scrollUpOneRow();
    }
  });

  store.setState(prev => ({ ...prev, dm, layoutList }));
});

ptrEventEmitter.publish("init", {
  ...store.getState(),
});

store.subscribe(
  ({ dm, ctx, getTools }) => ({ dm, ctx, getTools }),
  syncDisplayWithMetrics
);

store.subscribe(
  ({ dm, simpleText }) => ({ dm, simpleText }),
  ({ dm, simpleText }) => {
    store.setState({ layoutList: layoutPage({ dm, simpleText }) });
  }
);

store.subscribe(
  ({ layoutList }) => ({ layoutList }),
  ({ layoutList }) => {
    drawScreen(layoutList);
  }
);

store.subscribe(
  ({ scrollY_du }) => ({ scrollY_du }),
  () => {
    drawScreen(store.getState().layoutList);
  }
);

function drawScreen(layoutList: ReturnType<typeof layoutPage>) {
  const { getTools, charDefs, dm, scrollY_du } = store.getState();
  const { ctx, fillRect_du, clearRect_du } = getTools(dm.scale);
  ctx.fillStyle = rgbToString(dm.borderColor);
  ctx.lineWidth = dm.scale;
  clearRect_du(
    dm.drawAreaLeft_du,
    dm.drawAreaTop_du,
    dm.drawAreaRight_du,
    dm.drawAreaHeight_du
  );
  for (const { x: cursorX_du, y: cursorY_du, char } of layoutList) {
    /*
    TODO: Remove the "magic number" in the check below
     */
    if (
      cursorY_du > scrollY_du + dm.drawAreaHeight_du ||
      cursorY_du + dm.cellHeight_du - 4 < scrollY_du
    ) {
      continue;
    }

    const c = char.toUpperCase() in charDefs ? char.toUpperCase() : " ";

    charDefs[c].forEach(point => {
      const { x, y } = gridPositionFromIndex({
        index: point,
        columns: dm.cellWidth_du,
      });
      const adjustedX = x + cursorX_du;
      const adjustedY = y + cursorY_du - scrollY_du;

      if (
        !(adjustedY >= dm.drawAreaBottom_du || adjustedY < dm.drawAreaTop_du)
      ) {
        // prevent drawing pixels in top and bottom gutters
        fillRect_du(adjustedX, adjustedY, 1, 1);
      }
    });
  }
}

interface syncDisplayWithMetricsArgs extends Record<string, unknown> {
  dm: DisplayMetrics;
  ctx: CanvasRenderingContext2D;
  getTools: ReturnType<typeof useDrawingTools>;
}

/** Sets the size of the canvas element in accordance with display metrics, draws the border, and cell outlines */
function syncDisplayWithMetrics({
  dm,
  ctx,
  getTools,
}: syncDisplayWithMetricsArgs) {
  configureCanvas(ctx, dm);
  drawBorder(getTools, dm);
  // drawCellOutlines(getTools, dm);
}

function lex(document: string) {
  /** string being built */
  let text = "";
  /** whether or not the current character is between a pair of angle brackets  */
  let inAngle = false;
  for (const char of document) {
    if (char === "<") {
      inAngle = true;
    } else if (char === ">") {
      inAngle = false;
    } else if (!inAngle) {
      text += char;
    }
  }
  return text;
}

interface layoutPageArgs {
  simpleText: ReturnType<typeof store.getState>["simpleText"];
  dm: DisplayMetrics;
}

function layoutPage({ simpleText, dm }: layoutPageArgs) {
  const displayList = [];
  const xStep = dm.cellWidth_du + dm.gridSpaceX_du;
  const yStep = dm.cellHeight_du + dm.gridSpaceY_du;
  const lastColumnXCoord = dm.getColumnXCoord_du(dm.displayColumns - 1);
  let cursorX_du = dm.drawAreaLeft_du;
  let cursorY_du = dm.drawAreaTop_du;

  for (const char of simpleText) {
    displayList.push({ x: cursorX_du, y: cursorY_du, char });

    if (cursorX_du >= lastColumnXCoord) {
      cursorX_du = dm.drawAreaLeft_du;
      cursorY_du += yStep;
    } else {
      cursorX_du += xStep;
    }
  }
  return displayList;
}

function onWindowResize() {
  const newDm = calculateDisplayMetrics(
    store.getState().dm.cellWidth_du,
    store.getState().root,
    {
      ...canvasConfigOptionsDefault,
      scale: store.getState().dm.scale,
      displayRows: store.getState().dm.displayRows,
    }
  );
  if (store.getState().dm.displayColumns !== newDm.displayColumns) {
    store.setState(prev => ({ ...prev, dm: newDm }));
  }
}

function setScale(userScale: number) {
  if (userScale < 1) throw new Error("cannot set scale less than 1");
  if (userScale > 10) throw new Error("cannot set scale greater than 10");
  store.setState(prev => ({
    ...prev,
    dm: calculateDisplayMetrics(prev.dm.cellWidth_du, prev.root, {
      ...canvasConfigOptionsDefault,
      scale: userScale,
      displayRows: prev.dm.displayRows,
      gridSpaceX_du: prev.dm.gridSpaceX_du,
      gridSpaceY_du: prev.dm.gridSpaceY_du,
    }),
  }));
}

function setRows(userDisplayRows: number) {
  if (userDisplayRows < 1)
    throw new Error("cannot set display rows less than 1");
  if (userDisplayRows > 40)
    throw new Error("cannot set display rows greater than 40");
  store.setState(prev => ({
    ...prev,
    dm: calculateDisplayMetrics(prev.dm.cellWidth_du, prev.root, {
      ...canvasConfigOptionsDefault,
      scale: prev.dm.scale,
      displayRows: userDisplayRows,
      gridSpaceX_du: prev.dm.gridSpaceX_du,
      gridSpaceY_du: prev.dm.gridSpaceY_du,
    }),
  }));
}

function setGridSpace(userGridSpace: number) {
  if (userGridSpace < 0) throw new Error("cannot set negative gridSpace");
  if (userGridSpace > 5) throw new Error("cannot set gridSpace greater than 5");
  store.setState(prev => ({
    ...prev,
    dm: calculateDisplayMetrics(prev.dm.cellWidth_du, prev.root, {
      ...canvasConfigOptionsDefault,
      scale: prev.dm.scale,
      displayRows: prev.dm.displayRows,
      gridSpaceX_du: userGridSpace,
      gridSpaceY_du: userGridSpace,
    }),
  }));
}

function setScroll(scrollValue: number) {
  store.setState(prev => ({
    ...prev,
    scrollY_du: scrollValue,
  }));
}

function scrollDown() {
  store.setState(prev => {
    const { drawAreaTop_du } = prev.dm;
    const { scrollY_du, layoutList } = prev;

    const maxScroll = layoutList.at(-1).y - drawAreaTop_du;

    return {
      ...prev,
      scrollY_du: scrollY_du >= maxScroll ? scrollY_du : scrollY_du + 1,
    };
  });
}

function scrollDownOneRow() {
  const { layoutList, scrollY_du, dm } = store.getState();
  const step = dm.cellHeight_du + dm.gridSpaceY_du;
  const targetScroll = Math.min(
    scrollY_du + step,
    layoutList.at(-1).y - dm.drawAreaTop_du
  );
  const timerId = setInterval(() => {
    if (targetScroll > store.getState().scrollY_du) {
      scrollDown();
    } else {
      clearInterval(timerId);
    }
  }, 15);
}

function scrollUpOneRow() {
  const { scrollY_du, dm } = store.getState();
  const step = dm.cellHeight_du + dm.gridSpaceY_du;

  const targetScroll = Math.max(0, scrollY_du - step);
  const timerId = setInterval(() => {
    if (targetScroll < store.getState().scrollY_du) {
      scrollUp();
    } else {
      clearInterval(timerId);
    }
  }, 15);
}

function scrollUp() {
  store.setState(prev => ({
    ...prev,
    scrollY_du: prev.scrollY_du > 0 ? prev.scrollY_du - 1 : prev.scrollY_du,
  }));
}

const PTR = {
  setScale,
  setRows,
  setGridSpace,
  setScroll,
  scrollDown,
  scrollUp,
  setSimpleText(text: string) {
    store.setState(prev => ({ ...prev, simpleText: text }));
  },
};

window._PTR = PTR;
