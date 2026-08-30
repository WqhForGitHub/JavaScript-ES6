// 改后：单一职责原则 -- 校验只管规则、提交只管传输、提示只管界面，三者由编排函数协作

interface RegisterForm {
  username: string;
  password: string;
  phone: string;
}

interface FieldError {
  field: keyof RegisterForm;
  message: string;
}

// ========== 职责一：校验器 -- 纯逻辑：输入表单，输出错误清单，不碰网络也不碰界面 ==========
class RegisterFormValidator {
  validate(form: RegisterForm): FieldError[] {
    const errors: FieldError[] = [];
    if (form.username.length < 4 || form.username.length > 16) {
      errors.push({ field: 'username', message: '用户名需 4-16 个字符' });
    }
    if (form.password.length < 8 || !/\d/.test(form.password)) {
      errors.push({ field: 'password', message: '密码至少 8 位且包含数字' });
    }
    if (!/^1\d{10}$/.test(form.phone)) {
      errors.push({ field: 'phone', message: '手机号格式不正确' });
    }
    return errors;
  }
}

// ========== 职责二：注册服务 -- 只负责把合法表单发出去 ==========
function registerUser(form: RegisterForm): void {
  console.log(`[请求] POST /api/register { username: "${form.username}" }`);
}

// ========== 职责三：界面反馈 -- 只负责把结果翻译成用户看得见的提示 ==========
const formFeedback = {
  showErrors(errors: FieldError[]): void {
    errors.forEach(({ field, message }) => console.log(`页面红字提示（${field}）：${message}`));
  },
  showSuccess(): void {
    console.log('页面绿字提示：注册成功，即将跳转登录页');
  },
};

// ========== 编排：先校验，有错只提示不发请求；全过才提交 ==========
const validator = new RegisterFormValidator();

function submitRegisterForm(form: RegisterForm): void {
  const errors = validator.validate(form);
  if (errors.length > 0) {
    formFeedback.showErrors(errors);
    return;
  }
  registerUser(form);
  formFeedback.showSuccess();
}

// ========== 使用 ==========
// 一错到底的表单：所有问题一次报完，不用改一处错再提交一次（拆分带来的体验升级）
submitRegisterForm({ username: 'tom', password: 'abc', phone: '123' });
submitRegisterForm({ username: 'zhangsan', password: 'pass1234', phone: '13800138000' }); // 注册成功

// ========== 复用与测试是拆分的回报 ==========
// 1. 修改密码表单直接复用密码规则，不带走任何请求和提示代码
function isPasswordStrongEnough(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}
console.log(`修改密码校验："abc123" 是否合规：${isPasswordStrongEnough('abc123')}`);

// 2. 无界面环境跑校验：断言返回值即可，不发请求、不碰 DOM
const testErrors = validator.validate({ username: 'tom', password: 'x', phone: '123' });
console.log(`单元测试断言：该用例应报出 ${testErrors.length} 个错误`);

// 优势：
// 1. 三个变化原因各归各位：改规则只动校验器，换文案只动 formFeedback，换请求方式只动 registerUser
// 2. 校验器是纯逻辑对象：修改密码表单、单元测试、服务端预检都能直接复用
// 3. 体验顺带升级：校验器一次算出全部错误，表单提示从“挤牙膏”变成“一次报完”

export {};
