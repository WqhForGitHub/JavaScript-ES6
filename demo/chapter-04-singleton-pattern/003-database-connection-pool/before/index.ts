// 改前：每个请求都新建数据库连接，握手开销巨大，连接数很快被打爆
class DBConnection {
  constructor() {
    // 建立连接 = TCP 三次握手 + 身份认证，是昂贵操作
    console.log('【新建连接】connect db...（模拟耗时 100ms）');
  }

  query(sql: string) {
    console.log(`执行 SQL：${sql}`);
  }
}

// 3 个请求并发进来
for (let i = 1; i <= 3; i++) {
  const conn = new DBConnection(); // ❌ 每个请求都建一条新连接
  conn.query(`SELECT * FROM orders WHERE user_id = ${i}`);
}
// 数据库：连接数被无谓地占满，新请求开始排队甚至被拒绝

export {};
