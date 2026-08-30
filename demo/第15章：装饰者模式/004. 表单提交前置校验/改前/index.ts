// 改前：校验规则全部硬编码在 submitForm 函数开头，规则一多，提交函数变成"校验大杂烩"

interface FormData {
  username: string;
  password: string;
  phone: string;
}

function submitForm(form: FormData): void {
  // 校验 1：用户名非空
  if (form.username.trim() === '') {
    console.log('校验失败：用户名不能为空');
    return;
  }

  // 校验 2：用户名长度
  if (form.username.length < 3) {
    console.log('校验失败：用户名至少 3 个字符');
    return;
  }

  // 校验 3：密码长度
  if (form.password.length < 6) {
    console.log('校验失败：密码至少 6 位');
    return;
  }

  // 校验 4：手机号格式
  if (!/^1\d{10}$/.test(form.phone)) {
    console.log('校验失败：手机号格式不正确');
    return;
  }
  // 校验 5：敏感词……每来一条产品需求，这里就多一个 if 块

  // ---------- 千辛万苦走到这里，才是真正的业务动作 ----------
  console.log(`提交表单：${JSON.stringify(form)}`);
}

// ========== 模拟提交 ==========
submitForm({ username: '张三丰', password: '123456', phone: '13800138000' }); // 提交成功
submitForm({ username: '  ', password: '123456', phone: '13800138000' }); // 用户名为空
submitForm({ username: '张三丰', password: '123', phone: '13800138000' }); // 密码太短
submitForm({ username: '张三丰', password: '123456', phone: '12345' }); // 手机号格式错误

// 问题：
// 1. 4 条校验 + 提交动作全挤在一个函数里，校验部分越长，真正的业务逻辑越难找
// 2. 换一个表单（注册改登录），校验规则不同，这个函数完全无法复用
// 3. 校验规则无法单独测试，只能通过调 submitForm 间接验证
// 4. 想临时跳过某条规则（测试环境放宽手机号校验），只能注释代码，容易误提交

export {};
