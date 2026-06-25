/**
 * MVVM 模式 - 简易版 (Model-View-ViewModel)
 *
 * Approach:
 * - Model: raw data (a plain object).
 * - ViewModel: an observable layer that holds state + computed properties + commands
 *   (methods the View can call). It exposes reactive getters/setters so that any
 *   change notifies subscribers (the View).
 * - View: a thin renderer that subscribes to the ViewModel and re-renders when
 *   relevant state changes; user actions call ViewModel commands (two-way binding
 *   for inputs is simulated).
 * - We implement reactivity via a small dependency-tracking system:
 *   - track(): when a computed/getter runs, it records dependencies.
 *   - trigger(): when a setter runs, it re-runs dependent computeds + view render.
 *   This mirrors Vue's reactivity at a tiny scale.
 */

class Dep {
  constructor() {
    this.subs = new Set();
  }
  depend() {
    if (Dep.target) this.subs.add(Dep.target);
  }
  notify() {
    for (const s of [...this.subs]) s();
  }
}
Dep.target = null;
const targetStack = [];
function pushTarget(t) {
  targetStack.push(t);
  Dep.target = t;
}
function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1] || null;
}

function reactive(obj) {
  const deps = new Map();
  const getDep = (k) => {
    if (!deps.has(k)) deps.set(k, new Dep());
    return deps.get(k);
  };
  return new Proxy(obj, {
    get(target, key) {
      getDep(key).depend();
      return target[key];
    },
    set(target, key, value) {
      if (target[key] === value) return true;
      target[key] = value;
      getDep(key).notify();
      return true;
    },
  });
}

function computed(getter) {
  let value;
  let dirty = true;
  const dep = new Dep();
  const effect = () => {
    pushTarget(effect);
    value = getter();
    popTarget();
    dirty = false;
    dep.notify();
  };
  effect(); // initial run -> collects deps
  // When any upstream dep notifies, mark dirty & re-collect on next access.
  // We re-run eagerly here for simplicity.
  return {
    get value() {
      dep.depend();
      if (dirty) effect();
      return value;
    },
  };
}

class ViewModel {
  constructor(initial) {
    this.state = reactive(initial);
    // Computed properties derived from state.
    this.computed = {
      fullName: computed(
        () => `${this.state.firstName} ${this.state.lastName}`,
      ),
      greeting: computed(() => `Hello, ${this.state.firstName}!`),
    };
    this._changeListeners = new Set();
  }
  // Commands the View calls.
  setFirstName(v) {
    this.state.firstName = v;
    this._notify();
  }
  setLastName(v) {
    this.state.lastName = v;
    this._notify();
  }
  onChange(fn) {
    this._changeListeners.add(fn);
    return () => this._changeListeners.delete(fn);
  }
  _notify() {
    for (const fn of this._changeListeners) fn();
  }
}

class View {
  constructor(vm) {
    this.vm = vm;
    this.renderCount = 0;
    // Re-render whenever any computed the render reads becomes dirty.
    this.vm.onChange(() => this.render());
    this.render();
  }
  render() {
    this.renderCount++;
    // Reading computed.value registers this render as a dependent.
    this.lastOutput = `[View] ${this.vm.computed.greeting.value} (full: ${this.vm.computed.fullName.value})`;
  }
  // Simulated two-way input binding.
  inputFirstName(value) {
    this.vm.setFirstName(value); // View -> ViewModel
  }
  inputLastName(value) {
    this.vm.setLastName(value);
  }
}

// ---------------- Test cases ----------------
const vm = new ViewModel({ firstName: "Arthur", lastName: "Dent" });
const view = new View(vm);

console.log(view.lastOutput, "| renders:", view.renderCount);
// Expected: [View] Hello, Arthur! (full: Arthur Dent) | renders: 1

// Simulate user typing in the first-name input (two-way binding).
view.inputFirstName("Ford");
console.log(view.lastOutput, "| renders:", view.renderCount);
// Expected: [View] Hello, Ford! (full: Ford Dent) | renders: 2

view.inputLastName("Prefect");
console.log(view.lastOutput, "| renders:", view.renderCount);
// Expected: [View] Hello, Ford! (full: Ford Prefect) | renders: 3

// Multiple views share one ViewModel and stay in sync.
const view2 = new View(vm);
console.log(view2.lastOutput);
// Expected: [View] Hello, Ford! (full: Ford Prefect)
view.inputFirstName("Zaphod");
console.log(view.lastOutput, view2.lastOutput);
// Expected: [View] Hello, Zaphod! (full: Zaphod Prefect) [View] Hello, Zaphod! (full: Zaphod Prefect)
