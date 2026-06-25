/**
 * 状态模式 (State Pattern)
 *
 * Approach:
 * - Allow an object to alter its behaviour when its internal state changes. The
 *   object will appear to change its class.
 * - A Context holds a reference to the current State object and delegates
 *   state-specific behaviour to it. State transitions happen inside the State
 *   classes (or the Context) by setting a new state.
 * - We model a Document workflow: Draft -> Moderation -> Published, plus a
 *   Withdrawn state. Each state implements its own actions (publish, edit,
 *   archive) and decides the next state. This avoids huge switch/if-else blocks.
 * - Compare with the naive approach where every method has switch(state){...}.
 */

// ---- Context ----
class Document {
  constructor(title) {
    this.title = title;
    this.content = "";
    // start in Draft state
    this.transitionTo(new DraftState());
  }
  transitionTo(state) {
    this.state = state;
    this.state.setContext(this);
  }
  // User-facing actions are delegated to the current state.
  publish() {
    return this.state.publish();
  }
  edit(text) {
    return this.state.edit(text);
  }
  archive() {
    return this.state.archive();
  }
  status() {
    return this.state.name;
  }
}

// ---- Base State ----
class State {
  setContext(doc) {
    this.doc = doc;
  }
  get name() {
    return this.constructor.name.replace("State", "");
  }
  publish() {
    return `Cannot publish from ${this.name}`;
  }
  edit() {
    return `Cannot edit in ${this.name}`;
  }
  archive() {
    return `Cannot archive from ${this.name}`;
  }
}

// ---- Concrete states ----
class DraftState extends State {
  edit(text) {
    this.doc.content += text;
    return `Edited (draft): content="${this.doc.content}"`;
  }
  publish() {
    this.doc.transitionTo(new ModerationState());
    return `Published to moderation`;
  }
}

class ModerationState extends State {
  edit() {
    return "Locked: cannot edit while in moderation";
  }
  publish() {
    this.doc.transitionTo(new PublishedState());
    return "Approved: now published";
  }
  archive() {
    this.doc.transitionTo(new WithdrawnState());
    return "Rejected: withdrawn";
  }
}

class PublishedState extends State {
  edit() {
    return "Locked: cannot edit once published";
  }
  archive() {
    this.doc.transitionTo(new WithdrawnState());
    return "Archived";
  }
  publish() {
    return "Already published";
  }
}

class WithdrawnState extends State {
  publish() {
    this.doc.transitionTo(new DraftState());
    return "Restored to draft";
  }
  edit() {
    return "Restoring to draft for edits";
  }
  archive() {
    return "Already withdrawn";
  }
}

// ---------------- Test cases ----------------
const doc = new Document("Guide");
console.log(doc.status());
// Expected: Draft

console.log(doc.edit("Hello "));
// Expected: Edited (draft): content="Hello "
console.log(doc.edit("World"));
// Expected: Edited (draft): content="Hello World"

console.log(doc.publish());
// Expected: Published to moderation
console.log(doc.status());
// Expected: Moderation

// Cannot edit while in moderation
console.log(doc.edit("!"));
// Expected: Locked: cannot edit while in moderation

// Approve -> published
console.log(doc.publish());
// Expected: Approved: now published
console.log(doc.status());
// Expected: Published

// Publish again is a no-op
console.log(doc.publish());
// Expected: Already published

// Archive -> withdrawn, then restore to draft
console.log(doc.archive());
// Expected: Archived
console.log(doc.status());
// Expected: Withdrawn
console.log(doc.publish());
// Expected: Restored to draft
console.log(doc.status());
// Expected: Draft
