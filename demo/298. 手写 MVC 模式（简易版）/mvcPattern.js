/**
 * MVC 模式 - 简易版 (Model-View-Controller)
 *
 * Approach:
 * - Model: holds data + business logic + notifies observers on change. Knows
 *   nothing about View or Controller.
 * - View: renders the Model's state and forwards user input to the Controller.
 *   Subscribes to Model changes so it re-renders automatically.
 * - Controller: interprets user input, mutates the Model accordingly, and may
 *   select/swap Views. Decouples View from Model logic.
 * - Triangle data-flow: View -> Controller -> Model -> (notify) -> View.
 *   (Unlike MVP/MVVM, the View knows about the Model directly for rendering.)
 * - We model a simple Todo app.
 */

// ---- Model ----
class TodoModel extends EventTarget {
  constructor() {
    super();
    this.todos = [];
  }
  _emit() {
    this.dispatchEvent(new Event('change'));
  }
  add(text) {
    this.todos.push({ id: Date.now() + Math.random(), text, done: false });
    this._emit();
  }
  toggle(id) {
    const t = this.todos.find((x) => x.id === id);
    if (t) {
      t.done = !t.done;
      this._emit();
    }
  }
  remove(id) {
    this.todos = this.todos.filter((x) => x.id !== id);
    this._emit();
  }
  stats() {
    return {
      total: this.todos.length,
      done: this.todos.filter((t) => t.done).length,
    };
  }
}

// ---- View ----
class TodoView {
  constructor(model) {
    this.model = model;
    this.controller = null;
    this.lastRender = '';
    this.model.addEventListener('change', () => this.render());
    this.render();
  }
  setController(c) {
    this.controller = c;
  }
  render() {
    const lines = this.model.todos.map(
      (t) => `[${t.done ? 'x' : ' '}] #${String(t.id).slice(-3)} ${t.text}`
    );
    const s = this.model.stats();
    this.lastRender =
      `=== Todos (${s.done}/${s.total}) ===\n` +
      (lines.length ? lines.join('\n') : '(empty)');
  }
  // Simulated user actions -> forward to controller.
  userAdds(text) {
    this.controller.handleAdd(text);
  }
  userToggles(id) {
    this.controller.handleToggle(id);
  }
  userRemoves(id) {
    this.controller.handleRemove(id);
  }
}

// ---- Controller ----
class TodoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    view.setController(this);
  }
  handleAdd(text) {
    const trimmed = text.trim();
    if (!trimmed) return; // business rule: no empty todos
    this.model.add(trimmed);
  }
  handleToggle(id) {
    this.model.toggle(id);
  }
  handleRemove(id) {
    this.model.remove(id);
  }
}

// ---------------- Test cases ----------------
const model = new TodoModel();
const view = new TodoView(model);
const controller = new TodoController(model, view);

console.log(view.lastRender);
// Expected: === Todos (0/0) ===
//           (empty)

// Simulate user adding todos via the View (input -> Controller -> Model -> View).
view.userAdds('Learn MVC');
view.userAdds('Write demo');
console.log(view.lastRender);
// Expected: === Todos (0/2) ===
//           [ ] #... Learn MVC
//           [ ] #... Write demo

// Capture an id to toggle/remove deterministically.
const firstId = model.todos[0].id;
view.userToggles(firstId);
console.log(view.lastRender.split('\n')[1]);
// Expected: [x] #... Learn MVC

console.log(model.stats());
// Expected: { total: 2, done: 1 }

view.userRemoves(firstId);
console.log(model.todos.map((t) => t.text));
// Expected: [ 'Write demo' ]

// Controller enforces business rules (no empty todos)
view.userAdds('   ');
console.log(model.todos.length);
// Expected: 1  (unchanged)
