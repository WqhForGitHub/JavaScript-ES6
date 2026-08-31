// 改前：短信登录和邮箱登录各写一套，生成验证码、校验、建会话全是重复代码

// 模拟环境：验证码缓存、会话
const codeCache = new Map<string, string>();
let session: string | null = null;

// 演示环境用固定规则生成验证码（账号后 6 位），便于写出「正确的输入」
function makeCode(account: string): string {
  return account.slice(-6);
}

// ========== 短信验证码登录：完整流程第一遍 ==========
function loginByPhone(phone: string, input: string): void {
  // 1. 生成验证码
  const code = makeCode(phone);
  codeCache.set(phone, code);
  // 2. 发送（差异点）
  console.log(`【短信通道】发送到 ${phone}：您的验证码是 ${code}`);
  // 3. 校验
  if (input !== codeCache.get(phone)) {
    console.log('验证码错误，登录失败');
    return;
  }
  // 4. 建会话
  session = `session(${phone}，有效期 7 天)`;
  console.log(`登录成功：${session}`);
}

// ========== 邮箱验证码登录：流程又抄一遍 ==========
function loginByEmail(email: string, input: string): void {
  const code = makeCode(email); // 一模一样
  codeCache.set(email, code);
  console.log(`【邮件通道】发送到 ${email}：您的验证码是 ${code}`); // 差异点
  if (input !== codeCache.get(email)) {
    // 一模一样
    console.log('验证码错误，登录失败');
    return;
  }
  session = `session(${email}，有效期 30 天)`; // 只有天数不同
  console.log(`登录成功：${session}`);
}

console.log('--- 手机号登录（输对验证码）---');
loginByPhone('13800001111', '001111'); // 尾号 001111

console.log('--- 手机号登录（输错验证码）---');
loginByPhone('13800002222', '000000');

console.log('--- 邮箱登录（输对验证码）---');
loginByEmail('dev@example.com', 'le.com'); // 尾 6 位 le.com

// 问题：
// 1. 生成验证码、校验、建会话这些公共步骤，每个登录通道都要抄一遍
// 2. 校验规则升级（比如验证码 5 分钟过期、限制尝试次数），每个通道函数挨个改
// 3. 新增微信扫码登录？把整套流程再抄第三遍，抄漏一步就是安全漏洞

export {};
