// 改前：每点一次"登录"按钮就 new 一个弹窗，弹窗 DOM 越堆越多，页面越来越卡
class LoginModal {
  constructor() {
    // 创建弹窗 DOM 是一笔昂贵的开销：创建节点、拼接结构、插入 body
    console.log('【创建弹窗】<div class="login-modal">...</div> 插入 body');
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
  const modal = new LoginModal(); // ❌ 每次点击都创建一个新弹窗
  modal.show();
}
// 页面上堆了 3 个一模一样的弹窗，还只能看到最上面那个

export {};
