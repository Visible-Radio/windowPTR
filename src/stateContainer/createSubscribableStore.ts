import deepEqual from "../utils/deepEqual";

export function createSubscribableStore<
  StoreType extends boolean | string | number | Record<string, unknown>
>(initialValues: StoreType) {
  let state: Readonly<StoreType> = initialValues;

  const subscribers = new Map<
    (selectorResult: any) => void,
    { selector: (state: StoreType) => unknown; prevSelectorResult: unknown }
  >();

  function subscribe<
    SelectorResult extends
      | boolean
      | string
      | number
      | Record<string, unknown>
      | unknown[]
  >(
    selector: (state: StoreType) => SelectorResult,
    cb: (selectorResult: SelectorResult) => void
  ) {
    for (const key of subscribers.keys()) {
      /* prevent subscribe from being accidentally called multiple times with the same callback */
      if (key.toString() === cb.toString()) {
        throw new Error("duplicate subscriber implementation found");
      }
    }
    subscribers.set(cb, {
      selector,
      prevSelectorResult: selector(state),
    });
    return () => {
      subscribers.delete(cb);
    };
  }

  function publish() {
    /**
     * callbacks whose associated selector data has changed
     * these callbacks are keys in the subscribers map
     */
    const call = [];
    for (const [cb, { selector, prevSelectorResult }] of subscribers) {
      const currentSelectorResult = selector(state);

      if (!deepEqual(currentSelectorResult, prevSelectorResult)) {
        subscribers.set(cb, {
          selector,
          prevSelectorResult: currentSelectorResult,
        });
        call.push(cb);
      }
    }
    call.forEach(cb => {
      cb(subscribers.get(cb)?.prevSelectorResult);
    });
  }

  function setState(
    val: Partial<StoreType> | ((state: StoreType) => StoreType)
  ) {
    let newState: StoreType;
    if (typeof val === "function") {
      newState = val(state);
    } else {
      newState = { ...state, ...val };
    }
    state = newState;
    publish();
  }

  function getState() {
    return state;
  }

  return {
    getState,
    setState,
    subscribe,
  };
}
