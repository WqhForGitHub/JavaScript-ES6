/**
 * 备忘录模式 (Memento Pattern)
 *
 * Approach:
 * - Capture and externalize an object's internal state without violating
 *   encapsulation, so the object can be restored to that state later.
 * - Three roles:
 *     * Originator: the object whose state we want to snapshot. Creates a memento
 *       (save) and can restore from one.
 *     * Memento: immutable token holding the saved state.
 *     * Caretaker: keeps mementos (e.g. a history stack) but never inspects them.
 * - We model an Editor with content + cursor position and a History caretaker that
 *   supports undo/redo via saved snapshots.
 */

class EditorMemento {
  constructor(state) {
    this._state = state;
    Object.freeze(this);
  }
  getState() {
    return this._state;
  }
}

class Editor {
  constructor() {
    this.content = '';
    this.cursor = 0;
  }
  type(text) {
    this.content = this.content.slice(0, this.cursor) + text + this.content.slice(this.cursor);
    this.cursor += text.length;
  }
  moveCursor(pos) {
    this.cursor = Math.max(0, Math.min(pos, this.content.length));
  }
  delete(n) {
    const start = Math.max(0, this.cursor - n);
    this.content = this.content.slice(0, start) + this.content.slice(this.cursor);
    this.cursor = start;
  }

  // Originator API
  save() {
    return new EditorMemento({ content: this.content, cursor: this.cursor });
  }
  restore(memento) {
    const s = memento.getState();
    this.content = s.content;
    this.cursor = s.cursor;
  }
  toString() {
    return `"${this.content}" @${this.cursor}`;
  }
}

// Caretaker: stack of mementos with undo/redo.
class History {
  constructor(originator) {
    this.originator = originator;
    this.past = [];
    this.future = [];
  }
  snapshot() {
    this.past.push(this.originator.save());
    this.future = []; // clear redo branch
  }
  undo() {
    if (this.past.length === 0) return false;
    this.future.push(this.originator.save());
    this.originator.restore(this.past.pop());
    return true;
  }
  redo() {
    if (this.future.length === 0) return false;
    this.past.push(this.originator.save());
    this.originator.restore(this.future.pop());
    return true;
  }
}

// ---------------- Test cases ----------------
const editor = new Editor();
const history = new History(editor);

history.snapshot();
editor.type('Hello');
history.snapshot();
editor.type(' World');
history.snapshot();
editor.moveCursor(5);
editor.type(',');
console.log(editor.toString());
// Expected: "Hello, World" @6

// Undo back to "Hello World"
history.undo();
console.log(editor.toString());
// Expected: "Hello World" @11
history.undo();
console.log(editor.toString());
// Expected: "Hello" @5
history.undo();
console.log(editor.toString());
// Expected: "" @0

// Redo forward
history.redo();
console.log(editor.toString());
// Expected: "Hello" @5
history.redo();
console.log(editor.toString());
// Expected: "Hello World" @11

// Memento is immutable (frozen)
const m = editor.save();
try {
  m._state = { content: 'hacked' };
} catch (e) {
  // strict mode throws; otherwise silently ignored
}
console.log(m.getState().content);
// Expected: Hello World
