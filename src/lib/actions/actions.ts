import calculateDisplayMetrics, {
  canvasConfigOptionsDefault,
} from "../calculateDisplayMetrics";
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
    const maxScroll = layoutList.at(-1).y - drawAreaTop_du;

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
    layoutList.at(-1).y - dm.drawAreaTop_du
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
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

/** currently handles cases where the current position is less than the requested position */
export function animatedScrollTo(yCoord_du: number) {
  const startingPosition = store.getState().scrollY_du;
  let iteration = 0;
  function frame() {
    if (store.getState().scrollY_du >= yCoord_du) {
      store.setState({
        scrollY_du: yCoord_du,
      });
      return;
    }
    const progress = iteration / 60;
    const newPosition = Math.min(
      startingPosition + Math.floor(easeInOut(progress) * yCoord_du),
      yCoord_du
    );
    store.setState({
      scrollY_du: newPosition,
    });
    iteration += 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
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
