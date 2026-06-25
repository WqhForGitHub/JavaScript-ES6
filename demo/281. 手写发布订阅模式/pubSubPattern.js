/**
 * 发布订阅模式 (Publish–Subscribe Pattern)
 *
 * Approach:
 * - Like Observer, but with an intermediary "Event Bus" (broker). Publishers emit
 *   events to the bus; Subscribers register interest with the bus. Publishers and
 *   subscribers do not know each other — fully decoupled.
 * - Supports topic-based subscriptions, wildcards ('user.*'), once(), and
 *   off()/clear(). emit returns the count of subscribers notified.
 * - Demonstrates the typical chat-room + logging subscriber scenario where a
 *   publisher broadcasts without knowing who listens.
 */

class EventBus {
  constructor() {
    this._topics = new Map(); // topic -> Set<fn>
  }

  on(topic, fn) {
    if (!this._topics.has(topic)) this._topics.set(topic, new Set());
    this._topics.get(topic).add(fn);
    return () => this.off(topic, fn);
  }

  once(topic, fn) {
    const wrapper = (data) => {
      this.off(topic, wrapper);
      return fn(data);
    };
    wrapper._original = fn;
    return this.on(topic, wrapper);
  }

  off(topic, fn) {
    const set = this._topics.get(topic);
    if (!set) return this;
    if (!fn) {
      set.clear();
      return this;
    }
    for (const item of set) {
      if (item === fn || item._original === fn) set.delete(item);
    }
    return this;
  }

  // Supports exact topic and wildcard suffix matching (e.g. 'user.*').
  emit(topic, data) {
    let count = 0;
    for (const [t, set] of this._topics) {
      if (t === topic || this._matches(t, topic)) {
        for (const fn of [...set]) {
          fn(data, topic);
          count++;
        }
      }
    }
    return count;
  }

  _matches(pattern, topic) {
    if (!pattern.includes("*")) return false;
    const regex = new RegExp(
      "^" +
        pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
        "$",
    );
    return regex.test(topic);
  }

  subscribers(topic) {
    return this._topics.get(topic)?.size || 0;
  }

  clear() {
    this._topics.clear();
  }
}

// ---------------- Test cases ----------------
const bus = new EventBus();

const inbox = [];
const archive = [];
const allEvents = [];

bus.on("chat:message", (m) => inbox.push(m));
bus.on("chat:message", (m) => archive.push(m));
bus.on("chat.*", (m, topic) => allEvents.push({ topic, m })); // wildcard
bus.once("system:boot", () => allEvents.push("booted"));

bus.emit("chat:message", "hello");
bus.emit("chat:message", "world");
bus.emit("chat:typing", true);
bus.emit("system:boot", null);

console.log(inbox);
// Expected: [ 'hello', 'world' ]
console.log(archive);
// Expected: [ 'hello', 'world' ]
console.log(allEvents);
// Expected: [
//   { topic: 'chat:message', m: 'hello' },
//   { topic: 'chat:message', m: 'world' },
//   { topic: 'chat:typing', m: true },
//   'booted'
// ]

// once listener no longer fires
console.log(bus.emit("system:boot", null));
// Expected: 0

// off by topic clears that topic only
bus.off("chat:message");
console.log(bus.subscribers("chat:message"));
// Expected: 0
bus.emit("chat:message", "ignored");
console.log(inbox);
// Expected: [ 'hello', 'world' ]  (unchanged)

// unsubscribe handle
const handle = bus.on("temp", (d) => allEvents.push(d));
handle();
console.log(bus.emit("temp", 1));
// Expected: 0
