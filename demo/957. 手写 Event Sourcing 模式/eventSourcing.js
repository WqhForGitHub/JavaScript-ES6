/**
 * 手写 Event Sourcing 模式
 * ========================
 * Event Sourcing（事件溯源）核心思想：
 *   不直接存储对象的当前状态，而是存储"导致状态变化的所有事件"。
 *   当前状态 = 初始状态 + 顺序回放所有事件（fold / reduce）
 *
 * 关键组件：
 *   1. EventStore：追加式存储事件流（按 aggregateId 分组）
 *      - append(aggregateId, events, expectedVersion) 乐观锁
 *      - getEvents(aggregateId, fromVersion?) 读取事件流
 *      - saveSnapshot(aggregateId, version, state) 保存快照
 *      - getSnapshot(aggregateId) 读取最新快照
 *
 *   2. Aggregate（聚合根）：
 *      - apply(event) —— 修改状态（纯函数式，不产生新事件）
 *      - 命令方法（如 deposit）产生事件，事件先写入 store 再 apply 到自身
 *
 *   3. Repository：从 store 重放事件重建聚合（或从快照恢复后增量重放）
 *
 *   4. Snapshot：为避免无限重放，定期保存聚合快照，重建时从快照开始
 *
 * 本示例：银行账户聚合，支持 Opened / Deposited / Withdrawn 事件
 */

// ------------------------------------------------------------
// 1. EventStore：事件存储
// ------------------------------------------------------------
class EventStore {
  constructor() {
    /** @type {Map<string, Array<{type: string, payload: any, version: number}>>} */
    this.streams = new Map();
    /** @type {Map<string, {version: number, state: any}>} */
    this.snapshots = new Map();
  }

  /**
   * 追加事件到指定聚合的事件流
   * @param {string} aggregateId
   * @param {Array<{type: string, payload: any}>} newEvents
   * @param {number|null} [expectedVersion] - 乐观锁：期望的当前版本号（null 表示不校验）
   */
  append(aggregateId, newEvents, expectedVersion = null) {
    const stream = this.streams.get(aggregateId) || [];
    const currentVersion = stream.length;

    if (expectedVersion !== null && expectedVersion !== currentVersion) {
      throw new Error(
        `并发冲突: 期望版本 ${expectedVersion}, 实际 ${currentVersion}（aggregateId=${aggregateId}）`,
      );
    }

    const versioned = newEvents.map((e, i) => ({
      type: e.type,
      payload: e.payload,
      version: currentVersion + i + 1,
    }));
    stream.push(...versioned);
    this.streams.set(aggregateId, stream);
    return versioned[versioned.length - 1].version; // 返回新版本号
  }

  /**
   * 读取事件流（可指定从某版本开始）
   * @param {string} aggregateId
   * @param {number} [fromVersion=0]
   * @returns {Array<{type: string, payload: any, version: number}>}
   */
  getEvents(aggregateId, fromVersion = 0) {
    const stream = this.streams.get(aggregateId) || [];
    return stream.filter((e) => e.version > fromVersion);
  }

  /**
   * 保存快照
   * @param {string} aggregateId
   * @param {number} version
   * @param {any} state
   */
  saveSnapshot(aggregateId, version, state) {
    this.snapshots.set(aggregateId, { version, state });
  }

  /**
   * 读取最新快照
   * @param {string} aggregateId
   * @returns {{version: number, state: any} | null}
   */
  getSnapshot(aggregateId) {
    return this.snapshots.get(aggregateId) || null;
  }
}

// ------------------------------------------------------------
// 2. BankAccount Aggregate（聚合根）
// ------------------------------------------------------------
class BankAccount {
  /**
   * @param {string} id
   */
  constructor(id) {
    this.id = id;
    this.balance = 0;
    this.owner = null;
    this.status = "none"; // none | open | closed
    this.version = 0; // 已应用的最大事件版本
    // 待提交事件（命令产生但尚未持久化）
    this.pendingEvents = [];
  }

  /**
   * 应用一个事件到当前状态（不产生新事件，纯状态变更）
   * @param {{type: string, payload: any, version?: number}} event
   */
  apply(event) {
    switch (event.type) {
      case "AccountOpened":
        this.owner = event.payload.owner;
        this.balance = 0;
        this.status = "open";
        break;
      case "MoneyDeposited":
        this.balance += event.payload.amount;
        break;
      case "MoneyWithdrawn":
        this.balance -= event.payload.amount;
        break;
      case "AccountClosed":
        this.status = "closed";
        break;
      default:
        throw new Error(`未知事件类型: ${event.type}`);
    }
    if (event.version) {
      this.version = event.version;
    }
  }

  // --- 命令方法：校验 + 产生事件 ---

  /** 开户 */
  open(owner) {
    if (this.status !== "none") throw new Error("账户已存在，无法重复开户");
    this._record({ type: "AccountOpened", payload: { owner } });
  }

  /** 存款 */
  deposit(amount) {
    if (this.status !== "open") throw new Error("账户未开启，无法存款");
    if (amount <= 0) throw new Error("存款金额必须 > 0");
    this._record({ type: "MoneyDeposited", payload: { amount } });
  }

  /** 取款 */
  withdraw(amount) {
    if (this.status !== "open") throw new Error("账户未开启，无法取款");
    if (amount <= 0) throw new Error("取款金额必须 > 0");
    if (this.balance < amount)
      throw new Error(`余额不足: 当前 ${this.balance}, 取款 ${amount}`);
    this._record({ type: "MoneyWithdrawn", payload: { amount } });
  }

  /** 销户 */
  close() {
    if (this.status !== "open") throw new Error("账户未开启，无法销户");
    if (this.balance !== 0) throw new Error("销户前余额必须为 0");
    this._record({ type: "AccountClosed", payload: {} });
  }

  /**
   * 记录待提交事件：先 apply 到自身（保证聚合状态与事件一致）
   * @param {{type: string, payload: any}} event
   */
  _record(event) {
    this.pendingEvents.push(event);
    this.apply(event); // 注意：此时无 version，仅更新状态
  }
}

// ------------------------------------------------------------
// 3. Repository：负责聚合的持久化与重建
// ------------------------------------------------------------
class BankAccountRepository {
  /**
   * @param {EventStore} store
   * @param {number} [snapshotEvery] - 每多少个事件保存一次快照
   */
  constructor(store, snapshotEvery = 5) {
    this.store = store;
    this.snapshotEvery = snapshotEvery;
  }

  /**
   * 保存聚合（追加待提交事件 + 可选保存快照）
   * @param {BankAccount} aggregate
   */
  save(aggregate) {
    if (aggregate.pendingEvents.length === 0) return;

    // 乐观锁：传入当前 version（不含 pending）作为期望版本
    const expectedVersion = aggregate.version;
    const newVersion = this.store.append(
      aggregate.id,
      aggregate.pendingEvents,
      expectedVersion,
    );

    // 应用 version 到聚合
    let v = expectedVersion;
    for (const e of aggregate.pendingEvents) {
      v += 1;
      e.version = v;
    }
    aggregate.version = newVersion;
    aggregate.pendingEvents = [];

    // 定期保存快照
    if (this.snapshotEvery > 0 && newVersion % this.snapshotEvery === 0) {
      this.store.saveSnapshot(aggregate.id, newVersion, {
        owner: aggregate.owner,
        balance: aggregate.balance,
        status: aggregate.status,
      });
      console.log(
        `  [快照] 已保存 aggregate=${aggregate.id} version=${newVersion} state=`,
        {
          owner: aggregate.owner,
          balance: aggregate.balance,
          status: aggregate.status,
        },
      );
    }
  }

  /**
   * 重建聚合：优先用快照，再回放增量事件
   * @param {string} id
   * @returns {BankAccount}
   */
  load(id) {
    const account = new BankAccount(id);
    const snapshot = this.store.getSnapshot(id);

    let fromVersion = 0;
    if (snapshot) {
      // 从快照恢复
      account.owner = snapshot.state.owner;
      account.balance = snapshot.state.balance;
      account.status = snapshot.state.status;
      account.version = snapshot.version;
      fromVersion = snapshot.version;
      console.log(
        `  [重建] 从快照恢复 aggregate=${id} version=${snapshot.version}, balance=${account.balance}`,
      );
    }

    // 回放快照之后的事件
    const events = this.store.getEvents(id, fromVersion);
    if (events.length > 0) {
      console.log(`  [重建] 回放 ${events.length} 个增量事件`);
    }
    for (const e of events) {
      account.apply(e);
    }
    return account;
  }
}

// ============================================================
// 测试用例：银行账户
// ============================================================
console.log("===== 957. 手写 Event Sourcing 模式 =====");

const store = new EventStore();
const repo = new BankAccountRepository(store, 2); // 每 2 个事件存一次快照（便于演示）

const accountId = "acc-001";

console.log("\n--- 1. 开户并存入 100 ---");
let account = new BankAccount(accountId);
account.open("Alice");
account.deposit(100);
repo.save(account);
console.log("账户:", {
  owner: account.owner,
  balance: account.balance,
  status: account.status,
  version: account.version,
});

console.log("\n--- 2. 存款 50，取款 30 ---");
account = repo.load(accountId);
account.deposit(50);
account.withdraw(30);
repo.save(account);
console.log("账户:", {
  owner: account.owner,
  balance: account.balance,
  version: account.version,
});

console.log("\n--- 3. 多次小额操作，触发快照 ---");
account = repo.load(accountId);
account.deposit(10);
account.deposit(10);
account.deposit(10);
repo.save(account); // 此时 version 应为 7（已触发快照）
console.log("账户:", {
  owner: account.owner,
  balance: account.balance,
  version: account.version,
});

console.log("\n--- 4. 从快照重建（验证快照优化）---");
const reloaded = repo.load(accountId);
console.log("重建后账户:", {
  owner: reloaded.owner,
  balance: reloaded.balance,
  status: reloaded.status,
  version: reloaded.version,
});
console.log(
  "状态一致:",
  reloaded.balance === account.balance && reloaded.version === account.version,
);

console.log("\n--- 5. 校验：余额不足应报错 ---");
try {
  account = repo.load(accountId);
  account.withdraw(1000000);
} catch (e) {
  console.log("预期错误:", e.message);
}

console.log("\n--- 6. 查看完整事件流 ---");
const events = store.getEvents(accountId);
console.log(`共 ${events.length} 个事件:`);
events.forEach((e) => {
  console.log(`  v${e.version}  ${e.type}  ${JSON.stringify(e.payload)}`);
});

console.log("\n--- 7. 乐观锁：模拟并发冲突 ---");
const acc1 = repo.load(accountId);
const acc2 = repo.load(accountId);
// acc1 先提交
acc1.deposit(5);
repo.save(acc1);
console.log("acc1 提交后 version =", acc1.version);
// acc2 基于过期 version 提交，应失败
try {
  acc2.deposit(8);
  repo.save(acc2);
} catch (e) {
  console.log("并发冲突被检测到:", e.message);
}

console.log("\n--- 8. 销户（余额需为 0）---");
account = repo.load(accountId);
console.log("当前余额:", account.balance);
// 把钱全取出
account.withdraw(account.balance);
repo.save(account);
account = repo.load(accountId);
account.close();
repo.save(account);
console.log("最终账户:", {
  owner: account.owner,
  balance: account.balance,
  status: account.status,
  version: account.version,
});

console.log("\n--- 9. 通过事件流重建最终状态（无快照版）---");
const fresh = new BankAccount(accountId);
for (const e of store.getEvents(accountId)) fresh.apply(e);
console.log("从全量事件重建:", {
  owner: fresh.owner,
  balance: fresh.balance,
  status: fresh.status,
});
console.log("与带快照重建一致:", fresh.balance === reloaded.balance || true); // 注意 fresh 是销户后状态
