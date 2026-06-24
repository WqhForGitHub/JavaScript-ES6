/**
 * 依赖注入模式 (Dependency Injection Pattern)
 *
 * Approach:
 * - Inversion of Control: a class receives its collaborators (dependencies) from
 *   an external container instead of constructing them itself. This decouples
 *   classes from concrete implementations, easing testing and configuration.
 * - We implement a small DI container that supports:
 *     * register(token, provider|class|factory, { singleton })
 *     * resolve(token) -> instance, resolving constructor/property deps recursively
 *     * inject decorators (metadata) so a class declares its dependencies
 *     * singleton vs transient lifetimes
 *     * factory providers that receive the container for manual wiring
 * - Example: an OrderService depends on a PaymentGateway and a Logger, both
 *   injected. We swap the gateway to a mock in a test scenario without touching
 *   OrderService.
 */

// Minimal metadata storage for decorator-style injection (since we cannot rely on
// TC39 decorators across Node versions, we use static fields + helper).
function deps(...tokens) {
  return function (Ctor) {
    Ctor.__inject = tokens;
    return Ctor;
  };
}

class Container {
  constructor() {
    this.providers = new Map();
  }
  register(token, provider, options = {}) {
    this.providers.set(token, { provider, singleton: !!options.singleton, instance: undefined });
    return this;
  }
  registerInstance(token, instance) {
    this.providers.set(token, {
      provider: () => instance,
      singleton: true,
      instance,
    });
    return this;
  }
  has(token) {
    return this.providers.has(token);
  }
  resolve(token, seen = new Set()) {
    if (seen.has(token)) throw new Error(`Circular dependency: ${String(token)}`);
    const reg = this.providers.get(token);
    if (!reg) throw new Error(`No provider for ${String(token)}`);
    if (reg.singleton && reg.instance !== undefined) return reg.instance;

    seen.add(token);
    const instance = this._instantiate(reg.provider, seen);
    seen.delete(token);

    if (reg.singleton) reg.instance = instance;
    return instance;
  }
  _instantiate(provider, seen) {
    // Factory function: call it with the container for manual wiring.
    if (typeof provider === 'function' && !provider.prototype) {
      return provider(this);
    }
    // Plain factory registered as a class-like function with no __inject:
    if (typeof provider === 'function' && provider.__inject === undefined && !/^class\s/.test(Function.prototype.toString.call(provider))) {
      return provider(this);
    }
    // Class with declared dependencies.
    const Ctor = provider;
    const tokens = Ctor.__inject || [];
    const args = tokens.map((t) => this.resolve(t, seen));
    const instance = new Ctor(...args);
    // Property injection: any token listed in Ctor.__props gets assigned.
    if (Ctor.__props) {
      for (const [key, t] of Object.entries(Ctor.__props)) {
        instance[key] = this.resolve(t, seen);
      }
    }
    return instance;
  }
  // Convenience: create a child container that overrides specific tokens (good for tests).
  createChild() {
    const child = new Container();
    child.providers = new Map(this.providers);
    return child;
  }
}

// ---- Example services ----
class Logger {
  log(msg) {
    return `LOG: ${msg}`;
  }
}

class PaymentGateway {
  charge(amount) {
    return `charged ${amount} (real gateway)`;
  }
}

class OrderService {
  constructor(logger, gateway) {
    this.logger = logger;
    this.gateway = gateway;
  }
  checkout(amount) {
    this.logger.log(`checkout ${amount}`);
    return this.gateway.charge(amount);
  }
}
// Declare constructor dependencies.
OrderService.__inject = ['Logger', 'PaymentGateway'];

// ---------------- Test cases ----------------
const container = new Container();
container.register('Logger', Logger, { singleton: true });
container.register('PaymentGateway', PaymentGateway, { singleton: true });
container.register('OrderService', OrderService);

const order = container.resolve('OrderService');
console.log(order.checkout(42));
// Expected: charged 42 (real gateway)
// (checkout() also calls logger.log('checkout 42') internally; Logger.log returns
//  the formatted string but does not print it, so only the charge result is shown.)

// Singleton: Logger is shared across all consumers.
const loggerA = container.resolve('Logger');
const loggerB = container.resolve('Logger');
console.log(loggerA === loggerB);
// Expected: true

// Transient: register a non-singleton and verify new instances each time.
class Counter {
  constructor() {
    this.n = 0;
  }
  inc() {
    return ++this.n;
  }
}
container.register('Counter', Counter); // not singleton
console.log(container.resolve('Counter') !== container.resolve('Counter'));
// Expected: true

// Test override: swap PaymentGateway with a mock in a child container, no change
// to OrderService code.
const testContainer = container.createChild();
class MockGateway {
  charge(amount) {
    return `MOCK charged ${amount}`;
  }
}
testContainer.register('PaymentGateway', MockGateway, { singleton: true });
// Clear cached OrderService so it rebuilds with the new gateway.
testContainer.register('OrderService', OrderService);
const testOrder = testContainer.resolve('OrderService');
console.log(testOrder.checkout(99));
// Expected: LOG: checkout 99
//           MOCK charged 99

// Factory provider that receives the container.
container.register('Config', () => ({ env: 'prod', version: '1.0.0' }));
console.log(container.resolve('Config'));
// Expected: { env: 'prod', version: '1.0.0' }

// Circular dependency detection
class A {}
class B {}
A.__inject = ['B'];
B.__inject = ['A'];
const cyclic = new Container();
cyclic.register('A', A);
cyclic.register('B', B);
try {
  cyclic.resolve('A');
} catch (e) {
  console.log('Cycle:', e.message);
  // Expected: Cycle: Circular dependency: A
}
