/**
 * 手写双缓冲渲染
 * Double buffering: render to an offscreen canvas, then blit to the visible canvas
 * in one operation to avoid flicker/tearing during animation.
 *
 * Approach:
 * - Maintain two canvases: `back` (offscreen, used for drawing) and `front` (visible).
 * - Each frame: clear & draw on the back canvas, then copy the whole back canvas
 *   onto the front canvas via `drawImage` (a single, atomic-looking blit).
 * - `render(drawFn)` runs one frame; `start(drawFn, fps)` loops with setInterval/rAF.
 * - In Node (no canvas), we fall back to a pure-JS "frame buffer" of pixel arrays
 *   so the logic is testable: `renderPixel(drawFn)` returns the swapped buffers.
 *
 * Browser portion requires a <canvas> environment.
 */
function createDoubleBuffer(frontCanvas) {
  // Browser path.
  if (frontCanvas && typeof document !== 'undefined') {
    const frontCtx = frontCanvas.getContext('2d');
    const backCanvas = document.createElement('canvas');
    backCanvas.width = frontCanvas.width;
    backCanvas.height = frontCanvas.height;
    const backCtx = backCanvas.getContext('2d');

    let timer = null;
    let frame = 0;

    function render(drawFn) {
      frame++;
      backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
      drawFn(backCtx, frame);
      // Atomic blit: copy back -> front in one call.
      frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
      frontCtx.drawImage(backCanvas, 0, 0);
    }

    function start(drawFn, fps = 60) {
      stop();
      const interval = Math.max(1, Math.floor(1000 / fps));
      timer = setInterval(() => render(drawFn), interval);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    return { render, start, stop, get frame() { return frame; } };
  }

  // Pure-JS fallback for testing in Node: simulate double buffering with arrays.
  const W = 4, H = 4;
  let back = new Array(W * H).fill(0);
  let front = new Array(W * H).fill(0);
  let frame = 0;

  function renderPixel(drawFn) {
    frame++;
    back = new Array(W * H).fill(0);
    drawFn({
      setPixel(x, y, c) { back[y * W + x] = c; },
      width: W,
      height: H,
      frame,
    });
    // Blit: copy back buffer to front in one step.
    front = back.slice();
    return front.slice();
  }

  return {
    render: renderPixel,
    start() {},
    stop() {},
    get frame() { return frame; },
    get front() { return front; },
    width: W,
    height: H,
  };
}

// ---------- Test cases ----------
// Use the pure-JS fallback so this runs anywhere.
const db = createDoubleBuffer(null);

const f1 = db.render((ctx) => {
  ctx.setPixel(0, 0, 1);
  ctx.setPixel(3, 3, 9);
});
console.log('frame 1 pixels:', f1);
// expected: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,9]
console.log('frame counter:', db.frame); // expected: 1

const f2 = db.render((ctx) => {
  ctx.setPixel(1, 1, 5);
});
console.log('frame 2 pixels:', f2);
// expected: [0,0,0,0, 0,5,0,0, 0,0,0,0, 0,0,0,0] (previous frame is gone — back buffer was cleared)
console.log('frame counter:', db.frame); // expected: 2

console.log('has start/stop:', typeof db.start === 'function' && typeof db.stop === 'function');
// expected: has start/stop: true
