import calculateDisplayMetrics, {
  canvasConfigOptionsDefault,
} from "../calculateDisplayMetrics";
import { layoutByNode } from "../layout/layoutByNode";
import { parse } from "../parse/parser";
import { store } from "../state/state";

export function setScale(userScale: number) {
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

export function setRows(userDisplayRows: number) {
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

export function setGridSpace(userGridSpace: number) {
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
export function setGridSpaceX(userGridSpace: number) {
  store.setState(prev => ({
    ...prev,
    dm: calculateDisplayMetrics(prev.dm.cellWidth_du, prev.root, {
      ...canvasConfigOptionsDefault,
      scale: prev.dm.scale,
      displayRows: prev.dm.displayRows,
      gridSpaceX_du: userGridSpace,
    }),
  }));
}
export function setGridSpaceY(userGridSpace: number) {
  store.setState(prev => ({
    ...prev,
    dm: calculateDisplayMetrics(prev.dm.cellWidth_du, prev.root, {
      ...canvasConfigOptionsDefault,
      scale: prev.dm.scale,
      displayRows: prev.dm.displayRows,
      gridSpaceY_du: userGridSpace,
    }),
  }));
}

export function setScroll(scrollValue: number) {
  store.setState(prev => ({
    ...prev,
    scrollY_du: scrollValue,
  }));
}

export function scrollDown(increment = 1) {
  store.setState(prev => {
    const { drawAreaTop_du } = prev.dm;
    const { scrollY_du, layoutList } = prev;
    const maxScroll = layoutList.at(-1)!.y - drawAreaTop_du;

    return {
      ...prev,
      scrollY_du: scrollY_du >= maxScroll ? scrollY_du : scrollY_du + increment,
    };
  });
}

export function scrollUp(decrement = 1) {
  store.setState(prev => ({
    ...prev,
    scrollY_du:
      prev.scrollY_du - decrement >= 0
        ? prev.scrollY_du - decrement
        : prev.scrollY_du,
  }));
}

export function animatedScrollDown(increment = 1) {
  const { layoutList, scrollY_du, dm } = store.getState();

  const step = dm.cellHeight_du + dm.gridSpaceY_du;
  const targetScroll = Math.min(
    scrollY_du + step,
    layoutList.at(-1)!.y - dm.drawAreaTop_du
  );

  function scrollDownAnimation() {
    if (store.getState().scrollY_du >= targetScroll) {
      return;
    }
    scrollDown(increment);
    requestAnimationFrame(scrollDownAnimation);
  }

  requestAnimationFrame(scrollDownAnimation);
}

export function animatedScrollUp(decrement = 1) {
  const { scrollY_du, dm } = store.getState();

  const step = dm.cellHeight_du + dm.gridSpaceY_du;

  const targetScroll = Math.max(0, scrollY_du - step);

  function scrollUpAnimation() {
    if (store.getState().scrollY_du <= targetScroll) {
      return;
    }
    scrollUp(decrement);
    requestAnimationFrame(scrollUpAnimation);
  }

  requestAnimationFrame(scrollUpAnimation);
}

/** like the css timing function. t input is 0 - 1, representing the progress of the animation. Thanks chatGPT */
function easeInOut(t: number) {
  const ret = t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  // console.log("ease fn called", t, ret);
  return ret;
}

/** currently handles cases where the current position is less than the requested position */
export function animatedScrollTo(destinationPosition: number) {
  const startingPosition = store.getState().scrollY_du;
  const direction = startingPosition < destinationPosition ? "down" : "up";
  let iterations = 0;

  store.setState({ isScrolling: true });

  function frame() {
    const progressFactor = easeInOut(iterations / 60);
    if (direction === "down") {
      const newPosition =
        startingPosition +
        progressFactor * (destinationPosition - startingPosition);

      if (newPosition >= destinationPosition) {
        store.setState({
          scrollY_du: destinationPosition,
          isScrolling: false,
        });
        return;
      } else {
        store.setState({
          scrollY_du: newPosition,
        });
      }
    } else if (direction === "up") {
      const newPosition =
        startingPosition -
        progressFactor * (startingPosition - destinationPosition);

      if (newPosition <= destinationPosition) {
        store.setState({
          scrollY_du: destinationPosition,
          isScrolling: false,
        });
        return;
      } else {
        store.setState({
          scrollY_du: newPosition,
        });
      }
    }
    iterations++;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

export function pageDown() {
  const { dm, scrollY_du, isScrolling } = store.getState();
  const { displayRows, gridSpaceY_du, cellHeight_du } = dm;
  const lastRow = scrollY_du + displayRows * (gridSpaceY_du + cellHeight_du);
  if (isScrolling) return;
  animatedScrollTo(lastRow);
}

export function pageUp() {
  const { dm, scrollY_du, isScrolling } = store.getState();
  const { displayRows, gridSpaceY_du, cellHeight_du } = dm;
  const firstRow = scrollY_du - displayRows * (gridSpaceY_du + cellHeight_du);
  if (firstRow < 0 || isScrolling) return;
  animatedScrollTo(firstRow);
}

export function home() {
  // scroll all the way up
  const { isScrolling } = store.getState();
  if (isScrolling) return;
  animatedScrollTo(0);
}

export function end() {
  // scroll all the way down
  const { dm, isScrolling, layoutList } = store.getState();
  const { borderGutter_du, borderWidth_du } = dm;
  const end = layoutList.at(-1)!.y - borderGutter_du - borderWidth_du;
  if (isScrolling) return;
  animatedScrollTo(end);
}

export function appendText(documentText: string) {
  // note that while we are updating the _layoutList_ our _source_ has not been updated and text reflow on window resize will be broken
  // instead of manually bumping the Y coord when we append, maybe we need a <P> tag that causes the layout function to increment the Y coord
  // that way we can update both our _source_ and _layoutList_ but only parse and layout the appended source

  const { layoutList, dm, scrollY_du } = store.getState();
  const { y } = layoutList.at(-1) ?? {
    y: dm.drawAreaTop_du,
  };
  const tree = parse(documentText);
  const layoutTOAppend = layoutByNode({
    tree,
    dm,
    initCursorX_du: dm.drawAreaLeft_du,
    initCursorY_du:
      layoutList.length > 0 ? y + dm.cellHeight_du + dm.gridSpaceY_du : y,
  });

  store.setState(prev => ({
    ...prev,
    layoutList: prev.layoutList.concat(layoutTOAppend),
  }));

  // if the message is offscreen, we should scroll to the top of the message
  /* evil magic number alert - need the padding amount added by modifying chars for outlines */
  const appendedStart = layoutTOAppend[0].y - 4;
  if (appendedStart > scrollY_du + dm.drawAreaHeight_du) {
    animatedScrollTo(layoutTOAppend[0].y - 4);
  }
}

const PTR = {
  setScale,
  setRows,
  setGridSpace,
  setGridSpaceX,
  setGridSpaceY,
  setScroll,
  scrollDown,
  scrollUp,
  pageDown,
  pageUp,
  home,
  end,
  appendText,
  setSimpleText(text: string) {
    store.setState(prev => ({ ...prev, simpleText: text, scrollY_du: 0 }));
  },
};

declare global {
  interface Window {
    _PTR: typeof PTR;
  }
}

window._PTR = PTR;
