// 290. 状态管理器

class Store {
  constructor(state) {
    this.state = state;
    this.listeners = [];
  }
  setState(partial) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn(this.state));
  }
  subscribe(fn) {
    this.listeners.push(fn);
  }
}
const store = new Store({ count: 0 });
store.subscribe(console.log);
store.setState({ count: 1 });
