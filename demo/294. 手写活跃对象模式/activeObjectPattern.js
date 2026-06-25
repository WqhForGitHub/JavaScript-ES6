/**
 * 活跃对象模式 (Active Object Pattern)
 *
 * Approach:
 * - Decouple method invocation from method execution to introduce concurrency /
 *   serialization. Each method call becomes a request object enqueued on a queue;
 *   a single dedicated "active" thread (in JS, a loop draining the queue via
 *   async/await or setTimeout) executes them one at a time, in order.
 * - Client calls return a Promise that resolves when the scheduler eventually runs
 *   the corresponding request. This mimics an actor with a mailbox.
 * - Benefits: serializes state access (no races), non-blocking API, scheduling
 *   control (FIFO, priority, delay).
 * - We implement an ActiveObject that exposes async proxy methods, a Scheduler
 *   with a FIFO queue, and a Request abstraction.
 */

class Request {
  constructor(method, args) {
    this.method = method;
    this.args = args;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class Scheduler {
  constructor() {
    this.queue = [];
    this.running = false;
  }
  enqueue(request) {
    this.queue.push(request);
    this._drain();
    return request.promise;
  }
  async _drain() {
    if (this.running) return;
    this.running = true;
    try {
      while (this.queue.length > 0) {
        const req = this.queue.shift();
        try {
          const result = await req.method(...req.args);
          req.resolve(result);
        } catch (err) {
          req.reject(err);
        }
      }
    } finally {
      this.running = false;
    }
  }
  size() {
    return this.queue.length;
  }
}

// Servant: the actual stateful object doing the work (NOT exposed to clients).
class CounterServant {
  constructor(start = 0) {
    this.value = start;
    this.log = [];
  }
  increment() {
    this.value += 1;
    this.log.push(`inc -> ${this.value}`);
    return this.value;
  }
  async incrementAsync(delay = 10) {
    await new Promise((r) => setTimeout(r, delay));
    this.value += 1;
    this.log.push(`incAsync -> ${this.value}`);
    return this.value;
  }
  add(n) {
    this.value += n;
    this.log.push(`add(${n}) -> ${this.value}`);
    return this.value;
  }
  snapshot() {
    return { value: this.value, log: [...this.log] };
  }
}

// Active Object: a proxy exposing async methods that enqueue requests.
class ActiveCounter {
  constructor(start = 0) {
    this.servant = new CounterServant(start);
    this.scheduler = new Scheduler();
  }
  _enqueue(methodName, args) {
    // Bind the servant method so that when the scheduler invokes it later, `this`
    // still refers to the servant (otherwise the detached method loses its state).
    const bound = this.servant[methodName].bind(this.servant);
    return this.scheduler.enqueue(new Request(bound, args));
  }
  increment() {
    return this._enqueue("increment", []);
  }
  incrementAsync(delay) {
    return this._enqueue("incrementAsync", [delay]);
  }
  add(n) {
    return this._enqueue("add", [n]);
  }
  snapshot() {
    return this._enqueue("snapshot", []);
  }
}

// ---------------- Test cases ----------------
(async () => {
  const counter = new ActiveCounter(0);

  // Fire many async calls back-to-back. They execute serially (no races).
  const p1 = counter.increment();
  const p2 = counter.add(5);
  const p3 = counter.incrementAsync(10);
  const p4 = counter.add(2);

  const results = await Promise.all([p1, p2, p3, p4]);
  console.log(results);
  // Expected: [ 1, 6, 7, 9 ]

  const snap = await counter.snapshot();
  console.log(snap.value, snap.log);
  // Expected: 9 [ 'inc -> 1', 'add(5) -> 6', 'incAsync -> 7', 'add(2) -> 9' ]

  // Queue is empty after all tasks complete
  console.log("queue size:", counter.scheduler.size());
  // Expected: queue size: 0

  // Ordering proof: even though incrementAsync has a delay, later add() calls
  // still see the delayed increment because requests run FIFO.
  const c2 = new ActiveCounter(100);
  const out = [];
  out.push(await c2.incrementAsync(20)); // 101 (delayed)
  out.push(await c2.add(1)); // 102
  console.log(out);
  // Expected: [ 101, 102 ]
})();
