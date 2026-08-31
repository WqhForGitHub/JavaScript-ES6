// 改前：注册服务把阿里云短信 SDK 焊死在代码里，每跑一次单元测试就真发一条短信，月底看到短信账单人直接麻了

// ========== 阿里云短信 SDK：厂商专有的方法签名 ==========
class AliyunSmsClient {
  constructor(private signName: string) {}

  // 厂商专有：参数顺序、模板结构都是阿里云说了算
  sendSmsRequest(phone: string, templateCode: string, params: Record<string, string>): void {
    console.log(
      `[阿里云短信] 签名「${this.signName}」发送到 ${phone}，模板 ${templateCode}，参数 ${JSON.stringify(params)}`,
    );
  }
}

// ========== 注册服务：直接 new、直接调厂商方法 ==========
class RegisterService {
  private smsClient = new AliyunSmsClient('某商城');

  sendRegisterCode(phone: string): void {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    // 验证码模板 ID、厂商参数结构这些细节全部写死在业务代码里
    this.smsClient.sendSmsRequest(phone, 'SMS_10086', { code });
    console.log(`已向 ${phone} 发送注册验证码`);
  }
}

const service = new RegisterService();
service.sendRegisterCode('13800001111'); // 每跑一次单测，真金白银 -0.045 元

// 问题：
// 1. RegisterService 焊死了阿里云：换腾讯云短信、或新增邮箱验证码，都得改注册服务本身
// 2. 单元测试无法离线跑：每测一次发送验证码就真发一条短信，又慢又烧钱
// 3. 短信模板 ID、厂商参数结构等细节泄漏进业务代码
// 4. 测试里没法断言"验证码确实被发送过"，只能靠人肉看日志

export {};
