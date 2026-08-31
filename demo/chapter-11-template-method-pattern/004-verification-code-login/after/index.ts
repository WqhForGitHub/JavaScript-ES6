// 改后：模板方法模式 -- 登录骨架固定在基类，子类只实现「怎么发送」，钩子控制免登录时长

// 模拟环境：验证码缓存、会话
const codeCache = new Map<string, string>();
let session: string | null = null;

// 演示环境用固定规则生成验证码（账号后 6 位），便于写出「正确的输入」
function makeCode(account: string): string {
  return account.slice(-6);
}

// ========== 抽象基类：验证码登录骨架 ==========
abstract class VerificationLogin {
  // 模板方法：生成 -> 发送 -> 校验 -> 建会话，四步顺序全通道统一
  login(account: string, input: string): void {
    const code = makeCode(account);
    codeCache.set(account, code);
    this.sendCode(account, code); // 差异点：走哪个通道由子类决定
    if (input !== codeCache.get(account)) {
      console.log('验证码错误，登录失败');
      return;
    }
    // 钩子：会话时长由子类决定，默认 7 天
    session = `session(${account}，有效期 ${this.sessionDays()} 天)`;
    console.log(`登录成功：${session}`);
  }

  // 差异步骤：怎么把验证码送到用户手上
  protected abstract sendCode(account: string, code: string): void;

  // 钩子方法：默认 7 天，子类按需覆写
  protected sessionDays(): number {
    return 7;
  }
}

// ========== 子类：短信登录，只写发送方式 ==========
class PhoneLogin extends VerificationLogin {
  protected sendCode(account: string, code: string): void {
    console.log(`【短信通道】发送到 ${account}：您的验证码是 ${code}`);
  }
}

// ========== 子类：邮箱登录 + 覆写钩子（信任设备 30 天免登录） ==========
class EmailLogin extends VerificationLogin {
  protected sendCode(account: string, code: string): void {
    console.log(`【邮件通道】发送到 ${account}：您的验证码是 ${code}`);
  }

  protected sessionDays(): number {
    return 30;
  }
}

console.log('--- 手机号登录（输对验证码，默认 7 天会话）---');
new PhoneLogin().login('13800001111', '001111');

console.log('--- 手机号登录（输错验证码）---');
new PhoneLogin().login('13800002222', '000000');

console.log('--- 邮箱登录（输对验证码，钩子改成 30 天）---');
new EmailLogin().login('dev@example.com', 'le.com');

// 优势：
// 1. 校验、建会话等公共步骤只在骨架里出现一次，安全规则升级只改基类
// 2. 子类只填「怎么发送」一个空，新增微信扫码登录零复制
// 3. 钩子方法把「会话时长」变成子类可选项，不用为时长差异写分支

export {};
