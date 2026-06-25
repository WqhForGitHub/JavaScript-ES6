/**
 * 策略模式 (Strategy Pattern)
 *
 * Approach:
 * - Define a family of algorithms, encapsulate each one, and make them
 *   interchangeable. Strategy lets the algorithm vary independently from clients
 *   that use it.
 * - A Context holds a reference to a Strategy and delegates the algorithm call.
 *   Swapping strategies changes behaviour without touching the context.
 * - Examples:
 *   1. Shipping cost calculator with Express/Standard/Economy strategies.
 *   2. A payment Strategy selector (CreditCard / PayPal / Crypto).
 *   3. Sorting strategy picker (by date / by size / by name).
 */

// ---- Context ----
class ShippingContext {
  constructor(strategy) {
    this.strategy = strategy;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
    return this;
  }
  calculate(package_) {
    return this.strategy.calculate(package_);
  }
}

// ---- Strategies ----
class ExpressShipping {
  calculate(pkg) {
    return pkg.weight * 2.5 + 10; // premium flat fee
  }
}
class StandardShipping {
  calculate(pkg) {
    return pkg.weight * 1.2 + 3;
  }
}
class EconomyShipping {
  calculate(pkg) {
    return pkg.weight * 0.8;
  }
}

// ---- Sorting strategies ----
const sortStrategies = {
  byName: (a, b) => a.name.localeCompare(b.name),
  bySize: (a, b) => a.size - b.size,
  byDate: (a, b) => a.date - b.date,
};

function sortItems(items, strategy) {
  return [...items].sort(strategy);
}

// ---- Payment strategies ----
class CreditCardPayment {
  pay(amount) {
    return `Charged $${amount} to credit card`;
  }
}
class PayPalPayment {
  pay(amount) {
    return `Paid $${amount} via PayPal`;
  }
}
class CryptoPayment {
  pay(amount) {
    return `Transferred $${amount} in crypto`;
  }
}
class Checkout {
  constructor(paymentStrategy) {
    this.payment = paymentStrategy;
  }
  checkout(amount) {
    return this.payment.pay(amount);
  }
}

// ---------------- Test cases ----------------
const pkg = { weight: 5 };
const ctx = new ShippingContext(new ExpressShipping());
console.log(ctx.calculate(pkg));
// Expected: 22.5
ctx.setStrategy(new EconomyShipping());
console.log(ctx.calculate(pkg));
// Expected: 4
ctx.setStrategy(new StandardShipping());
console.log(ctx.calculate(pkg));
// Expected: 9

// Sorting strategies
const files = [
  { name: "b.txt", size: 3, date: 3 },
  { name: "a.txt", size: 1, date: 2 },
  { name: "c.txt", size: 2, date: 1 },
];
console.log(sortItems(files, sortStrategies.byName).map((f) => f.name));
// Expected: [ 'a.txt', 'b.txt', 'c.txt' ]
console.log(sortItems(files, sortStrategies.bySize).map((f) => f.size));
// Expected: [ 1, 2, 3 ]
console.log(sortItems(files, sortStrategies.byDate).map((f) => f.date));
// Expected: [ 1, 2, 3 ]

// Payment strategies
console.log(new Checkout(new CreditCardPayment()).checkout(50));
// Expected: Charged $50 to credit card
console.log(new Checkout(new CryptoPayment()).checkout(50));
// Expected: Transferred $50 in crypto
