// 改前：支付流程里 switch 支付方式，微信/支付宝/银行卡的步骤差异全堆在一个函数里

type PayType = 'WECHAT' | 'ALIPAY' | 'CARD';

function pay(amount: number, payType: PayType): void {
  console.log(`--- 发起支付：${amount} 元 ---`);

  if (payType === 'WECHAT') {
    console.log('1. 拉起微信收银台');
    console.log('2. 用户在微信里扫码/指纹确认');
    console.log('3. 监听微信回调，校验签名');
    console.log('4. 支付成功，跳转订单页');
  } else if (payType === 'ALIPAY') {
    console.log('1. 拉起支付宝网页支付窗');
    console.log('2. 用户在支付宝里输密码确认');
    console.log('3. 监听支付宝异步通知');
    console.log('4. 支付成功，跳转订单页');
  } else if (payType === 'CARD') {
    console.log('1. 校验银行卡四要素（卡号/姓名/身份证/手机号）');
    console.log('2. 发送短信验证码');
    console.log('3. 用户输入验证码，网关扣款');
    console.log('4. 支付成功，跳转订单页');
  }

  // 问题：
  // 1. 三种支付方式的流程差异全挤在一起，加"Apple Pay"就得再塞一个分支
  // 2. 支付流程和订单逻辑耦合：订单页要自己知道每种支付方式的细节
  // 3. 无法在运行时灵活替换支付方式
}

pay(99.9, 'WECHAT');
pay(99.9, 'CARD');

export {};
