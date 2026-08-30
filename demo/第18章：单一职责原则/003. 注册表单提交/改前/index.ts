// 改前：提交函数一手包办校验、请求和界面提示 -- 规则、文案、传输三个变化原因缠成一团

interface RegisterForm {
  username: string;
  password: string;
  phone: string;
}

function submitRegisterForm(form: RegisterForm): void {
  // 职责一：校验（规则、文案、界面输出三合一，改哪个都得进这个函数）
  if (form.username.length < 4 || form.username.length > 16) {
    console.log('页面红字提示：用户名需 4-16 个字符'); // 校验不过，直接“操作 DOM”
    return; // 一个字段报完错，用户改完再提交，才轮到下一个字段报错
  }
  if (form.password.length < 8 || !/\d/.test(form.password)) {
    console.log('页面红字提示：密码至少 8 位且包含数字');
    return;
  }
  if (!/^1\d{10}$/.test(form.phone)) {
    console.log('页面红字提示：手机号格式不正确');
    return;
  }

  // 职责二：发请求
  console.log(`[请求] POST /api/register { username: "${form.username}" }`);

  // 职责三：成功提示 + 跳转
  console.log('页面绿字提示：注册成功，即将跳转登录页');
}

// ========== 使用 ==========
submitRegisterForm({ username: 'tom', password: '12345678', phone: '13800138000' }); // 用户名太短
submitRegisterForm({ username: 'zhangsan', password: 'abcdefgh', phone: '13800138000' }); // 密码没数字
submitRegisterForm({ username: 'zhangsan', password: 'pass1234', phone: '13800138000' }); // 注册成功

// 问题：
// 1. 三个变化原因互相纠缠：校验规则调整、提示文案换英文、请求换库，改的居然是同一个函数
// 2. 校验逻辑无法复用：修改密码表单想要同一套密码规则，只能复制粘贴一遍
// 3. 校验和界面绑死：在测试环境单独跑校验，会顺带触发“操作 DOM”和发请求

export {};
