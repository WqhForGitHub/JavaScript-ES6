// 第04章：单例模式 - 003：数据库连接池
//
// 场景：建立数据库连接非常昂贵（TCP 握手、身份认证、分配内存），
// 所以要用「连接池」复用连接；而整个应用只应该有一个池子，
// 如果各模块各建各的池，连接数会迅速失控，把数据库打挂。

interface Connection {
  id: number;
  query: (sql: string) => string;
}

class ConnectionPool {
  private static instance: ConnectionPool | null = null;

  private readonly maxSize: number;
  private idle: Connection[] = [];
  private inUse = new Set<Connection>();
  private waiters: Array<(conn: Connection) => void> = [];
  private nextId = 1;

  private constructor(maxSize = 3) {
    this.maxSize = maxSize;
  }

  // 参数只在第一次创建实例时生效，之后再传会被忽略（单例的典型行为）
  static getInstance(maxSize?: number): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(maxSize);
    }
    return ConnectionPool.instance;
  }

  private createConnection(): Connection {
    const id = this.nextId++;
    console.log(`  （池子扩容：创建新连接 #${id}）`);
    return {
      id,
      query: (sql: string) => `连接#${id} 执行「${sql}」`,
    };
  }

  async acquire(): Promise<Connection> {
    // 1. 有空闲连接，直接复用（这就是连接池的意义）
    const conn = this.idle.pop();
    if (conn) {
      this.inUse.add(conn);
      return conn;
    }
    // 2. 池子还没满，创建新连接
    if (this.inUse.size < this.maxSize) {
      const newConn = this.createConnection();
      this.inUse.add(newConn);
      return newConn;
    }
    // 3. 池子满了，排队等待别人释放
    console.log('  （池子已满，排队等待空闲连接...）');
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  release(conn: Connection): void {
    this.inUse.delete(conn);
    const waiter = this.waiters.shift();
    if (waiter) {
      // 直接把连接交给等待者，不用先放回池子
      this.inUse.add(conn);
      waiter(conn);
    } else {
      this.idle.push(conn);
    }
  }

  status(): { inUse: number; idle: number; waiting: number } {
    return {
      inUse: this.inUse.size,
      idle: this.idle.length,
      waiting: this.waiters.length,
    };
  }
}

// ============================================================
// 使用演示
// ============================================================

async function main() {
  const poolA = ConnectionPool.getInstance(3);
  const poolB = ConnectionPool.getInstance(); // 拿到的是同一个池子

  console.log('两个引用是否是同一个连接池：', poolA === poolB); // true

  console.log('\n--- 并发执行 4 条查询（池子上限 3）---');
  const sqls = ['SELECT 1', 'SELECT 2', 'SELECT 3', 'SELECT 4'];
  const tasks = sqls.map(async (sql, i) => {
    const conn = await poolA.acquire();
    console.log(`任务${i + 1}: ${conn.query(sql)}`);
    // 模拟查询耗时
    await new Promise((r) => setTimeout(r, 100));
    poolA.release(conn);
  });

  await Promise.all(tasks);

  console.log('\n所有查询结束，池子状态：', poolB.status()); // inUse: 0, idle: 3
}

main();

export {};
