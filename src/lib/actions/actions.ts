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

export function scrollDown() {
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
// TODO - add isScrolling to store
let isScrolling = false;
export function scrollDownOneRow() {
  if (isScrolling) return;
  const { layoutList, scrollY_du, dm } = store.getState();
  const step = dm.cellHeight_du + dm.gridSpaceY_du;
  const targetScroll = Math.min(
    scrollY_du + step,
    layoutList.at(-1).y - dm.drawAreaTop_du
  );
  const timerId = setInterval(() => {
    if (targetScroll > store.getState().scrollY_du) {
      isScrolling = true;
      scrollDown();
    } else {
      isScrolling = false;
      clearInterval(timerId);
    }
  }, 15);
}

export function scrollUpOneRow() {
  if (isScrolling) return;
  const { scrollY_du, dm } = store.getState();
  const step = dm.cellHeight_du + dm.gridSpaceY_du;

  const targetScroll = Math.max(0, scrollY_du - step);
  const timerId = setInterval(() => {
    if (targetScroll < store.getState().scrollY_du) {
      isScrolling = true;
      scrollUp();
    } else {
      isScrolling = false;
      clearInterval(timerId);
    }
  }, 15);
}

export function scrollUp() {
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
