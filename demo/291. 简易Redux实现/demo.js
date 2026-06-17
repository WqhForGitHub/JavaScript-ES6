// 291. 简易Redux实现

function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];
  return {
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((l) => l());
    },
    getState() {
      return state;
    },
    subscribe(l) {
      listeners.push(l);
    },
  };
}
const reducer = (s, a) => (a.type === "inc" ? { count: s.count + 1 } : s);
const store = createStore(reducer, { count: 0 });
store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: "inc" });
