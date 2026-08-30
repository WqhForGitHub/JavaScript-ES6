// 改前：注册校验函数把所有规则装进层层嵌套的 if，代码不断向右缩进成"箭头形"，阅读时要在脑子里维护一整条嵌套路径

// ========== 注册表单：用户填写的数据 ==========
interface RegisterForm {
  username: string;
  phone: string;
  password: string;
  verifyCode: string;
}

// ========== 校验注册表单：四层嵌套，越校验越深 ==========
function validateRegister(form: RegisterForm): string {
  let message = '校验通过';
  if (form.username.trim() !== '') {
    if (/^1\d{10}$/.test(form.phone)) {
      if (form.password.length >= 6) {
        if (form.verifyCode.length === 6) {
          console.log(`用户 ${form.username} 校验通过，准备创建账号`);
        } else {
          message = '验证码必须是 6 位';
        }
      } else {
        message = '密码至少 6 位';
      }
    } else {
      message = '手机号格式不正确';
    }
  } else {
    message = '用户名不能为空';
  }
  return message;
}

// ========== 使用：三种填写情况各校验一次 ==========
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

// 问题：
// 1. 嵌套四层的"箭头形"代码：读到最里层时，必须记住前面每一层的条件才能确定当前处于什么状态
// 2. 错误提示写在 else 里、成功逻辑写在最深处：想找"密码校验失败返回什么"，得先跳过两层嵌套
// 3. message 的赋值散落在四个 else 分支：新增一条校验规则就要再嵌一层，五层、六层地往右长
// 4. 主干（真正的注册流程）被埋在最深的缩进里，与各种失败分支混在一起，重点不突出

export {};
