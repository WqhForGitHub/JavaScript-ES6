/**
 * 观察者模式 (Observer Pattern)
 *
 * Approach:
 * - Define a one-to-many dependency: when one object (Subject) changes state, all
 *   its dependents (Observers) are notified and updated automatically.
 * - Unlike pub/sub, the Subject typically holds direct references to its Observers
 *   and pushes state to them. Observers register/unregister directly with the
 *   Subject.
 * - We implement:
 *   1. A classic Subject/Observer pair (a WeatherStation pushing temperature).
 *   2. A typed observer base with update(state).
 *   3. Pull-style variant where observers read getState() themselves.
 */

class Subject {
  constructor() {
    this._observers = new Set();
  }
  attach(observer) {
    this._observers.add(observer);
    return this;
  }
  detach(observer) {
    this._observers.delete(observer);
    return this;
  }
  notify(data) {
    for (const o of this._observers) {
      if (typeof o.update === 'function') o.update(data, this);
      else if (typeof o === 'function') o(data, this);
    }
  }
}

class Observer {
  update() {
    throw new Error('abstract');
  }
}

// ---- Concrete subject: weather station ----
class WeatherStation extends Subject {
  constructor() {
    super();
    this._temperature = 0;
  }
  setTemperature(t) {
    const old = this._temperature;
    this._temperature = t;
    this.notify({ temperature: t, old });
  }
  get temperature() {
    return this._temperature;
  }
}

// ---- Concrete observers ----
class Display extends Observer {
  constructor(name) {
    super();
    this.name = name;
  }
  update({ temperature, old }) {
    this.last = `${this.name}: ${old} -> ${temperature}`;
  }
}

class AlertSystem extends Observer {
  constructor(threshold) {
    super();
    this.threshold = threshold;
    this.alarms = [];
  }
  update({ temperature }) {
    if (temperature > this.threshold) {
      this.alarms.push(`ALERT ${temperature} > ${this.threshold}`);
    }
  }
}

// ---- Pull-style observer: gets state from subject on notify ----
class LoggingObserver {
  update(_data, subject) {
    this.logged = subject.temperature;
  }
}

// ---------------- Test cases ----------------
const station = new WeatherStation();
const phone = new Display('Phone');
const wall = new Display('Wall');
const alarm = new AlertSystem(30);
const logger = new LoggingObserver();

station.attach(phone).attach(wall).attach(alarm).attach(logger);

station.setTemperature(20);
console.log(phone.last, wall.last, alarm.alarms);
// Expected: Phone: 0 -> 20 Wall: 0 -> 20 []

station.setTemperature(35);
console.log(phone.last, alarm.alarms, logger.logged);
// Expected: Phone: 20 -> 35 [ 'ALERT 35 > 30' ] 35

station.detach(phone);
station.setTemperature(40);
console.log(phone.last);
// Expected: Phone: 20 -> 35  (phone detached, no further updates)

// Function-style observers also work via the same Subject.notify path.
const fnCalls = [];
station.attach((data) => fnCalls.push(data.temperature));
station.setTemperature(50);
console.log(fnCalls);
// Expected: [ 50 ]
