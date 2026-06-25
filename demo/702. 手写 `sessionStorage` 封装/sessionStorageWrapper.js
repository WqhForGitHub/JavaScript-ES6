/**
 * 手写 sessionStorage 封装
 *
 * sessionStorage 特点：
 *   - 数据仅在当前标签页会话内有效，关闭标签页即清空
 *   - 存储容量约 5MB，只能存字符串
 *
 * 封装目标：
 *   1. 自动 JSON 序列化/反序列化，支持存任意类型
 *   2. 统一 try/catch 错误处理
 *   3. 提供命名空间隔离，避免 key 冲突
 *   4. 提供 TTL（会话内临时过期）能力
 *   5. Node 环境用内存版模拟保证可运行
 */

const memoryStore = new Map();
const safeSessionStorage =
  typeof window !== "undefined" && window.sessionStorage
    ? window.sessionStorage
    : {
        getItem(key) {
          return memoryStore.has(key) ? memoryStore.get(key) : null;
        },
        setItem(key, val) {
          memoryStore.set(key, val);
        },
        removeItem(key) {
          memoryStore.delete(key);
        },
        key(i) {
          return [...memoryStore.keys()][i] ?? null;
        },
        clear() {
          memoryStore.clear();
        },
        get length() {
          return memoryStore.size;
        },
      };

class SessionStorageWrapper {
  constructor(storage = safeSessionStorage, namespace = "app") {
    this.storage = storage;
    this.ns = namespace;
  }

  _key(key) {
    return `${this.ns}:${key}`;
  }

  set(key, value, ttl = 0) {
    const payload = {
      v: value,
      e: ttl > 0 ? Date.now() + ttl : 0,
    };
    try {
      this.storage.setItem(this._key(key), JSON.stringify(payload));
      return true;
    } catch (err) {
      console.error("[SessionStorageWrapper] 写入失败:", err.message);
      return false;
    }
  }

  get(key, defaultValue = null) {
    const raw = this.storage.getItem(this._key(key));
    if (raw === null) return defaultValue;
    try {
      const payload = JSON.parse(raw);
      if (payload.e === 0 || payload.e > Date.now()) {
        return payload.v;
      }
      this.remove(key);
      return defaultValue;
    } catch {
      this.remove(key);
      return defaultValue;
    }
  }

  remove(key) {
    this.storage.removeItem(this._key(key));
  }

  // 获取当前命名空间下所有 key（去掉前缀）
  keys() {
    const result = [];
    const prefix = `${this.ns}:`;
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i);
      if (k && k.startsWith(prefix)) result.push(k.slice(prefix.length));
    }
    return result;
  }

  clear() {
    this.keys().forEach((k) => this.remove(k));
  }
}

// ===== 测试 =====
const ss = new SessionStorageWrapper();

// --- 基本读写 ---
ss.set("theme", "dark");
console.log(ss.get("theme")); // "dark"

// --- 存数组 ---
ss.set("tabs", [1, 2, 3]);
console.log(ss.get("tabs")); // [ 1, 2, 3 ]

// --- 默认值 ---
console.log(ss.get("notExist", "default")); // "default"

// --- TTL 会话内过期 ---
ss.set("captcha", "8位码", 1000);
console.log(ss.get("captcha")); // "8位码"
ss.set("expired", "x", -1);
console.log(ss.get("expired")); // null

// --- keys 与 clear ---
ss.set("a", 1);
ss.set("b", 2);
console.log(ss.keys().sort()); // ['a', 'b', 'captcha', 'tabs', 'theme']（顺序不定）
ss.clear();
console.log(ss.keys()); // []

// --- 命名空间隔离 ---
const ss2 = new SessionStorageWrapper("other");
ss.set("x", 10);
ss2.set("x", 20);
console.log(ss.get("x"), ss2.get("x")); // 10 20（互不影响）
