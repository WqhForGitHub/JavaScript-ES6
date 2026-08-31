// 改前：通知服务用 if/else 区分发送渠道，每接一个新渠道都要改动这个被订单、物流、营销共同调用的方法

// ========== 通知内容 ==========
interface Notification {
  userId: string;
  title: string;
  content: string;
}

// ========== 通知服务：所有业务都经它发消息 ==========
class NotificationService {
  send(channel: string, notification: Notification): void {
    if (channel === 'sms') {
      console.log(`[短信] 发给 ${notification.userId}：${notification.content}`);
    } else if (channel === 'email') {
      console.log(
        `[邮件] 发给 ${notification.userId}：${notification.title} - ${notification.content}`,
      );
    } else if (channel === 'appPush') {
      console.log(`[App 推送] 发给 ${notification.userId}：${notification.title}`);
    } else {
      throw new Error(`不支持的发送渠道: ${channel}`);
    }
    // 接入钉钉、企业微信时，只能回到这段 if/else 里继续插分支
  }
}

const service = new NotificationService();

// 订单发货后，同一份通知要发往多个渠道
const orderShipped: Notification = {
  userId: 'U-1001',
  title: '您的订单已发货',
  content: '顺丰 SF1234567890，预计明日送达',
};

service.send('sms', orderShipped);
service.send('email', orderShipped);
service.send('appPush', orderShipped);

// 问题：
// 1. 每接一个新渠道都要修改 send 方法，被订单、物流、营销三个模块共用的稳定代码被迫反复动刀
// 2. 短信模板要加签名、推送要带角标计数，这类"渠道个性需求"会把 if/else 撑成大杂烩
// 3. 各分支挤在同一个方法体里，改邮件分支时手滑碰坏短信分支，全渠道一起瘫痪
// 4. 想单独测试新接入的钉钉渠道，得先把它插进 send，再连带跑过所有渠道分支

export {};
