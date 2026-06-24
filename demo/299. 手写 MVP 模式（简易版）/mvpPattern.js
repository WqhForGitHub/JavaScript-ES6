/**
 * MVP 模式 - 简易版 (Model-View-Presenter)
 *
 * Approach:
 * - Like MVC, but the View does NOT know about the Model. The Presenter sits
 *   between them: it reads from the Model and updates the View, and handles input
 *   events raised by the View. This makes the View purely passive (a "dumb" UI
 *   shell) and the Presenter fully testable in isolation.
 * - View exposes a simple interface (set fields, raise events) — often via a
 *   callback/interface object. Presenter subscribes to View events and calls
 *   Model mutators, then re-renders the View.
 * - Data-flow: View -> Presenter -> Model -> Presenter -> View.
 *   (No direct View<->Model link, unlike MVC.)
 * - We model a Login screen with validation in the Presenter.
 */

// ---- Model: pure data + rules, no UI knowledge ----
class AuthModel {
  constructor() {
    this.users = new Map([
      ['alice', 'correct-horse'],
      ['bob', 'battery-staple'],
    ]);
  }
  validate(username, password) {
    if (!username) return { ok: false, error: 'Username is required' };
    if (!password) return { ok: false, error: 'Password is required' };
    if (!this.users.has(username)) return { ok: false, error: 'Unknown user' };
    if (this.users.get(username) !== password) {
      return { ok: false, error: 'Wrong password' };
    }
    return { ok: true, username };
  }
}

// ---- View: passive UI shell. Exposes setters + event callbacks. ----
class LoginView {
  constructor() {
    this.username = '';
    this.password = '';
    this.error = '';
    this.info = '';
    this.renderCount = 0;
    // Presenter attaches handlers here.
    this.onSubmit = null;
    this.onInputChange = null;
  }
  setUsername(v) {
    this.username = v;
    this._render();
  }
  setPassword(v) {
    this.password = v;
    this._render();
  }
  showError(msg) {
    this.error = msg;
    this.info = '';
    this._render();
  }
  showSuccess(name) {
    this.info = `Welcome, ${name}!`;
    this.error = '';
    this._render();
  }
  _render() {
    this.renderCount++;
    this.lastRender =
      `--- Login ---\n` +
      `user: ${this.username}\n` +
      `pass: ${'*'.repeat(this.password.length)}\n` +
      (this.error ? `ERR: ${this.error}\n` : '') +
      (this.info ? `OK: ${this.info}\n` : '');
  }
  // Simulated user actions (these would be DOM events in a real app).
  userTypes(field, value) {
    field === 'username' ? (this.username = value) : (this.password = value);
    this.onInputChange && this.onInputChange(field, value);
  }
  userClicksSubmit() {
    this.onSubmit && this.onSubmit();
  }
}

// ---- Presenter: orchestrates View <-> Model ----
class LoginPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    view.onSubmit = () => this.handleSubmit();
    view.onInputChange = (field, value) => this.handleInput(field, value);
  }
  handleInput(field, value) {
    if (field === 'username') this.view.setUsername(value);
    else this.view.setPassword(value);
  }
  handleSubmit() {
    const { username, password } = this.view;
    const result = this.model.validate(username, password);
    if (result.ok) this.view.showSuccess(result.username);
    else this.view.showError(result.error);
  }
}

// ---------------- Test cases ----------------
const model = new AuthModel();
const view = new LoginView();
const presenter = new LoginPresenter(model, view);

// Empty submit -> validation error
view.userClicksSubmit();
console.log(view.lastRender);
// Expected: contains "ERR: Username is required"

// Type username only -> still required password
view.userTypes('username', 'alice');
view.userClicksSubmit();
console.log(view.error);
// Expected: Password is required

// Wrong password
view.userTypes('password', 'nope');
view.userClicksSubmit();
console.log(view.error);
// Expected: Wrong password

// Correct credentials -> success
view.userTypes('password', 'correct-horse');
view.userClicksSubmit();
console.log(view.info, '| renders:', view.renderCount);
// Expected: Welcome, alice! | renders: <number>

// Presenter is unit-testable without a real View by stubbing the interface.
const fakeView = {
  username: 'bob',
  password: 'battery-staple',
  error: '',
  info: '',
  showError(m) {
    this.error = m;
  },
  showSuccess(n) {
    this.info = `Welcome, ${n}!`;
  },
};
new LoginPresenter(model, fakeView).handleSubmit();
console.log(fakeView.info);
// Expected: Welcome, bob!
