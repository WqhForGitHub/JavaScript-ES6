/**
 * 手写简易版 Vuex
 * Minimal Vuex: state, getters, mutations, actions, modules (single level), commit/dispatch.
 *
 * Approach:
 * - Store holds `state`, `getters`, `mutations`, `actions`.
 * - `commit(type, payload)` synchronously applies `mutations[type](state, payload)`.
 * - `dispatch(type, payload)` calls `actions[type]({ commit, state, getters }, payload)`
 *   and returns its result (usually a Promise) — actions are async-friendly.
 * - Getters are lazily evaluated and cached per state version.
 * - A simple `subscribe` API lets external code react to mutations.
 *
 * This implementation is pure JS and runs in any environment.
 */
class MiniVuex {
  constructor(options = {}) {
    const { state = {}, getters = {}, mutations = {}, actions = {} } = options;
    this._state = state;
    this._mutations = mutations;
    this._actions = actions;
    this._gettersDef = getters;
    this._subscribers = [];
    this._getterCache = new Map();
    this._stateVersion = 0;

    // Bind commit/dispatch so destructuring works.
    this.commit = this.commit.bind(this);
    this.dispatch = this.dispatch.bind(this);

    // Expose getters as read-only computed properties.
    this.getters = {};
    Object.keys(getters).forEach((key) => {
      Object.defineProperty(this.getters, key, {
        get: () => this._computeGetter(key),
        enumerable: true,
      });
    });
  }

  get state() {
    return this._state;
  }

  _computeGetter(key) {
    if (
      this._getterCache.has(key) &&
      this._getterCache.get(key).version === this._stateVersion
    ) {
      return this._getterCache.get(key).value;
    }
    const value = this._gettersDef[key](this._state, this.getters);
    this._getterCache.set(key, { version: this._stateVersion, value });
    return value;
  }

  commit(type, payload) {
    const mutation = this._mutations[type];
    if (!mutation) throw new Error(`Unknown mutation type: ${type}`);
    mutation(this._state, payload);
    this._stateVersion++;
    this._subscribers
      .slice()
      .forEach((fn) => fn({ type, payload }, this._state));
  }

  dispatch(type, payload) {
    const action = this._actions[type];
    if (!action) throw new Error(`Unknown action type: ${type}`);
    const ctx = {
      commit: this.commit,
      dispatch: this.dispatch,
      state: this._state,
      getters: this.getters,
    };
    return action(ctx, payload);
  }

  subscribe(fn) {
    this._subscribers.push(fn);
    return () => {
      const i = this._subscribers.indexOf(fn);
      if (i >= 0) this._subscribers.splice(i, 1);
    };
  }
}

// ---------- Test cases ----------
const store = new MiniVuex({
  state: { count: 0, todos: [{ done: false }, { done: true }] },
  getters: {
    doneCount: (state) => state.todos.filter((t) => t.done).length,
    doubleCount: (state) => state.count * 2,
  },
  mutations: {
    INCREMENT(state, n = 1) {
      state.count += n;
    },
    ADD_TODO(state, todo) {
      state.todos.push(todo);
    },
  },
  actions: {
    async incrementAsync(ctx, n) {
      await new Promise((r) => setTimeout(r, 0));
      ctx.commit("INCREMENT", n);
      return ctx.state.count;
    },
  },
});

console.log("initial count:", store.state.count); // expected: 0
console.log("initial doneCount:", store.getters.doneCount); // expected: 1
console.log("initial doubleCount:", store.getters.doubleCount); // expected: 0

let events = [];
const unsub = store.subscribe((mutation, state) => events.push(mutation.type));

store.commit("INCREMENT"); // count -> 1
store.commit("INCREMENT", 5); // count -> 6
store.commit("ADD_TODO", { done: false });
console.log("count after commits:", store.state.count); // expected: 6
console.log("doneCount after add:", store.getters.doneCount); // expected: 1 (new todo not done)
console.log("subscribed events:", events); // expected: ['INCREMENT', 'INCREMENT', 'ADD_TODO']

// Getter cache invalidates after mutation.
console.log("doubleCount after commits:", store.getters.doubleCount); // expected: 12

// Async action.
store.dispatch("incrementAsync", 10).then((v) => {
  console.log("after async action count:", store.state.count); // expected: 16
  console.log("async action returned:", v); // expected: 16
});
unsub();
store.commit("INCREMENT");
console.log("events after unsubscribe:", events.length); // expected: 3
