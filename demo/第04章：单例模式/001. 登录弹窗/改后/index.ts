// 改后：惰性单例 -- 第一次点击才创建弹窗，之后永远复用同一个
class LoginModal {
  private static instance: LoginModal | null = null;

  // 私有构造函数：外部无法 new，只能走 getInstance 这个唯一入口
  private constructor() {
    console.log('【创建弹窗】<div class="login-modal">...</div> 插入 body');
  }

  static getInstance(): LoginModal {
    if (!LoginModal.instance) {
      LoginModal.instance = new LoginModal(); // 第一次用到才创建（惰性）
    }
    return LoginModal.instance;
  }

  show() {
    console.log('显示登录弹窗');
  }

  hide() {
    console.log('隐藏登录弹窗');
  }
}

// 模拟用户手抖，连点 3 次"登录"按钮
for (let i = 1; i <= 3; i++) {
  LoginModal.getInstance().show(); // ✅ 弹窗只创建一次，之后全是复用
}

const a = LoginModal.getInstance();
const b = LoginModal.getInstance();
console.log('两次拿到的是同一个弹窗实例：', a === b); // true

export {};
