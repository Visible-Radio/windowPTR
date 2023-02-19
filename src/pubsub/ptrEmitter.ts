import createEventEmitter from "./createEventEmitter";

export type PtrEventMap = {
  // windowResize: { windowResizeEventData: string };
  // scroll: unknown;
  // appendMessage: { message: string; otherStuff: string };
  // scrollTo: unknown;
  init: any;
};

export const ptrEventEmitter = createEventEmitter<PtrEventMap>();
