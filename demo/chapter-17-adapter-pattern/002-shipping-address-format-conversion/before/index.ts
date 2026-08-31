// 改前：老接口返回"按下标取值"的数组，每个页面都手动拆下标，字段顺序一变全线翻车

// ========== 老系统用户接口：返回数组 [姓名, 省份, 城市, 区县] ==========
function getUserFromOldApi(userId: string): string[] {
  console.log(`（请求老接口 /user?id=${userId}）`);
  // 老接口不敢动：还有十几个没改造的老页面在直接消费这个数组
  return ['张三', '广东省', '广州市', '天河区'];
}

// ========== 页面 A：收货地址栏，人肉拆下标 ==========
function renderAddressBar(userId: string): void {
  const user = getUserFromOldApi(userId);
  console.log(`收货地址：${user[1]} ${user[2]} ${user[3]}`); // 1、2、3 分别是什么全靠人肉记
}

// ========== 页面 B：用户名片，又拆了一遍下标 ==========
function renderProfileCard(userId: string): void {
  const user = getUserFromOldApi(userId);
  console.log(`姓名：${user[0]}`);
  console.log(`所在城市：${user[2]}`);
}

// ========== 页面 C：快递面单打印，再拆一遍 ==========
function renderShippingLabel(userId: string): void {
  const user = getUserFromOldApi(userId);
  console.log(`寄送至：${user[1]}${user[2]}${user[3]}（收件人：${user[0]}）`);
}

renderAddressBar('u_1001');
renderProfileCard('u_1001');
renderShippingLabel('u_1001');

// 问题：
// 1. user[0]、user[1] 这类"下标魔法数字"散落各页面，读代码全靠背字段顺序
// 2. 拆解逻辑在 N 个页面重复了 N 遍，纯属复制粘贴
// 3. 老接口若在数组头部插入"用户ID"，所有页面的下标集体错位，一个都跑不掉
// 4. 页面拿不到稳定的对象结构，享受不到类型检查，重构和测试都无从下手

export {};
