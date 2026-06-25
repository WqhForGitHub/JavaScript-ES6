/**
 * 跨标签页通信 (BroadcastChannel simulation)
 *
 * Approach:
 * - The real BroadcastChannel API allows separate browser tabs to exchange messages
 *   over a named channel. Since a single Node.js process has no tabs, we simulate a
 *   cross-context bus backed by a shared registry of channel instances.
 * - Each "tab" creates its own BroadcastChannel-like instance bound to a channel name.
 *   Messages posted by one instance are delivered to all OTHER instances on the same
 *   channel name via their onmessage / onmessageerror handlers.
 * - We also provide a fallback path that uses localStorage + the 'storage' event for
 *   environments where real BroadcastChannel exists across tabs (described in comments).
 */

const channels = new Map(); // name -> Set<SimBroadcastChannel>

class SimBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
    this.onmessageerror = null;
    this._closed = false;
    if (!channels.has(name)) channels.set(name, new Set());
    channels.get(name).add(this);
  }

  postMessage(message) {
    if (this._closed)
      throw new Error("Cannot post on a closed BroadcastChannel");
    const members = channels.get(this.name);
    if (!members) return;
    const data = { data: message, origin: this.name };
    for (const peer of members) {
      if (peer === this || peer._closed) continue; // do not echo to self
      // Defer to mimic async event-loop delivery
      queueMicrotask(() => {
        if (peer._closed || !peer.onmessage) return;
        peer.onmessage({ type: "message", target: peer, data: data.data });
      });
    }
  }

  close() {
    this._closed = true;
    const members = channels.get(this.name);
    if (members) members.delete(this);
    this.onmessage = null;
    this.onmessageerror = null;
  }
}

/**
 * Real-browser fallback (for reference). If you actually have multiple HTML tabs:
 *
 *   const bc = new BroadcastChannel('app');
 *   bc.onmessage = (e) => console.log('got', e.data);
 *   bc.postMessage('hello');
 *
 *   // localStorage fallback for older browsers:
 *   window.addEventListener('storage', (e) => {
 *     if (e.key === 'app-bus') console.log('got', JSON.parse(e.newValue));
 *   });
 *   localStorage.setItem('app-bus', JSON.stringify({ ts: Date.now(), data }));
 */

// ---------------- Test cases ----------------
const tabA = new SimBroadcastChannel("app");
const tabB = new SimBroadcastChannel("app");
const tabC = new SimBroadcastChannel("app");

const received = { A: [], B: [], C: [] };
tabA.onmessage = (e) => received.A.push(e.data);
tabB.onmessage = (e) => received.B.push(e.data);
tabC.onmessage = (e) => received.C.push(e.data);

// Allow queueMicrotask callbacks to flush.
setTimeout(() => {
  tabA.postMessage({ greeting: "from A" });
  setTimeout(() => {
    console.log(received);
    // Expected: A: [], B: [{ greeting: 'from A' }], C: [{ greeting: 'from A' }]
    // (sender never receives its own message)

    tabB.postMessage("hello from B");
    setTimeout(() => {
      console.log(received);
      // Expected: A: ['hello from B'], B still [], C: ['hello from B']

      tabC.close();
      tabA.postMessage("after C closed");
      setTimeout(() => {
        console.log(received);
        // Expected: only B receives 'after C closed'; C never gets it
      }, 10);
    }, 10);
  }, 10);
}, 10);
