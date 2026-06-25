/**
 * 中间件模式 - Redux 风格 (Redux-style Middleware)
 *
 * Approach:
 * - Redux middleware is curried three times: store => next => action => result.
 *   It wraps store.dispatch, allowing you to inspect/transform/defer actions.
 * - applyMiddleware(...middlewares)(createStore)(reducer, preloadedState) returns a
 *   store whose dispatch passes through every middleware in order before reaching
 *   the base reducer dispatch.
 * - We implement createStore + applyMiddleware from scratch, then add a logger,
 *   a thunk (async function actions), and a crash reporter.
 * - Difference from Koa: Redux middleware transforms a single action synchronously
 *   (mostly), passing it along via next(action); Koa middleware is an onion around
 *   a request with async up/down phases.
 */

function createStore(reducer, preloadedState) {
  let state = preloadedState;
  const listeners = new Set();
  function dispatch(action) {
    if (typeof action.type === "undefined")
      throw new Error("Actions need a type");
    state = reducer(state, action);
    listeners.forEach((l) => l(state, action));
    return action;
  }
  const getState = () => state;
  const subscribe = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  dispatch({ type: "@@INIT" });
  return { dispatch, getState, subscribe };
}

function applyMiddleware(...middlewares) {
  return (createStoreFn) => (reducer, preloadedState) => {
    const store = createStoreFn(reducer, preloadedState);
    // Build the middleware API with a lazy dispatch that points at the enhanced one.
    let dispatch = () => {
      throw new Error("Dispatching during middleware setup is disallowed");
    };
    const api = {
      getState: store.getState,
      dispatch: (...a) => dispatch(...a),
    };
    const chain = middlewares.map((mw) => mw(api));
    dispatch = chain.reduce(
      (a, b) =>
        (...args) =>
          a(b(...args)),
    )(store.dispatch);
    return { ...store, dispatch };
  };
}

// ---- Logger middleware: logs every action + resulting state ----
const logger =
  ({ getState }) =>
  (next) =>
  (action) => {
    const prev = getState();
    const result = next(action);
    return result;
  };

// ---- Crash reporter: catches sync errors in downstream dispatch ----
const crashReporter = () => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    console.log("[crash]", err.message, "during", action.type);
    throw err;
  }
};

// ---- Thunk middleware: allows action creators to return functions for async ----
const thunk =
  ({ getState, dispatch }) =>
  (next) =>
  (action) => {
    if (typeof action === "function") {
      return action(dispatch, getState);
    }
    return next(action);
  };

// ---- Reducer ----
function counter(state = { value: 0 }, action) {
  switch (action.type) {
    case "INCREMENT":
      return { value: state.value + 1 };
    case "ADD":
      return { value: state.value + (action.payload || 0) };
    default:
      return state;
  }
}

const store = createStore(counter, undefined, undefined);
const enhancedStore = applyMiddleware(
  thunk,
  logger,
  crashReporter,
)(createStore)(counter, undefined);

// ---------------- Test cases ----------------
const events = [];
enhancedStore.subscribe((state, action) =>
  events.push(`${action.type}=${state.value}`),
);

enhancedStore.dispatch({ type: "INCREMENT" });
enhancedStore.dispatch({ type: "ADD", payload: 5 });
console.log(enhancedStore.getState());
// Expected: { value: 6 }
console.log(events);
// Expected: [ 'INCREMENT=1', 'ADD=6' ]

// Thunk: dispatch a function -> it gets (dispatch, getState)
const asyncAdd = (dispatch, getState) => {
  dispatch({ type: "ADD", payload: 10 });
  return getState().value;
};
const result = enhancedStore.dispatch(asyncAdd);
console.log(result, enhancedStore.getState());
// Expected: 16 { value: 16 }

// Crash reporter logs a thrown error from a deliberately bad reducer action.
// We simulate by wrapping a store whose reducer throws on a special action.
function throwingReducer(state = { v: 0 }, action) {
  if (action.type === "BOOM") throw new Error("reducer explosion");
  return state;
}
const boomStore = applyMiddleware(crashReporter)(createStore)(
  throwingReducer,
  undefined,
);
try {
  boomStore.dispatch({ type: "BOOM" });
} catch (e) {
  console.log("Propagated:", e.message);
  // Expected: [crash] reducer explosion during BOOM  then  Propagated: reducer explosion
}
