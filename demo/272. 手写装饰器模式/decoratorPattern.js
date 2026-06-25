/**
 * 装饰器模式 (Decorator Pattern)
 *
 * Approach:
 * - Attach additional responsibilities to an object dynamically without altering
 *   its class and without subclassing for every combination.
 * - A Decorator implements the same interface as the wrapped component and
 *   delegates to it, adding behaviour before/after.
 * - Demonstrated two ways:
 *   1. Object-oriented decorator chain wrapping a Coffee component with Milk, Sugar,
 *      WhippedCream to compute cost & description.
 *   2. ES-style higher-order function decorators that wrap a method to add logging,
 *      timing, memoization.
 */

// ---- Component interface & concrete component ----
class Coffee {
  cost() {
    return 5;
  }
  description() {
    return "Coffee";
  }
}

// ---- Base decorator: delegates everything to wrapped ----
class CoffeeDecorator {
  constructor(component) {
    this.component = component;
  }
  cost() {
    return this.component.cost();
  }
  description() {
    return this.component.description();
  }
}

class Milk extends CoffeeDecorator {
  cost() {
    return this.component.cost() + 1;
  }
  description() {
    return `${this.component.description()} + Milk`;
  }
}

class Sugar extends CoffeeDecorator {
  cost() {
    return this.component.cost() + 0.5;
  }
  description() {
    return `${this.component.description()} + Sugar`;
  }
}

class WhippedCream extends CoffeeDecorator {
  cost() {
    return this.component.cost() + 1.5;
  }
  description() {
    return `${this.component.description()} + WhippedCream`;
  }
}

// ---- Function-style decorators for methods ----
function withLogging(fn, label = fn.name) {
  return function (...args) {
    console.log(`[log] calling ${label}(${args.join(", ")})`);
    const result = fn.apply(this, args);
    console.log(`[log] ${label} returned`, result);
    return result;
  };
}

function withTiming(fn, label = fn.name) {
  return function (...args) {
    const start = Date.now();
    const result = fn.apply(this, args);
    console.log(`[time] ${label} took ${Date.now() - start}ms`);
    return result;
  };
}

function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// ---------------- Test cases ----------------
// Compose decorators
const drink = new WhippedCream(new Sugar(new Milk(new Coffee())));
console.log(drink.description());
// Expected: Coffee + Milk + Sugar + WhippedCream
console.log(drink.cost());
// Expected: 8

// Functional decorator composition. Memoize is the OUTERMOST layer so that on a
// cache hit the inner logging/timing wrappers are skipped entirely (no recompute
// and no log spam on the second call).
function slowSquare(n) {
  return n * n;
}
const decorated = memoize(
  withTiming(withLogging(slowSquare, "slowSquare"), "slowSquare"),
);
console.log(decorated(4));
// Expected logs + 16
console.log(decorated(4)); // second call hits memo cache (same result, no logs)
// Expected: 16

// Apply decorators to a class method
class Calculator {
  fib(n) {
    if (n < 2) return n;
    return this.fib(n - 1) + this.fib(n - 2);
  }
}
Calculator.prototype.fib = memoize(Calculator.prototype.fib);
const calc = new Calculator();
console.log(calc.fib(20));
// Expected: 6765
