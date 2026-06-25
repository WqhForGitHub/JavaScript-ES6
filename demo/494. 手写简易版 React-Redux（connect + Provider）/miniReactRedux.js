/**
 * 手写简易版 React-Redux（connect + Provider）
 * Minimal React-Redux built on top of the miniReact + miniRedux primitives.
 *
 * Approach:
 * - `Provider` stores the store on a module-level context (a simple singleton),
 *   because a real React Context is not available here.
 * - `connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)` returns a
 *   higher-order component whose render:
 *     1. Reads the store from context.
 *     2. Subscribes so it re-renders whenever the store changes.
 *     3. Passes merged props (stateProps + dispatchProps + ownProps) into the
 *        wrapped component instance.
 * - Uses the miniReact `h` + `Component` helpers; subscribing in the constructor
 *   and unsubscribing on unmount.
 *
 * This file imports nothing (self-contained) and includes a tiny stub of the
 * React/Vue helpers it needs so it can run standalone in Node for testing the
 * subscription logic.
 */

// ---- Minimal store (subset of miniRedux) ----
function createStore(reducer, preloadedState) {
  let state = preloadedState;
  let listeners = [];
  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.slice().forEach((l) => l());
    return action;
  };
  const subscribe = (l) => {
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  };
  const getState = () => state;
  dispatch({ type: "@@INIT" });
  return { getState, dispatch, subscribe };
}

// ---- Context (module-level singleton standing in for React Context) ----
const ReactReduxContext = { currentStore: null };

function Provider({ store, children }) {
  ReactReduxContext.currentStore = store;
  return { type: "PROVIDER_ROOT", props: {}, children };
}

function getCurrentStore() {
  if (!ReactReduxContext.currentStore) throw new Error("Store not provided");
  return ReactReduxContext.currentStore;
}

// ---- Minimal Component base (subset of miniReact) ----
class Component {
  constructor(props) {
    this.props = props || {};
  }
  setState(partial) {
    this.state = { ...this.state, ...partial };
    if (this._rerender) this._rerender();
  }
}

// ---- connect ----
function connect(mapStateToProps, mapDispatchToProps) {
  return function (WrappedComponent) {
    class Connected extends Component {
      constructor(props) {
        super(props);
        this.store = getCurrentStore();
        this.state = { storeState: this.store.getState() };
        this._unsub = this.store.subscribe(() => {
          const next = this.store.getState();
          if (next !== this.state.storeState) {
            this.setState({ storeState: next });
          }
        });
      }
      componentWillUnmount() {
        if (this._unsub) this._unsub();
      }
      render() {
        const stateProps = mapStateToProps
          ? mapStateToProps(this.state.storeState, this.props)
          : {};
        let dispatchProps;
        if (mapDispatchToProps) {
          if (typeof mapDispatchToProps === "function") {
            dispatchProps = mapDispatchToProps(this.store.dispatch, this.props);
          } else {
            dispatchProps = {};
            for (const k in mapDispatchToProps) {
              const ac = mapDispatchToProps[k];
              dispatchProps[k] = (...args) => this.store.dispatch(ac(...args));
            }
          }
        } else {
          dispatchProps = { dispatch: this.store.dispatch };
        }
        const merged = { ...this.props, ...stateProps, ...dispatchProps };
        return new WrappedComponent(merged).render
          ? new WrappedComponent(merged).render()
          : new WrappedComponent(merged);
      }
    }
    Connected.WrappedComponent = WrappedComponent;
    return Connected;
  };
}

// ---------- Test cases ----------
function counter(state = 0, action) {
  switch (action.type) {
    case "INC":
      return state + 1;
    default:
      return state;
  }
}
const store = createStore(counter, 0);

// A dumb presentational "component".
class CounterView extends Component {
  render() {
    return { type: "div", props: { count: this.props.count }, children: [] };
  }
}

const ConnectedCounter = connect((state) => ({ count: state }), {
  inc: () => ({ type: "INC" }),
})(CounterView);

Provider({ store, children: null }); // register store in context
const view = new ConnectedCounter({});
const rendered = view.render();
console.log("initial connected props.count:", rendered.props.count); // expected: 0

store.dispatch({ type: "INC" });
store.dispatch({ type: "INC" });
const rendered2 = view.render();
console.log(
  "after 2 dispatches, connected props.count:",
  rendered2.props.count,
); // expected: 2

// mapDispatchToProps object form gives bound action creators.
console.log("inc is a function:", typeof view.props.inc === "function"); // expected: true
view.props.inc();
const rendered3 = view.render();
console.log("after calling bound inc():", rendered3.props.count); // expected: 3

// Unsubscribe cleans up.
view.componentWillUnmount();
store.dispatch({ type: "INC" });
const rendered4 = view.render();
console.log("after unsubscribe, count stays:", rendered4.props.count); // expected: 3 (state.storeState not updated)
