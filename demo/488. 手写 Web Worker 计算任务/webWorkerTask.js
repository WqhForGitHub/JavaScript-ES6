/**
 * 手写 Web Worker 计算任务
 * Run a CPU-heavy computation in a Web Worker without blocking the main thread.
 *
 * Approach:
 * - `createWorkerFromFunction(fn)` builds a Blob URL from the function source
 *   so we can spawn a worker WITHOUT a separate .js file (works in browsers).
 * - The worker receives { id, payload } messages, runs `fn(payload)`, and posts
 *   { id, result } (or { id, error }) back. The id lets the caller correlate
 *   requests with responses.
 * - The main-thread wrapper returns a Promise per `run(payload)` call.
 * - Also includes a pure `runInWorker` helper usable as `await runInWorker(heavyFn, data)`.
 *
 * Browser-only: in Node, `Worker`, `Blob`, `URL.createObjectURL` are unavailable.
 * The code below guards for that and falls back to running synchronously.
 */

function createWorkerFromFunction(fn) {
  if (typeof Worker === "undefined" || typeof Blob === "undefined") {
    console.warn(
      "[webWorkerTask] Web Workers unsupported; running on main thread.",
    );
    return {
      run: (payload) => Promise.resolve().then(() => fn(payload)),
      terminate() {},
    };
  }

  const source = `
    self.onmessage = function (e) {
      var data = e.data;
      try {
        var fn = ${fn.toString()};
        var result = fn(data.payload);
        self.postMessage({ id: data.id, result: result });
      } catch (err) {
        self.postMessage({ id: data.id, error: err && err.message || String(err) });
      }
    };
  `;
  const blob = new Blob([source], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  let nextId = 1;
  const pending = new Map();

  worker.onmessage = (e) => {
    const { id, result, error } = e.data;
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    if (error) entry.reject(new Error(error));
    else entry.resolve(result);
  };
  worker.onerror = (err) => {
    // Reject all pending on hard error.
    for (const [, entry] of pending) entry.reject(err);
    pending.clear();
  };

  function run(payload) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, payload });
    });
  }

  function terminate() {
    worker.terminate();
    URL.revokeObjectURL(url);
    pending.clear();
  }

  return { run, terminate };
}

async function runInWorker(fn, payload) {
  const w = createWorkerFromFunction(fn);
  try {
    return await w.run(payload);
  } finally {
    w.terminate();
  }
}

// ---------- Test cases ----------
// Heavy function: sum of squares from 0..n-1.
function heavySum(n) {
  let total = 0;
  for (let i = 0; i < n; i++) total += i * i;
  return total;
}

if (typeof Worker !== "undefined") {
  // Browser path.
  runInWorker(heavySum, 10000000).then((r) => {
    console.log("worker result:", r); // expected: a large number computed off main thread
  });
} else {
  // Node fallback: run synchronously to verify the function itself works.
  const r = heavySum(1000);
  console.log("fallback heavySum(1000):", r); // expected: 332833500
  console.log(
    "createWorkerFromFunction is a function:",
    typeof createWorkerFromFunction === "function",
  );
  // expected: createWorkerFromFunction is a function: true
  console.log("runInWorker is a function:", typeof runInWorker === "function");
  // expected: runInWorker is a function: true
}
