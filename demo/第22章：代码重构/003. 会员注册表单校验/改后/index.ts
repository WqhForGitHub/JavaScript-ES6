// 改后：提前让函数退出（卫语句）-- 不满足规则的分支立即 return，主流程始终贴着左侧走，一条规则一行，新增规则只需加一个卫语句

// ========== 注册表单：用户填写的数据 ==========
interface RegisterForm {
  username: string;
  phone: string;
  password: string;
  verifyCode: string;
}

// ========== 校验注册表单：一条规则一个卫语句，失败即刻退出 ==========
function validateRegister(form: RegisterForm): string {
  if (form.username.trim() === '') {
    return '用户名不能为空';
  }
  if (!/^1\d{10}$/.test(form.phone)) {
    return '手机号格式不正确';
  }
  if (form.password.length < 6) {
    return '密码至少 6 位';
  }
  if (form.verifyCode.length !== 6) {
    return '验证码必须是 6 位';
  }

  // 走到这里说明所有规则都通过：主干流程不再被埋进嵌套
  console.log(`用户 ${form.username} 校验通过，准备创建账号`);
  return '校验通过';
}

// ========== 使用：三种填写情况各校验一次，结果与改前一致 ==========
console.log(
  validateRegister({
    username: '张三',
    phone: '13800138000',
    password: '123456',
    verifyCode: '888888',
  }),
); // 校验通过
console.log(
  validateRegister({ username: '张三', phone: '13800', password: '123', verifyCode: '88' }),
); // 手机号格式不正确
console.log(
  validateRegister({
    username: '',
    phone: '13800138000',
    password: '123456',
    verifyCode: '888888',
  }),
); // 用户名不能为空

// ========== 扩展：新增"用户名 4-20 位"规则，只需再加一个卫语句 ==========
// if (form.username.length < 4 || form.username.length > 20) {
//   return '用户名必须是 4 到 20 位';
// }
// 不增加任何缩进层级，其余规则一行不改

// 优势：
// 1. 嵌套消失：每条规则平铺一行，"规则清单"从箭头形代码变成一张平面列表
// 2. 失败原因紧跟校验条件：看到 if 就知道什么情况下返回什么，不用跳进 else 找答案
// 3. 主干流程（校验通过后的动作）放在函数末尾、零缩进，重点一目了然
// 4. 新增校验规则只是"再加一个卫语句"，缩进深度永远不涨，函数结构稳定

export {};
