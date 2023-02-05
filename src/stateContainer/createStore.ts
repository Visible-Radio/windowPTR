export default function createStore<StoreType>(
  initialValues: StoreType,
  publishFn: (state: StoreType) => void
) {
  let state: Readonly<StoreType> = initialValues;

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
    publishFn(newState);
  }

  function getState() {
    return state;
  }

  return {
    getState,
    setState,
  };
}
