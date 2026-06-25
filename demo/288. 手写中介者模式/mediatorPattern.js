/**
 * 中介者模式 (Mediator Pattern)
 *
 * Approach:
 * - Define an object that encapsulates how a set of objects interact. Mediator
 *   promotes loose coupling by keeping colleagues from referring to each other
 *   explicitly, letting you vary their interaction independently.
 * - Instead of N x N direct references, colleagues talk only to the Mediator.
 * - We model a ChatRoom mediator with colleagues (User, Bot). Users send messages
 *   through the room; the room routes messages, applies policy (e.g. suppress
 *   banned words), and notifies other participants. Adding a new colleague type
 *   (Bot) requires no changes to User.
 */

class Colleague {
  constructor(name) {
    this.name = name;
    this.mediator = null;
  }
  setMediator(m) {
    this.mediator = m;
  }
  receive() {
    throw new Error("abstract");
  }
  send() {
    throw new Error("abstract");
  }
}

class User extends Colleague {
  constructor(name) {
    super(name);
    this.inbox = [];
  }
  send(message) {
    return this.mediator.route(this, message);
  }
  receive(from, message) {
    this.inbox.push(`${from.name}: ${message}`);
  }
}

class Bot extends Colleague {
  constructor(name) {
    super(name);
    this.flags = [];
  }
  receive(from, message) {
    if (/spam|badword/i.test(message))
      this.flags.push(`${from.name} flagged for "${message}"`);
  }
  send(message) {
    return this.mediator.route(this, message);
  }
}

class ChatRoom {
  constructor() {
    this.colleagues = new Set();
    this.bannedWords = ["spam", "badword"];
  }
  add(colleague) {
    colleague.setMediator(this);
    this.colleagues.add(colleague);
    return this;
  }
  remove(colleague) {
    this.colleagues.delete(colleague);
  }
  route(sender, message) {
    // Policy: suppress banned words entirely.
    const isBanned = this.bannedWords.some((w) =>
      message.toLowerCase().includes(w),
    );
    if (isBanned) {
      // Bots still get notified for moderation; other users see a censored note.
      for (const c of this.colleagues) {
        if (c instanceof Bot) c.receive(sender, message);
      }
      return "message suppressed";
    }
    for (const c of this.colleagues) {
      if (c !== sender) c.receive(sender, message);
    }
    return "delivered";
  }
}

// ---------------- Test cases ----------------
const room = new ChatRoom();
const alice = new User("Alice");
const bob = new User("Bob");
const modBot = new Bot("ModBot");
room.add(alice).add(bob).add(modBot);

alice.send("hi everyone");
console.log(bob.inbox);
// Expected: [ 'Alice: hi everyone' ]

bob.send("hello Alice");
console.log(alice.inbox);
// Expected: [ 'Alice: hi everyone', 'Bob: hello Alice' ]  (alice doesn't get her own)

// Banned word gets suppressed from users but flagged by the bot
const result = alice.send("this is SPAM");
console.log(result);
// Expected: message suppressed
console.log(bob.inbox);
// Expected: [ 'Alice: hi everyone', 'Bob: hello Alice' ]  (no spam delivered)
console.log(modBot.flags);
// Expected: [ 'Alice flagged for "this is SPAM"' ]

// Removing a colleague stops them receiving
room.remove(bob);
alice.send("are you there bob?");
console.log(bob.inbox);
// Expected: [ 'Alice: hi everyone', 'Bob: hello Alice' ]  (unchanged)
console.log(alice.inbox);
// Expected: [ 'Alice: hi everyone', 'Bob: hello Alice', 'Alice: are you there bob?' ]
