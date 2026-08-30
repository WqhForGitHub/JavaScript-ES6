// 改后：接口和面向接口编程 -- 定义 CodeSender 接口，注册服务只依赖接口，真实渠道和测试替身都从构造函数注入

// ========== 接口：约定"验证码发送器"必须会什么 ==========
interface CodeSender {
  send(phone: string, code: string): void;
}

// ========== 实现一：阿里云短信（生产用），厂商细节被关进实现内部 ==========
class AliyunSmsSender implements CodeSender {
  send(phone: string, code: string): void {
    console.log(`[阿里云短信] 发送到 ${phone}，模板 SMS_10086，参数 {"code":"${code}"}`);
  }
}

// ========== 实现二：邮箱验证码（新增渠道，注册服务一行不改） ==========
class EmailCodeSender implements CodeSender {
  send(phone: string, code: string): void {
    console.log(`[邮箱] 发到 ${phone} 绑定的邮箱，验证码 ${code}`);
  }
}

// ========== 实现三：测试替身（单测用，不花一分钱） ==========
class FakeCodeSender implements CodeSender {
  sentCodes: Array<{ phone: string; code: string }> = [];

  send(phone: string, code: string): void {
    this.sentCodes.push({ phone, code }); // 只记录，不真发
  }
}

// ========== 注册服务：只认识 CodeSender 接口，发送器从构造函数注入 ==========
class RegisterService {
  constructor(private codeSender: CodeSender) {}

  sendRegisterCode(phone: string): string {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    // 只调用接口约定好的 send 方法，管你是短信还是邮箱
    this.codeSender.send(phone, code);
    console.log(`已向 ${phone} 发送注册验证码`);
    return code;
  }
}

// 生产环境：注入真实短信渠道
console.log('--- 生产：阿里云短信 ---');
const prodService = new RegisterService(new AliyunSmsSender());
prodService.sendRegisterCode('13800001111');

// 新渠道上线：邮箱验证码，注册服务零修改
console.log('--- 新渠道：邮箱验证码 ---');
const emailService = new RegisterService(new EmailCodeSender());
emailService.sendRegisterCode('13900002222');

// 单元测试：注入替身，离线运行还能断言
console.log('--- 单元测试：替身不发真短信 ---');
const fake = new FakeCodeSender();
const testService = new RegisterService(fake);
testService.sendRegisterCode('13800001111');
console.log(`断言：共发送 ${fake.sentCodes.length} 条，手机号 ${fake.sentCodes[0].phone}`);

// 优势：
// 1. 注册服务只依赖 CodeSender 接口，模板 ID、厂商参数结构等细节被关进实现类
// 2. 新增渠道 = 新写一个实现类注入进来，注册服务一行不改
// 3. 单元测试注入替身：不联网、不花钱、可断言，跑一万次也免费
// 4. 接口就是给协作者的承诺："只要你能 send(phone, code)，我就能用你"

export {};
