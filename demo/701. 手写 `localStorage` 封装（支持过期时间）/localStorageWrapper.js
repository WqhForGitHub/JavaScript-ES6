/**
 * 手写 localStorage 封装（支持过期时间）
 *
 * 原生 localStorage 的痛点：
 *   - 只能存字符串（需手动 JSON 序列化）
 *   - 没有过期时间机制，数据永久驻留
 *   - 读取/写入失败时直接抛错，没有统一错误处理
 *
 * 实现思路：
 *   1. 用一个包装对象 { value, expire } 存储原始值与过期时间戳
 *   2. set 时记录 expire（绝对时间戳），get 时判断是否过期
 *   3. 过期数据自动删除并返回 null
 *   4. 统一 try/catch 处理序列化异常与 QuotaExceededError
 *   5. Node 环境无 localStorage，使用内存模拟（Map）保证可运行
 */

// ---- 兼容 Node 环境：没有 window.localStorage 时用内存版 ----
const memoryStore = new Map();
const safeStorage =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage
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

class LocalStorageWrapper {
  constructor(storage = safeStorage) {
    this.storage = storage;
    // 命名空间前缀，避免与业务 key 冲突
    this.prefix = "__ls_wrap__";
  }

  // 生成带前缀的真实 key
  _key(key) {
    return this.prefix + key;
  }

  /**
   * 写入数据
   * @param {string} key 键名
   * @param {*} value 任意可序列化值
   * @param {number} expire 过期毫秒数（0 或不传表示永久）
   */
  set(key, value, expire = 0) {
    const data = {
      value,
      // expire 为绝对时间戳；0 表示不过期
      expire: expire > 0 ? Date.now() + expire : 0,
    };
    try {
      this.storage.setItem(this._key(key), JSON.stringify(data));
      return true;
    } catch (e) {
      // 可能是序列化失败（含函数/Symbol）或超出配额
      console.error("[LocalStorageWrapper] set 失败:", e.message);
      return false;
    }
  }

  /**
   * 读取数据，过期返回 null 并清理
   */
  get(key) {
    const raw = this.storage.getItem(this._key(key));
    if (raw === null) return null;

    try {
      const data = JSON.parse(raw);
      // 未设置过期 或 还没过期
      if (data.expire === 0 || data.expire > Date.now()) {
        return data.value;
      }
      // 已过期：清理后返回 null
      this.remove(key);
      return null;
    } catch (e) {
      // 数据被外部破坏，直接清理
      this.remove(key);
      return null;
    }
  }

  // 删除单个 key
  remove(key) {
    this.storage.removeItem(this._key(key));
  }

  // 清空当前命名空间下所有 key
  clear() {
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i);
      if (k && k.startsWith(this.prefix)) keys.push(k);
    }
    keys.forEach((k) => this.storage.removeItem(k));
  }

  // 是否存在且未过期
  has(key) {
    return this.get(key) !== null;
  }
}

// ===== 测试 =====
const ls = new LocalStorageWrapper();

// --- 普通读写 ---
ls.set("name", "Alice");
console.log(ls.get("name")); // "Alice"

// --- 存对象（自动序列化） ---
ls.set("user", { id: 1, roles: ["admin"] });
console.log(ls.get("user")); // { id: 1, roles: [ 'admin' ] }

// --- 过期时间：写入后立即读有值 ---
ls.set("token", "abc123", 1000);
console.log(ls.get("token")); // "abc123"

// --- 过期时间：模拟过期后读取 ---
// 直接注入一个过期时间戳为过去时间的记录
ls.set("temp", "data", 1000);
const rawTemp = JSON.parse(safeStorage.getItem(ls._key("temp")));
rawTemp.expire = Date.now() - 1000; // 手动改成已过期
safeStorage.setItem(ls._key("temp"), JSON.stringify(rawTemp));
console.log(ls.get("temp")); // null（已过期自动清理）
console.log(ls.has("temp")); // false

// --- 永久数据 expire 为 0 ---
ls.set("forever", 42);
const stored = JSON.parse(safeStorage.getItem(ls._key("forever")));
console.log(stored.expire); // 0（表示不过期）

// --- has 与 remove ---
console.log(ls.has("name")); // true
ls.remove("name");
console.log(ls.has("name")); // false
console.log(ls.get("name")); // null

// --- clear 只清当前命名空间 ---
ls.set("a", 1);
ls.set("b", 2);
ls.clear();
console.log(ls.get("a"), ls.get("b")); // null null

// --- 错误处理：循环引用会导致序列化失败 ---
const cyclic = { self: null };
cyclic.self = cyclic;
const ok = ls.set("cyclic", cyclic);
console.log(ok); // false（序列化失败被 try/catch 捕获）
