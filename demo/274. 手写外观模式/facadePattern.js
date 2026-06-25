/**
 * 外观模式 (Facade Pattern)
 *
 * Approach:
 * - Provide a unified, simplified interface to a complex subsystem (a set of
 *   interfaces). The facade delegates to subsystem objects; it does not encapsulate
 *   them — they remain directly accessible if needed.
 * - We model a "HomeTheater" facade that hides the coordination of multiple
 *   devices (Amplifier, Projector, StreamingPlayer, Lights, Screen) behind two
 *   simple methods: watchMovie(title) and endMovie().
 * - Also show a simplified DOM-style event facade that wraps addEventListener /
 *   removeEventListener / dispatch into one tiny API.
 */

// ---- Subsystems ----
class Amplifier {
  on() {
    this.on = true;
    return "Amplifier on";
  }
  off() {
    this.on = false;
    return "Amplifier off";
  }
  setVolume(v) {
    this.volume = v;
    return `Volume ${v}`;
  }
}
class Projector {
  on() {
    this.on = true;
    return "Projector on";
  }
  off() {
    this.on = false;
    return "Projector off";
  }
  setMode(mode) {
    return `Projector mode: ${mode}`;
  }
}
class StreamingPlayer {
  on() {
    this.on = true;
    return "Player on";
  }
  off() {
    this.on = false;
    return "Player off";
  }
  play(title) {
    return `Playing "${title}"`;
  }
  stop() {
    return "Player stopped";
  }
}
class Lights {
  dim(level) {
    return `Lights dimmed to ${level}%`;
  }
  on() {
    return "Lights on";
  }
}
class Screen {
  down() {
    return "Screen down";
  }
  up() {
    return "Screen up";
  }
}

// ---- Facade ----
class HomeTheaterFacade {
  constructor(amp, projector, player, lights, screen) {
    this.amp = amp;
    this.projector = projector;
    this.player = player;
    this.lights = lights;
    this.screen = screen;
  }
  watchMovie(title) {
    const steps = [];
    steps.push(this.lights.dim(10));
    steps.push(this.screen.down());
    steps.push(this.projector.on());
    steps.push(this.projector.setMode("wide"));
    steps.push(this.amp.on());
    steps.push(this.amp.setVolume(7));
    steps.push(this.player.on());
    steps.push(this.player.play(title));
    return steps;
  }
  endMovie() {
    const steps = [];
    steps.push(this.player.stop());
    steps.push(this.player.off());
    steps.push(this.amp.off());
    steps.push(this.projector.off());
    steps.push(this.screen.up());
    steps.push(this.lights.on());
    return steps;
  }
}

// ---- Mini event facade over a simple emitter ----
class EventFacade {
  constructor() {
    this._handlers = new Map();
  }
  on(type, fn) {
    if (!this._handlers.has(type)) this._handlers.set(type, new Set());
    this._handlers.get(type).add(fn);
    return () => this.off(type, fn); // unsubscribe handle
  }
  off(type, fn) {
    this._handlers.get(type)?.delete(fn);
  }
  emit(type, payload) {
    this._handlers.get(type)?.forEach((fn) => fn(payload));
  }
}

// ---------------- Test cases ----------------
const theater = new HomeTheaterFacade(
  new Amplifier(),
  new Projector(),
  new StreamingPlayer(),
  new Lights(),
  new Screen(),
);

console.log(theater.watchMovie("Inception"));
// Expected: [
//   'Lights dimmed to 10%', 'Screen down', 'Projector on',
//   'Projector mode: wide', 'Amplifier on', 'Volume 7',
//   'Player on', 'Playing "Inception"'
// ]
console.log(theater.endMovie());
// Expected: [
//   'Player stopped', 'Player off', 'Amplifier off',
//   'Projector off', 'Screen up', 'Lights on'
// ]

// Event facade: one API for on/off/emit
const bus = new EventFacade();
const got = [];
const off = bus.on("greet", (p) => got.push(p));
bus.emit("greet", "hi");
off();
bus.emit("greet", "ignored");
console.log(got);
// Expected: [ 'hi' ]
