/**
 * 手写 indexedDB 封装（CRUD 操作）
 *
 * IndexedDB 特点：
 *   - 浏览器端异步事务型 NoSQL 数据库，容量大（数百 MB+）
 *   - 基于事务、对象仓库（object store）、索引
 *   - API 偏底层回调风格，封装为 Promise 更易用
 *
 * 实现思路：
 *   1. openDB：打开/创建数据库，指定版本与 store 建表逻辑
 *   2. 用 Promise 包装 IDBRequest 的 onsuccess/onerror
 *   3. CRUD：add / put / get / getAll / delete，每个操作新建事务
 *   4. Node 环境无 indexedDB，提供基于 Map 的内存 mock
 *      使封装逻辑可被测试运行（mock 不实现索引/游标，仅演示 CRUD）
 */

// ---- Node 环境兼容：内存版 mock indexedDB ----
const isBrowser = typeof window !== "undefined" && "indexedDB" in window;

function createMockIndexedDB() {
  const dbs = new Map();
  return {
    open(name, version) {
      return {
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: null,
        error: null,
        _run() {
          if (!dbs.has(name)) {
            dbs.set(name, { version, stores: {} });
          }
          const db = dbs.get(name);
          db.version = version;
          this.result = {
            name,
            version,
            objectStoreNames: { contains: (n) => n in db.stores },
            createObjectStore(storeName, opts) {
              db.stores[storeName] = {
                data: new Map(),
                keyPath: opts?.keyPath || "id",
              };
              return {
                createIndex() {},
              };
            },
            transaction(storeNames, mode) {
              const store = db.stores[storeNames[0]];
              return {
                objectStore(name) {
                  return {
                    add(value, key) {
                      const k = key ?? value[store.keyPath];
                      if (store.data.has(k)) {
                        const r = { onsuccess: null, onerror: null };
                        setTimeout(() => {
                          r.error = new Error("key exists");
                          r.onerror && r.onerror();
                        }, 0);
                        return r;
                      }
                      store.data.set(k, value);
                      const r = { onsuccess: null, onerror: null, result: key };
                      setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                      return r;
                    },
                    put(value, key) {
                      const k = key ?? value[store.keyPath];
                      store.data.set(k, value);
                      const r = { onsuccess: null, onerror: null, result: k };
                      setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                      return r;
                    },
                    get(key) {
                      const r = {
                        onsuccess: null,
                        onerror: null,
                        result: store.data.get(key) ?? null,
                      };
                      setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                      return r;
                    },
                    getAll() {
                      const r = {
                        onsuccess: null,
                        onerror: null,
                        result: [...store.data.values()],
                      };
                      setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                      return r;
                    },
                    delete(key) {
                      store.data.delete(key);
                      const r = { onsuccess: null, onerror: null };
                      setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                      return r;
                    },
                    clear() {
                      store.data.clear();
                      const r = { onsuccess: null, onerror: null };
                      setTimeout(() => r.onsuccess && r.onsuccess(), 0);
                      return r;
                    },
                  };
                },
              };
            },
          };
          setTimeout(() => {
            this.onupgradeneeded && this.onupgradeneeded({ target: this });
            this.onsuccess && this.onsuccess({ target: this });
          }, 0);
        },
      };
    },
    deleteDatabase(name) {
      dbs.delete(name);
    },
  };
}

const indexedDB = isBrowser ? window.indexedDB : createMockIndexedDB();

// ---- 封装类 ----
class IndexedDBWrapper {
  constructor(dbName, version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  // 打开数据库并执行建表升级
  open(stores = []) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        stores.forEach(({ name, keyPath, indexes = [] }) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath });
            indexes.forEach((idx) =>
              store.createIndex(idx.name, idx.keyPath, idx.options),
            );
          }
        });
      };
      req.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // 新增：key 重复会失败
  add(storeName, value, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], "readwrite");
      const req = tx.objectStore(storeName).add(value, key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // 新增或覆盖
  put(storeName, value, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], "readwrite");
      const req = tx.objectStore(storeName).put(value, key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  get(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], "readonly");
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], "readonly");
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], "readwrite");
      const req = tx.objectStore(storeName).delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  clear(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], "readwrite");
      const req = tx.objectStore(storeName).clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }
}

// ===== 测试（async IIFE，兼容 mock 的异步回调） =====
(async () => {
  const db = new IndexedDBWrapper("testDB", 1);
  await db.open([{ name: "users", keyPath: "id" }]);

  // --- Create ---
  await db.add("users", { id: 1, name: "Alice", age: 20 });
  await db.add("users", { id: 2, name: "Bob", age: 25 });
  console.log(await db.get("users", 1)); // { id: 1, name: 'Alice', age: 20 }

  // --- Update（put 覆盖） ---
  await db.put("users", { id: 1, name: "Alice2", age: 21 });
  console.log(await db.get("users", 1)); // { id: 1, name: 'Alice2', age: 21 }

  // --- Read All ---
  console.log(await db.getAll("users")); // [{ id:1,... }, { id:2,... }]

  // --- Delete ---
  await db.delete("users", 2);
  console.log(await db.get("users", 2)); // null
  console.log((await db.getAll("users")).length); // 1

  // --- Clear ---
  await db.clear("users");
  console.log((await db.getAll("users")).length); // 0

  console.log("IndexedDB CRUD 演示完成（浏览器中即真实 IndexedDB）");
})();
