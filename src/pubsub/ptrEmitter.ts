import calculateDisplayMetrics from "../lib/calculateDisplayMetrics";
import createEventEmitter from "./createEventEmitter";

export type PtrEventMap = {
  windowResize: { windowResizeEventData: string };
  scroll: unknown;
  appendMessage: { message: string; otherStuff: string };
  scrollTo: unknown;
};

export const ptrEventEmitter = createEventEmitter<PtrEventMap>();

export type StateEventMap = {
  stateChange: { dm: ReturnType<typeof calculateDisplayMetrics> };
};

export const stateEmitter = createEventEmitter<StateEventMap>();
