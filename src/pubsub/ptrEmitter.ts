import createEventEmitter from "./createEventEmitter";

export type PtrEventMap = {
  init: any;
};

export const createPtrEventEmitter = () => createEventEmitter<PtrEventMap>();
