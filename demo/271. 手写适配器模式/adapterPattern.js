/**
 * 适配器模式 (Adapter Pattern)
 *
 * Approach:
 * - Convert the interface of an incompatible class into another interface a client
 *   expects. Lets classes work together that otherwise couldn't because of
 *   incompatible interfaces.
 * - We model a legacy logger with `logError(code, msg)` and a new system that
 *   expects `report({ level, message })`. An adapter wraps the legacy logger and
 *   exposes the new interface, translating the call.
 * - Also show an adapter that normalizes two different payment API shapes
 *   (Stripe-style vs PayPal-style) into a common `charge(amount, currency)` API.
 */

// ---- Target interface the client expects ----
class ILogger {
  report(entry) {
    throw new Error("abstract");
  }
}

// ---- Adaptee: legacy logger with an incompatible API ----
class LegacyLogger {
  logError(code, message) {
    return `LEGACY[${code}]: ${message}`;
  }
  logInfo(message) {
    return `LEGACY[INFO]: ${message}`;
  }
}

// ---- Adapter: makes LegacyLogger conform to ILogger ----
class LoggerAdapter extends ILogger {
  constructor(legacy) {
    super();
    this.legacy = legacy;
  }
  report(entry) {
    const { level, message, code = 0 } = entry;
    if (level === "error") return this.legacy.logError(code, message);
    return this.legacy.logInfo(message);
  }
}

// ---- Payment adapters: unify two 3rd-party SDKs ----
class StripeSDK {
  createCharge(cents, currency) {
    return { gateway: "stripe", amount: cents, currency };
  }
}
class PayPalSDK {
  pay(dollars, currencyCode) {
    return { gateway: "paypal", total: dollars, ccy: currencyCode };
  }
}

class PaymentAdapter {
  constructor(sdk, kind) {
    this.sdk = sdk;
    this.kind = kind;
  }
  charge(amount, currency) {
    if (this.kind === "stripe") {
      const r = this.sdk.createCharge(Math.round(amount * 100), currency);
      return { ok: true, gateway: r.gateway, charged: r.amount / 100 };
    }
    if (this.kind === "paypal") {
      const r = this.sdk.pay(amount, currency);
      return { ok: true, gateway: r.gateway, charged: r.total };
    }
    throw new Error("Unknown gateway");
  }
}

// ---------------- Test cases ----------------
const adapter = new LoggerAdapter(new LegacyLogger());
console.log(adapter.report({ level: "error", code: 42, message: "DB down" }));
// Expected: LEGACY[42]: DB down
console.log(adapter.report({ level: "info", message: "started" }));
// Expected: LEGACY[INFO]: started

const stripe = new PaymentAdapter(new StripeSDK(), "stripe");
const paypal = new PaymentAdapter(new PayPalSDK(), "paypal");
console.log(stripe.charge(9.99, "USD"));
// Expected: { ok: true, gateway: 'stripe', charged: 9.99 }
console.log(paypal.charge(15.5, "EUR"));
// Expected: { ok: true, gateway: 'paypal', charged: 15.5 }

// Client code only knows the unified charge() interface.
function checkout(adapter, amount) {
  return adapter.charge(amount, "USD");
}
console.log(checkout(stripe, 5), checkout(paypal, 5));
// Expected: { ok: true, gateway: 'stripe', charged: 5 } { ok: true, gateway: 'paypal', charged: 5 }
