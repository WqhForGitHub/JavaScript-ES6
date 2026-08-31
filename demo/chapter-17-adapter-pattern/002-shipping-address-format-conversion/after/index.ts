// 改后：适配器模式 -- 用一个"数据翻译官"把老接口的数组翻译成对象，页面从此只碰字段名、不碰下标

// ========== 老系统接口：保持原样，一行不改 ==========
function getUserFromOldApi(userId: string): string[] {
  console.log(`（请求老接口 /user?id=${userId}）`);
  return ['张三', '广东省', '广州市', '天河区'];
}

// ========== 目标结构：业务代码期望的用户长什么样（字段名一目了然） ==========
interface UserProfile {
  name: string;
  province: string;
  city: string;
  district: string;
}

// ========== 适配器："下标 -> 字段名"的翻译只存在这一处 ==========
function getUser(userId: string): UserProfile {
  const [name, province, city, district] = getUserFromOldApi(userId);
  return { name, province, city, district };
}

// ========== 页面 A：收货地址栏 ==========
function renderAddressBar(userId: string): void {
  const user = getUser(userId);
  console.log(`收货地址：${user.province} ${user.city} ${user.district}`);
}

// ========== 页面 B：用户名片 ==========
function renderProfileCard(userId: string): void {
  const user = getUser(userId);
  console.log(`姓名：${user.name}`);
  console.log(`所在城市：${user.city}`);
}

// ========== 页面 C：快递面单打印 ==========
function renderShippingLabel(userId: string): void {
  const user = getUser(userId);
  console.log(`寄送至：${user.province}${user.city}${user.district}（收件人：${user.name}）`);
}

renderAddressBar('u_1001');
renderProfileCard('u_1001');
renderShippingLabel('u_1001');

// ========== 接口升级：老接口 v2 在数组头部插入了用户ID，只需改适配器一处 ==========
function getUserFromOldApiV2(userId: string): string[] {
  console.log(`（请求老接口 v2 /user?id=${userId}）`);
  return [userId, '张三', '广东省', '广州市', '天河区']; // 头部多了一个 userId
}

function getUserV2(userId: string): UserProfile {
  const [, name, province, city, district] = getUserFromOldApiV2(userId); // 跳过第 0 位即可
  return { name, province, city, district };
}

function renderAddressBarV2(userId: string): void {
  const user = getUserV2(userId);
  console.log(`收货地址：${user.province} ${user.city} ${user.district}`);
}

renderAddressBarV2('u_1001'); // 页面输出格式不变，页面代码也不用变

// 优势：
// 1. 页面里只剩 user.name、user.province 等字段名，下标魔法数字绝迹
// 2. "数组转对象"的翻译逻辑只存在适配器一处，不再复制 N 遍
// 3. 接口字段顺序调整只改适配器一行（v2 升级即是证明），页面代码零改动
// 4. UserProfile 成为页面与接口之间的契约，字段拼错直接被类型检查拦下

export {};
