/**
 * 命令模式 (Command Pattern)
 *
 * Approach:
 * - Encapsulate a request as an object, thereby letting you parameterize clients
 *   with different requests, queue/log requests, and support undoable operations.
 * - A Command object knows its receiver and exposes execute() and undo().
 * - An Invoker triggers commands without knowing what they do; a Receiver performs
 *   the actual work; a Client assembles commands.
 * - We model a text editor with InsertCommand/DeleteCommand that are undoable, plus
 *   a MacroCommand (composite) and a command history with redo support.
 */

class TextBuffer {
  constructor(text = "") {
    this.text = text;
  }
  insert(at, str) {
    this.text = this.text.slice(0, at) + str + this.text.slice(at);
  }
  delete(at, len) {
    const removed = this.text.slice(at, at + len);
    this.text = this.text.slice(0, at) + this.text.slice(at + len);
    return removed;
  }
  toString() {
    return this.text;
  }
}

// ---- Command interface ----
class Command {
  execute() {
    throw new Error("abstract");
  }
  undo() {
    throw new Error("abstract");
  }
}

class InsertCommand extends Command {
  constructor(buffer, position, text) {
    super();
    this.buffer = buffer;
    this.position = position;
    this.text = text;
  }
  execute() {
    this.buffer.insert(this.position, this.text);
  }
  undo() {
    this.buffer.delete(this.position, this.text.length);
  }
}

// AppendTextCommand resolves the insert position at EXECUTION time (current end of
// the buffer) rather than at construction. This avoids the classic Command pitfall
// where a position captured up-front goes stale when earlier commands in a macro
// mutate the buffer before this one runs.
class AppendTextCommand extends Command {
  constructor(buffer, text) {
    super();
    this.buffer = buffer;
    this.text = text;
    this.appliedAt = null; // resolved + recorded during execute()
  }
  execute() {
    this.appliedAt = this.buffer.text.length;
    this.buffer.insert(this.appliedAt, this.text);
  }
  undo() {
    if (this.appliedAt == null) return;
    this.buffer.delete(this.appliedAt, this.text.length);
    this.appliedAt = null;
  }
}

class DeleteCommand extends Command {
  constructor(buffer, position, length) {
    super();
    this.buffer = buffer;
    this.position = position;
    this.length = length;
    this.removed = "";
  }
  execute() {
    this.removed = this.buffer.delete(this.position, this.length);
  }
  undo() {
    this.buffer.insert(this.position, this.removed);
  }
}

// ---- Composite command (macro) ----
class MacroCommand extends Command {
  constructor(commands = []) {
    super();
    this.commands = commands;
  }
  add(cmd) {
    this.commands.push(cmd);
    return this;
  }
  execute() {
    this.commands.forEach((c) => c.execute());
  }
  undo() {
    // undo in reverse order
    [...this.commands].reverse().forEach((c) => c.undo());
  }
}

// ---- Invoker: history with undo/redo ----
class CommandHistory {
  constructor() {
    this.done = []; // executed
    this.undone = []; // undone (for redo)
  }
  execute(command) {
    command.execute();
    this.done.push(command);
    this.undone = []; // clear redo stack on new action
  }
  undo() {
    const cmd = this.done.pop();
    if (!cmd) return false;
    cmd.undo();
    this.undone.push(cmd);
    return true;
  }
  redo() {
    const cmd = this.undone.pop();
    if (!cmd) return false;
    cmd.execute();
    this.done.push(cmd);
    return true;
  }
}

// ---------------- Test cases ----------------
const buffer = new TextBuffer("Hello World");
const history = new CommandHistory();

// Insert '!' at end
history.execute(new InsertCommand(buffer, buffer.text.length, "!"));
console.log(buffer.toString());
// Expected: Hello World!

// Delete 'World'
history.execute(new DeleteCommand(buffer, 6, 5));
console.log(buffer.toString());
// Expected: Hello !

// Undo twice -> back to original
history.undo();
console.log(buffer.toString());
// Expected: Hello World!
history.undo();
console.log(buffer.toString());
// Expected: Hello World

// Redo twice -> restored
history.redo();
history.redo();
console.log(buffer.toString());
// Expected: Hello !

// Macro command: insert 'JS ' at start and append '!!' at the end atomically.
// We use AppendTextCommand for the trailing insert because the buffer length is
// not known until execution (the macro's first insert shifts everything).
const macro = new MacroCommand([
  new InsertCommand(buffer, 0, "JS "),
  new AppendTextCommand(buffer, "!!"),
]);
history.execute(macro);
console.log(buffer.toString());
// Expected: JS Hello !!!  (buffer was "Hello !"; prepend "JS " then append "!!")
history.undo();
console.log(buffer.toString());
// Expected: Hello !
