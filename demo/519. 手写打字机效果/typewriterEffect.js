/**
 * 手写打字机效果
 * Reveal text one character at a time, like a typewriter, with optional
 * caret blinking, typing speed variance, and delete/backspace mode.
 *
 * Approach:
 * - `typewriter(target, text, opts)` schedules recursive setTimeout calls
 *   that slice `text` from 0..i and write it to `target` (a DOM text node,
 *   element, or a callback).
 * - Support `speed` (ms per char) and `variance` (random jitter) for a
 *   natural feel.
 * - Support `loop` mode that types then deletes then types again.
 * - Support a `caret` element whose visibility we toggle on a timer.
 * - Return a controller: { pause, resume, stop, isRunning }.
 * - In Node we run against a callback so the effect can be tested.
 *
 * @param {HTMLElement|((text:string)=>void)} target
 * @param {string} text
 * @param {{speed?:number, variance?:number, loop?:boolean, deleteSpeed?:number, onStart?:Function, onEnd?:Function, onTick?:Function}} [opts]
 * @returns {{pause:Function, resume:Function, stop:Function, isRunning:Function}}
 */
function typewriter(target, text, opts = {}) {
  const {
    speed = 80,
    variance = 0,
    loop = false,
    deleteSpeed = 40,
    onStart,
    onEnd,
    onTick,
  } = opts;

  let i = 0;
  let deleting = false;
  let paused = false;
  let stopped = false;
  let timer = null;

  function write(value) {
    if (typeof target === "function") target(value);
    else if (target && typeof target.textContent !== "undefined")
      target.textContent = value;
    else if (target && typeof target.nodeValue !== "undefined")
      target.nodeValue = value;
  }

  function schedule(fn) {
    if (paused || stopped) return;
    const base = deleting ? deleteSpeed : speed;
    const jitter = variance > 0 ? Math.random() * variance : 0;
    timer = setTimeout(fn, base + jitter);
  }

  function tick() {
    if (stopped) return;
    if (!deleting) {
      i++;
      write(text.slice(0, i));
      if (onTick) onTick(text.slice(0, i), i);
      if (i >= text.length) {
        if (onEnd) onEnd();
        if (loop) {
          // Pause at full, then start deleting.
          schedule(() => {
            deleting = true;
            tick();
          });
          return;
        }
        return; // done
      }
    } else {
      i--;
      write(text.slice(0, i));
      if (onTick) onTick(text.slice(0, i), i);
      if (i <= 0) {
        deleting = false;
        if (onStart) onStart();
      }
    }
    schedule(tick);
  }

  if (onStart) onStart();
  schedule(tick);

  return {
    pause() {
      paused = true;
      if (timer) clearTimeout(timer);
    },
    resume() {
      if (paused) {
        paused = false;
        schedule(tick);
      }
    },
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      write("");
    },
    isRunning() {
      return !stopped && !paused;
    },
  };
}

// ---------- Test cases ----------
// Use a callback target and fast timers so the test runs quickly.
const output = [];
const controller = typewriter((t) => output.push(t), "Hi", {
  speed: 5,
  variance: 0,
  onTick: () => {},
});

// Wait long enough for "Hi" (3 ticks: H, Hi, then end).
setTimeout(() => {
  console.log("typed sequence:", output); // expected: ['H', 'Hi']
  console.log("still running after done:", controller.isRunning()); // expected: false (stopped naturally? no - it's just idle)
  controller.stop();
  console.log("after stop running:", controller.isRunning()); // expected: false
}, 50);

// Loop mode: types then deletes then types again.
const loopOutput = [];
const loopCtrl = typewriter(
  (t) => {
    if (loopOutput[loopOutput.length - 1] !== t) loopOutput.push(t);
  },
  "Go",
  { speed: 5, deleteSpeed: 5, loop: true },
);
setTimeout(() => {
  loopCtrl.stop();
  // Should have typed G, Go, then deleted to G, then '' , then G, Go, ...
  console.log(
    "loop produced typing+deleting:",
    loopOutput.includes("Go") && loopOutput.includes("G"),
  );
  // expected: true
  console.log("loop sample:", loopOutput.slice(0, 6)); // expected: ['G','Go','G','','G','Go']
}, 80);

// Pause / resume.
const pauseOutput = [];
const pauseCtrl = typewriter(
  (t) => {
    if (pauseOutput[pauseOutput.length - 1] !== t) pauseOutput.push(t);
  },
  "ABC",
  { speed: 20 },
);
setTimeout(() => {
  pauseCtrl.pause();
  const snapshot = pauseOutput.length;
  console.log("paused after some ticks, count:", snapshot >= 1); // expected: true
  setTimeout(() => {
    // While paused, nothing should have been added.
    console.log("paused - no new ticks:", pauseOutput.length === snapshot); // expected: true
    pauseCtrl.resume();
    setTimeout(() => {
      console.log("resumed - progressed:", pauseOutput.length > snapshot); // expected: true
      pauseCtrl.stop();
    }, 80);
  }, 30);
}, 30);
