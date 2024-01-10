import configureCanvas from "./configureCanvas";
import drawBorder from "./drawBorder";
import calculateDisplayMetrics, {
  DisplayConfigOptions,
  displayConfigOptionsDefault,
} from "./calculateDisplayMetrics";
import { createActions } from "./actions/actions";
import { createDrawScreen } from "./draw/drawScreen";
import { layoutByNode } from "./layout/layoutByNode";
import { parse } from "./parse/parser";
import { createPtrGlobalStore } from "./state/state";

// TODO: Pass initial text option
// TODO: Pass charDefs
// TODO: 'teletype' text animation on first draw
// TODO: 'blink' text animation on first draw
// TODO: persistent blink animatino

export function createPTR(
  containerElement: HTMLDivElement,
  options?: Partial<DisplayConfigOptions>
) {
  const displayOptions = {
    ...displayConfigOptionsDefault,
    ...options,
  };
  const store = createPtrGlobalStore({ displayOptions, containerElement });
  const actions = createActions(store, displayOptions);
  const drawScreen = createDrawScreen(store);

  const {
    getTools,
    ctx,
    charDefs,
    root,
    documentSource: simpleText,
  } = store.getState();

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
      const tree = parse(store.getState().documentSource);
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

declare global {
  interface Window {
    _createPTR: typeof createPTR;
  }
}

window._createPTR = createPTR;
