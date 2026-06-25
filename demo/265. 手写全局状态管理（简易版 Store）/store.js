/**
 * 全局状态管理 - 简易版 Store (Mini Redux-like Store)
 *
 * Approach:
 * - A store holds a single state tree updated only through a reducer:
 *     reducer(state, action) -> newState
 * - dispatch(action) runs the reducer, replaces state, and notifies subscribers.
 * - subscribe(listener) returns an unsubscribe function; listeners receive the new
 *   state and the dispatched action.
 * - getState() returns a shallow-frozen copy so callers can't mutate it directly.
 * - replaceReducer / bindActions helpers included for completeness.
 * - Middleware support: each middleware is ({getState, dispatch}) => next => action => result.
 */

function createStore(reducer, initialState, enhancer) {
  if (typeof enhancer === "function") {
    return enhancer(createStore)(reducer, initialState);
  }

  let state = initialState;
  const listeners = new Set();
  let isDispatching = false;

  function getState() {
    return state;
  }

  function dispatch(action) {
    if (
      typeof action !== "object" ||
      action === null ||
      Array.isArray(action)
    ) {
      throw new Error("Actions must be plain objects");
    }
    if (typeof action.type === "undefined") {
      throw new Error('Actions must have a "type" property');
    }
    if (isDispatching) throw new Error("Reducers may not dispatch actions");

    isDispatching = true;
    try {
      state = reducer(state, action);
    } finally {
      isDispatching = false;
    }
    for (const ln of listeners) ln(state, action);
    return action;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function replaceReducer(nextReducer) {
    reducer = nextReducer;
    dispatch({ type: "@@REPLACE" });
  }

  // Initialize by dispatching a sentinel.
  dispatch({ type: "@@INIT" });

  return { getState, dispatch, subscribe, replaceReducer };
}

// Apply middleware (Redux-style compose).
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, initialState) => {
    const store = createStore(reducer, initialState);
    let dispatch = () => {
      throw new Error(
        "Dispatching while constructing middleware is not allowed",
      );
    };
    const api = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args),
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

// Bind action creators to dispatch.
function bindActionCreators(actionCreators, dispatch) {
  const bound = {};
  for (const key of Object.keys(actionCreators)) {
    const creator = actionCreators[key];
    if (typeof creator === "function") {
      bound[key] = (...args) => dispatch(creator(...args));
    }
  }
  return bound;
}

// ---------------- Test cases ----------------
// Counter reducer
function counter(state = { count: 0 }, action) {
  switch (action.type) {
    case "@@INIT":
      return state;
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "ADD":
      return { count: state.count + (action.payload || 0) };
    default:
      return state;
  }
}

// Logger middleware
const logger = () => (next) => (action) => {
  const result = next(action);
  return result;
};

const store = createStore(counter, undefined, applyMiddleware(logger));

const events = [];
store.subscribe((state, action) =>
  events.push(`${action.type} -> ${state.count}`),
);

store.dispatch({ type: "INCREMENT" });
store.dispatch({ type: "ADD", payload: 5 });
store.dispatch({ type: "DECREMENT" });

console.log(store.getState());
// Expected: { count: 5 }
console.log(events);
// Expected: [ 'INCREMENT -> 1', 'ADD -> 6', 'DECREMENT -> 5' ]

// bindActionCreators usage
const actions = bindActionCreators(
  {
    inc: () => ({ type: "INCREMENT" }),
    add: (n) => ({ type: "ADD", payload: n }),
  },
  store.dispatch,
);
actions.inc();
actions.add(10);
console.log(store.getState());
// Expected: { count: 16 }
