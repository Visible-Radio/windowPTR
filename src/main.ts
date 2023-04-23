import configureCanvas from "./lib/configureCanvas";
import drawBorder from "./lib/drawBorder";
import calculateDisplayMetrics, {
  canvasConfigOptionsDefault,
} from "./lib/calculateDisplayMetrics";
import { ptrEventEmitter } from "./pubsub/ptrEmitter";
import { store } from "./lib/state/state";
import { drawScreen } from "./lib/draw/drawScreen";
import { layoutByNode } from "./lib/layout/layoutByNode";
import { parse } from "./lib/parse/parser";
import { useActions } from "./lib/actions/actions";

ptrEventEmitter.subscribe("init", ({ data }) => {
  const { getTools, ctx, charDefs, root, simpleText } = data;
  const dm = calculateDisplayMetrics(charDefs.charWidth, root);
  configureCanvas(ctx, dm);
  drawBorder(getTools, dm);
  const tree = parse(simpleText);
  const layoutList = layoutByNode({ tree, dm });
  window.addEventListener("resize", onWindowResize);
  store.setState(prev => ({ ...prev, dm, layoutList }));
  useActions();
});

ptrEventEmitter.publish("init", {
  ...store.getState(),
});

store.subscribe(
  ({ dm, ctx, getTools }) => ({ dm, ctx, getTools }),
  ({ dm, ctx }) => configureCanvas(ctx, dm)
);

store.subscribe(
  ({ dm }) => ({ dm }),
  ({ dm }) => {
    const tree = parse(store.getState().simpleText);
    store.setState({
      layoutList: layoutByNode({ dm, tree }),
    });
  }
);

function mainLoop() {
  function frame() {
    // TODO: calculate time difference
    // TODO: update actors (IE nodes that have their own animations)
    const { layoutList } = store.getState();
    drawScreen(layoutList);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
mainLoop();

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
