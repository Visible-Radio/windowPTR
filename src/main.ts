import configureCanvas from "./lib/configureCanvas";
import drawBorder from "./lib/drawBorder";
import calculateDisplayMetrics, {
  canvasConfigOptionsDefault,
} from "./lib/calculateDisplayMetrics";
import { useDrawingTools } from "./lib/makeDrawingTools";
import { ptrEventEmitter } from "./pubsub/ptrEmitter";
import { DisplayMetrics } from "./utils/typeUtils/configuredCanvas";
import { store } from "./lib/state/state";
import { layoutByWord } from "./lib/layout/layoutByWord";
import {
  animatedScrollDown,
  animatedScrollTo,
  animatedScrollUp,
  end,
  home,
  pageDown,
  pageUp,
} from "./lib/actions/actions";
import { drawScreen } from "./lib/draw/drawScreen";

ptrEventEmitter.subscribe("init", ({ data }) => {
  const { getTools, ctx, charDefs, root, simpleText } = data;
  const dm = calculateDisplayMetrics(charDefs.charWidth, root);
  configureCanvas(ctx, dm);
  drawBorder(getTools, dm);
  // drawCellOutlines(getTools, dm);
  const layoutList = layoutByWord({ simpleText, dm });
  drawScreen(layoutList);
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") {
      // animatedScrollDown(1);
      end();
    } else if (e.key === "ArrowUp") {
      // animatedScrollUp(1);
      home();
    } else if (e.key === "ArrowRight") {
      pageDown();
      // animatedScrollTo(1500);
    } else if (e.key === "ArrowLeft") {
      // animatedScrollTo(0);
      pageUp();
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
    store.setState({ layoutList: layoutByWord({ dm, simpleText }) });
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
  drawScreen(store.getState().layoutList);
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
