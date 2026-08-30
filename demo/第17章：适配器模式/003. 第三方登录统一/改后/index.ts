// 改后：适配器模式 -- 每家 SDK 包一层适配器，统一成 login(): Promise<LoginUser>，登录页只认这一种接口

// ========== 目标接口：业务代码期望的"登录渠道"长什么样 ==========
interface LoginUser {
  nickname: string; // 昵称统一叫 nickname
  avatar: string; // 头像统一叫 avatar
}

interface LoginChannel {
  login(): Promise<LoginUser>; // 统一返回 Promise，可以 await
}

// ========== 被适配者：三家 SDK 原样保留，一行不改 ==========
const googleSdk = {
  auth(token: string, callback: (profile: { nick: string; picture: string }) => void): void {
    console.log('（Google SDK 弹起授权窗）');
    callback({ nick: 'Tom', picture: 'img/tom.png' });
  },
};

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

// ========== 适配器：把三种"方言"翻译成同一套 login() ==========
class GoogleLoginAdapter implements LoginChannel {
  login(): Promise<LoginUser> {
    return new Promise((resolve) => {
      googleSdk.auth('google_token', (profile) => {
        // 字段名翻译：nick -> nickname、picture -> avatar
        resolve({ nickname: profile.nick, avatar: profile.picture });
      });
    });
  }
}

class WeChatLoginAdapter implements LoginChannel {
  login(): Promise<LoginUser> {
    return new Promise((resolve, reject) => {
      wxSdk.login(
        'wx_app_id',
        (res) => resolve({ nickname: res.nickname, avatar: res.headimgurl }),
        (err) => reject(err), // 失败回调翻译成 reject，统一走 catch
      );
    });
  }
}

class QQLoginAdapter implements LoginChannel {
  login(): Promise<LoginUser> {
    return new Promise((resolve) => {
      qqSdk.showLoginPopup({
        appId: 'qq_app_id',
        onSuccess: (data) => resolve({ nickname: data.nickName, avatar: data.figureurl }),
      });
    });
  }
}

// ========== 扩展：新接微博登录（原生就是 Promise，但字段名不统一），加一个适配器即可 ==========
const weiboSdk = {
  login(): Promise<{ screen_name: string; avatar_hd: string }> {
    console.log('（微博 SDK 拉起授权页）');
    return Promise.resolve({ screen_name: '围脖用户', avatar_hd: 'img/weibo.png' });
  },
};

class WeiboLoginAdapter implements LoginChannel {
  login(): Promise<LoginUser> {
    return weiboSdk.login().then((account) => ({
      nickname: account.screen_name, // screen_name -> nickname
      avatar: account.avatar_hd, // avatar_hd -> avatar
    }));
  }
}

// ========== 登录页：只面向 LoginChannel 接口，分支消失，还能 await ==========
async function login(channel: LoginChannel): Promise<void> {
  try {
    const user = await channel.login();
    console.log(`登录成功，欢迎你：${user.nickname}（头像：${user.avatar}）`);
    // 登录后的跳转、入库等逻辑顺序往下写即可，不再层层嵌套
  } catch (err) {
    console.log('登录失败：', err instanceof Error ? err.message : err);
  }
}

async function main(): Promise<void> {
  await login(new GoogleLoginAdapter());
  await login(new WeChatLoginAdapter());
  await login(new QQLoginAdapter());
  await login(new WeiboLoginAdapter()); // 新渠道上线：适配器 + 这一行，login 函数零修改
}

void main();

// 优势：
// 1. 登录页只依赖 LoginChannel 接口，三种调用姿势收敛成一句 channel.login()
// 2. 字段名翻译（nick / nickname / nickName -> nickname）集中在各适配器，入库只认一种结构
// 3. 新增渠道 = 新增一个适配器类 + 调用处加一行，登录页主体零修改，符合开放-封闭原则
// 4. 适配器把回调统一翻译成 Promise，登录后的逻辑可以顺序 await，告别回调嵌套

export {};
