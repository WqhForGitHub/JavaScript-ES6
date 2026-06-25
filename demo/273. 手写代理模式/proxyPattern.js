/**
 * 代理模式 (Proxy Pattern)
 *
 * Approach:
 * - Provide a surrogate or placeholder for another object to control access to it:
 *   lazy initialization, access control, caching, logging, etc.
 * - Demonstrated two ways:
 *   1. A Virtual Proxy that defers creating an expensive Image/File object until
 *      it is actually used.
 *   2. ES6 Proxy metaprogramming: a caching proxy, a read-only proxy, and a
 *      validation proxy on a plain object.
 */

// ---- 1. Virtual proxy: defer construction of a heavy resource ----
class HeavyImage {
  constructor(filename) {
    this.filename = filename;
    // Simulate expensive load.
    this.loadedAt = Date.now();
    this.data = `${filename}-pixels`;
  }
  draw() {
    return `drawing ${this.data}`;
  }
}

class ImageProxy {
  constructor(filename) {
    this.filename = filename;
    this._real = null;
  }
  draw() {
    if (!this._real) {
      console.log(`[proxy] lazily loading ${this.filename}`);
      this._real = new HeavyImage(this.filename);
    }
    return this._real.draw();
  }
}

// ---- 2. ES6 Proxy examples ----
function makeCachingProxy(target) {
  const cache = new Map();
  return new Proxy(target, {
    get(obj, prop) {
      if (typeof obj[prop] === "function") {
        if (!cache.has(prop)) {
          cache.set(prop, (...args) => {
            const key = `${prop}:${JSON.stringify(args)}`;
            if (!cache.has(key)) cache.set(key, obj[prop](...args));
            return cache.get(key);
          });
        }
        return cache.get(prop);
      }
      return obj[prop];
    },
  });
}

function makeReadOnlyProxy(target) {
  return new Proxy(target, {
    set() {
      throw new Error("Target is read-only");
    },
    deleteProperty() {
      throw new Error("Target is read-only");
    },
  });
}

function makeValidatingProxy(target, schema) {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (!(prop in schema)) throw new Error(`Unknown property: ${prop}`);
      const validator = schema[prop];
      if (validator && !validator(value)) {
        throw new Error(`Invalid value for ${prop}: ${value}`);
      }
      obj[prop] = value;
      return true;
    },
  });
}

// ---- 3. Access-control proxy (protective proxy) ----
class SecureDocument {
  constructor(content) {
    this.content = content;
  }
}
class DocumentProxy {
  constructor(doc, user) {
    this.doc = doc;
    this.user = user;
  }
  read() {
    if (this.user.role !== "admin" && this.user.role !== "editor") {
      throw new Error("Access denied");
    }
    return this.doc.content;
  }
}

// ---------------- Test cases ----------------
// Virtual proxy: heavy image not created until draw()
const img = new ImageProxy("cat.png");
console.log("proxy created, real image not yet loaded");
console.log(img.draw());
// Expected: [proxy] lazily loading cat.png  then  drawing cat.png-pixels
console.log(img.draw());
// Expected: drawing cat.png-pixels  (no second lazy-load log)

// Read-only proxy
const ro = makeReadOnlyProxy({ a: 1 });
console.log(ro.a);
// Expected: 1
try {
  ro.a = 2;
} catch (e) {
  console.log("Read-only error:", e.message);
  // Expected: Read-only error: Target is read-only
}

// Validating proxy
const person = makeValidatingProxy(
  {},
  {
    age: (v) => typeof v === "number" && v >= 0 && v < 150,
    name: (v) => typeof v === "string" && v.length > 0,
  },
);
person.name = "Alice";
person.age = 30;
console.log(person);
// Expected: { name: 'Alice', age: 30 }
try {
  person.age = -5;
} catch (e) {
  console.log("Validation error:", e.message);
  // Expected: Validation error: Invalid value for age: -5
}

// Protective proxy
const doc = new SecureDocument("top secret");
console.log(new DocumentProxy(doc, { role: "admin" }).read());
// Expected: top secret
try {
  new DocumentProxy(doc, { role: "guest" }).read();
} catch (e) {
  console.log("Access error:", e.message);
  // Expected: Access error: Access denied
}
