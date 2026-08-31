// 改后：开放-封闭原则 -- 每个渠道一个独立的发送器对象，通知服务只负责查表转发，新渠道注册即可接入

// ========== 通知内容 ==========
interface Notification {
  userId: string;
  title: string;
  content: string;
}

// ========== 发送器接口：所有渠道长一个样，天然可互相替换 ==========
interface ChannelSender {
  send(notification: Notification): void;
}

class SmsSender implements ChannelSender {
  send(notification: Notification): void {
    console.log(`[短信] 发给 ${notification.userId}：${notification.content}`);
  }
}

class EmailSender implements ChannelSender {
  send(notification: Notification): void {
    console.log(
      `[邮件] 发给 ${notification.userId}：${notification.title} - ${notification.content}`,
    );
  }
}

class AppPushSender implements ChannelSender {
  send(notification: Notification): void {
    console.log(`[App 推送] 发给 ${notification.userId}：${notification.title}`);
  }
}

// ========== 渠道注册表：渠道名 -> 发送器 ==========
const senderRegistry = new Map<string, ChannelSender>();

function registerSender(channel: string, sender: ChannelSender): void {
  senderRegistry.set(channel, sender);
}

// ========== 通知服务：查表转发，此后不再因新渠道而修改 ==========
class NotificationService {
  send(channel: string, notification: Notification): void {
    const sender = senderRegistry.get(channel);
    if (!sender) {
      throw new Error(`不支持的发送渠道: ${channel}`);
    }
    sender.send(notification); // 多态调用：渠道差异被各个发送器消化
  }
}

registerSender('sms', new SmsSender());
registerSender('email', new EmailSender());
registerSender('appPush', new AppPushSender());

const service = new NotificationService();

const orderShipped: Notification = {
  userId: 'U-1001',
  title: '您的订单已发货',
  content: '顺丰 SF1234567890，预计明日送达',
};

service.send('sms', orderShipped);
service.send('email', orderShipped);
service.send('appPush', orderShipped);

// ========== 扩展：新需求"接入钉钉"，只新增一个发送器加一行注册，NotificationService 一行未改 ==========
class DingTalkSender implements ChannelSender {
  send(notification: Notification): void {
    console.log(
      `[钉钉] 发给 ${notification.userId}：【${notification.title}】${notification.content}`,
    );
  }
}

registerSender('dingTalk', new DingTalkSender());

service.send('dingTalk', orderShipped);

// 优势：
// 1. 新渠道 = 新发送器 + 一行注册，通知服务和既有渠道的代码零修改
// 2. 短信加签名、推送加角标这类渠道个性需求，各自改自己的发送器，互不牵连
// 3. 发送器实现统一的 ChannelSender 接口，用对象多态替代 if/else，分支条件被彻底消除
// 4. 想测试钉钉只测 DingTalkSender 一个类，不必连带启动整个通知服务

export {};
