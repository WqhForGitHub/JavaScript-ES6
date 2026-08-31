// 改前：各家登录 SDK 的调用姿势天差地别（回调位置、参数结构、字段名全不统一），登录页被迫堆 if-else

// ========== 三家第三方登录 SDK（官方提供，谁也改不了谁） ==========

// 谷歌 SDK：auth(token, callback) 回调风格
const googleSdk = {
  auth(token: string, callback: (profile: { nick: string; picture: string }) => void): void {
    console.log('（Google SDK 弹起授权窗）');
    callback({ nick: 'Tom', picture: 'img/tom.png' });
  },
};

// 微信 SDK：login(appId, success, fail) 成功、失败两个回调分开传
interface WxLoginResult {
  nickname: string;
  headimgurl: string;
}

const wxSdk = {
  login(appId: string, success: (res: WxLoginResult) => void, fail: (err: Error) => void): void {
    console.log('（微信 SDK 拉起二维码）');
    const authorized = true; // 模拟用户点了"确认授权"
    if (authorized) {
      success({ nickname: '阿伟', headimgurl: 'img/awei.png' });
    } else {
      fail(new Error('用户取消了授权'));
    }
  },
};

// QQ SDK：showLoginPopup(options) 回调挂在选项对象里
interface QQLoginOptions {
  appId: string;
  onSuccess: (data: { nickName: string; figureurl: string }) => void;
}

const qqSdk = {
  showLoginPopup(options: QQLoginOptions): void {
    console.log('（QQ SDK 弹出快捷登录窗）');
    options.onSuccess({ nickName: '小企鹅', figureurl: 'img/qq.png' });
  },
};

// ========== 登录页：每种渠道一套调用姿势，连返回的字段名都不统一 ==========
function login(channel: string): void {
  if (channel === 'google') {
    googleSdk.auth('google_token', (profile) => {
      console.log(`Google 登录成功：${profile.nick}`); // 这家叫 nick
    });
  } else if (channel === 'wechat') {
    wxSdk.login(
      'wx_app_id',
      (res) => {
        console.log(`微信登录成功：${res.nickname}`); // 这家叫 nickname
      },
      (err) => {
        console.log('微信登录失败：', err.message);
      },
    );
  } else if (channel === 'qq') {
    qqSdk.showLoginPopup({
      appId: 'qq_app_id',
      onSuccess: (data) => {
        console.log(`QQ 登录成功：${data.nickName}`); // 这家又叫 nickName
      },
    });
  } else {
    console.log('暂不支持的登录渠道：', channel);
  }
}

login('google');
login('wechat');
login('qq');

// 问题：
// 1. 回调位置、参数结构、字段命名三重不统一，登录页被 if-else 撑成了"大杂烩"
// 2. 用户资料字段名各不相同（nick / nickname / nickName），入库前还得各写一套映射
// 3. 新接一个渠道（微博、Apple ID...）就继续往 login 里堆分支，改动点永远在老函数
// 4. 回调式接口没法 await，登录后的跳转逻辑只能层层嵌进回调，越写越深

export {};
