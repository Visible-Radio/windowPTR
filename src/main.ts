import configureCanvas from "./lib/configureCanvas";
import drawBorder from "./lib/drawBorder";
import calculateDisplayMetrics, {
  DisplayConfigOptions,
  displayConfigOptionsDefault,
} from "./lib/calculateDisplayMetrics";
import { createActions } from "./lib/actions/actions";
import { createDrawScreen } from "./lib/draw/drawScreen";
import { layoutByNode } from "./lib/layout/layoutByNode";
import { parse } from "./lib/parse/parser";
import { createPtrGlobalStore } from "./lib/state/state";

// TODO: Pass initial text option
// TODO: Pass render into element, or generate the element on init

function createPTR(options?: Partial<DisplayConfigOptions>) {
  const displayOptions = {
    ...displayConfigOptionsDefault,
    ...options,
  };
  const store = createPtrGlobalStore({ displayOptions });
  const actions = createActions(store, displayOptions);
  const drawScreen = createDrawScreen(store);

  const { getTools, ctx, charDefs, root, simpleText } = store.getState();

  const dm = calculateDisplayMetrics(charDefs.charWidth, root, displayOptions);
  configureCanvas(ctx, dm);
  drawBorder(getTools, dm);
  const tree = parse(simpleText);
  const layoutList = layoutByNode({ tree, dm });
  drawScreen(layoutList);
  window.addEventListener("resize", onWindowResize);
  store.setState(prev => ({ ...prev, dm, layoutList }));

  store.subscribe(
    ({ dm, ctx }) => ({ dm, ctx }),
    ({ dm, ctx }) => {
      configureCanvas(ctx, dm);
      const tree = parse(store.getState().simpleText);
      store.setState({
        layoutList: layoutByNode({ dm, tree }),
      });
    }
  );

  store.subscribe(
    ({ layoutList, dm }) => ({ layoutList, dm }),
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

  /** Sets the size of the canvas element in accordance with display metrics, draws the border, and cell outlines */
  function onWindowResize() {
    const newDm = calculateDisplayMetrics(
      store.getState().dm.cellWidth_du,
      store.getState().root,
      {
        ...displayOptions,
        scale: store.getState().dm.scale,
        displayRows: store.getState().dm.displayRows,
      }
    );
    if (store.getState().dm.displayColumns !== newDm.displayColumns) {
      store.setState(prev => ({ ...prev, dm: newDm }));
    }
  }

  return { actions, store };
}

const PTR = createPTR({
  scale: 2,
});

// in order to instantiate more, each PTR needs it's own root div for measurements
// const PTR_2 = createPTR({
//   scale: 2,
// });

declare global {
  interface Window {
    _PTR: typeof PTR;
  }
}

window._PTR = PTR;
