/**
 * 手写简易版 Redux（createStore + reducer）
 * Minimal Redux: createStore, reducer pattern, subscribe/unsubscribe, dispatch,
 * bindActionCreators, combineReducers.
 *
 * Approach:
 * - `createStore(reducer, preloadedState)` holds current state; dispatch wraps the
 *   reducer call so the state can only be changed via actions.
 * - On each dispatch, compute next state, replace it, and notify all subscribers
 *   (listeners that were not removed during iteration are still called; we snapshot
 *   the listener list).
 * - `subscribe(listener)` returns an unsubscribe function.
 * - `combineReducers` maps state slices to their reducers.
 * - `bindActionCreators` wraps action creators so they auto-dispatch.
 */
function createStore(reducer, preloadedState, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(reducer, preloadedState);
  }

  let state = preloadedState;
  let listeners = [];
  let isDispatching = false;

  function getState() { return state; }

  function dispatch(action) {
    if (typeof action !== 'object' || action === null || typeof action.type === 'undefined') {
      throw new Error('Actions must be plain objects with a "type" property.');
    }
    if (isDispatching) throw new Error('Reducers may not dispatch actions.');
    try {
      isDispatching = true;
      state = reducer(state, action);
    } finally {
      isDispatching = false;
    }
    const snapshot = listeners.slice();
    for (const l of snapshot) l();
    return action;
  }

  function subscribe(listener) {
    let subscribed = true;
    listeners.push(listener);
    return function unsubscribe() {
      if (!subscribed) return;
      subscribed = false;
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  function replaceReducer(nextReducer) {
    reducer = nextReducer;
    dispatch({ type: '@@REPLACE' });
  }

  // Initialize by dispatching a sentinel.
  dispatch({ type: '@@INIT' });

  return { getState, dispatch, subscribe, replaceReducer };
}

function combineReducers(reducers) {
  return function combination(state = {}, action) {
    const next = {};
    let changed = false;
    for (const key in reducers) {
      const prev = state[key];
      const cur = reducers[key](prev, action);
      next[key] = cur;
      if (cur !== prev) changed = true;
    }
    return changed ? next : state;
  };
}

function bindActionCreators(actionCreators, dispatch) {
  const bound = {};
  for (const key in actionCreators) {
    const creator = actionCreators[key];
    if (typeof creator === 'function') {
      bound[key] = (...args) => dispatch(creator(...args));
    }
  }
  return bound;
}

// ---------- Test cases ----------
function counter(state = 0, action) {
  switch (action.type) {
    case 'INC': return state + 1;
    case 'DEC': return state - 1;
    case 'ADD': return state + (action.payload || 0);
    default: return state;
  }
}

const store = createStore(counter, 0);
console.log('initial state:', store.getState()); // expected: 0

let history = [];
const unsub = store.subscribe(() => history.push(store.getState()));
store.dispatch({ type: 'INC' });       // expected: history -> [1]
store.dispatch({ type: 'ADD', payload: 5 }); // expected: history -> [1, 6]
store.dispatch({ type: 'DEC' });       // expected: history -> [1, 6, 5]
console.log('state:', store.getState()); // expected: 5
console.log('history:', history); // expected: [1, 6, 5]

unsub();
store.dispatch({ type: 'INC' });
console.log('after unsubscribe, history length:', history.length); // expected: 3 (no new entry)
console.log('state after unsubscribed dispatch:', store.getState()); // expected: 6

// combineReducers demo.
const rootReducer = combineReducers({ counter, name: (s = 'a', a) => (a.type === 'SET' ? a.payload : s) });
const store2 = createStore(rootReducer);
console.log('combined initial:', store2.getState()); // expected: { counter: 0, name: 'a' }
store2.dispatch({ type: 'INC' });
store2.dispatch({ type: 'SET', payload: 'b' });
console.log('combined after:', store2.getState()); // expected: { counter: 1, name: 'b' }

// bindActionCreators demo.
const actions = bindActionCreators({ inc: () => ({ type: 'INC' }), add: (n) => ({ type: 'ADD', payload: n }) }, store2.dispatch);
actions.inc(); actions.add(10);
console.log('after bound actions:', store2.getState().counter); // expected: 12
