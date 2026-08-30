// 改后：装饰者模式（AOP 风格）-- submit 只负责提交，每条校验是一个 before 装饰器，失败返回 false 即拦截

interface FormData {
  username: string;
  password: string;
  phone: string;
}

// ========== AOP 装饰器：before 返回 false 时，原函数被拦截 ==========
function before<A extends unknown[]>(
  fn: (...args: A) => void,
  beforefn: (...args: A) => boolean | void,
): (...args: A) => void {
  return (...args: A): void => {
    if (beforefn(...args) === false) return; // 一票否决：校验失败，提交被拦截
    fn(...args);
  };
}

// ========== 业务函数：只做一件事 -- 提交 ==========
function submit(form: FormData): void {
  console.log(`提交表单：${JSON.stringify(form)}`);
}

// ========== 每条校验是独立函数：返回 false 表示"不通过" ==========
type Validator = (form: FormData) => boolean;

const checkUsername: Validator = (form) => {
  if (form.username.trim() === '') {
    console.log('校验失败：用户名不能为空');
    return false;
  }
  if (form.username.length < 3) {
    console.log('校验失败：用户名至少 3 个字符');
    return false;
  }
  return true;
};

const checkPassword: Validator = (form) => {
  if (form.password.length < 6) {
    console.log('校验失败：密码至少 6 位');
    return false;
  }
  return true;
};

const checkPhone: Validator = (form) => {
  if (!/^1\d{10}$/.test(form.phone)) {
    console.log('校验失败：手机号格式不正确');
    return false;
  }
  return true;
};

// ========== 像插件一样组装校验链（洋葱模型：后包的先执行） ==========
let submitForm: (form: FormData) => void = submit;
submitForm = before(submitForm, checkPhone); // 最内层：最后执行
submitForm = before(submitForm, checkPassword);
submitForm = before(submitForm, checkUsername); // 最外层：最先执行
// 实际执行顺序：用户名 -> 密码 -> 手机号 -> 提交

// ========== 模拟提交 ==========
submitForm({ username: '张三丰', password: '123456', phone: '13800138000' }); // 提交成功
submitForm({ username: '  ', password: '123456', phone: '13800138000' }); // 用户名为空，被拦截
submitForm({ username: '张三丰', password: '123', phone: '13800138000' }); // 密码太短，被拦截
submitForm({ username: '张三丰', password: '123456', phone: '12345' }); // 手机号格式错误，被拦截

// ========== 按需组装：测试环境放宽手机号校验，不包它即可 ==========
let submitFormInTest: (form: FormData) => void = submit;
submitFormInTest = before(submitFormInTest, checkUsername);
submitFormInTest = before(submitFormInTest, checkPassword);

submitFormInTest({ username: '张三丰', password: '123456', phone: 'not-a-phone' }); // 照常提交

// ========== 扩展：新增"敏感词校验"，写一个函数、包一层，已有代码零修改 ==========
const checkSensitiveWords: Validator = (form) => {
  if (form.username.includes('管理员')) {
    console.log('校验失败：用户名含敏感词');
    return false;
  }
  return true;
};

// 重新从裸 submit 组装一条 V2 链（不基于旧链包装，避免校验器重复执行）
let submitFormV2: (form: FormData) => void = submit;
submitFormV2 = before(submitFormV2, checkSensitiveWords); // 最内层：最后执行
submitFormV2 = before(submitFormV2, checkPhone);
submitFormV2 = before(submitFormV2, checkPassword);
submitFormV2 = before(submitFormV2, checkUsername); // 最外层：最先执行
// 实际执行顺序：用户名 -> 密码 -> 手机号 -> 敏感词 -> 提交

submitFormV2({ username: '管理员小号', password: '123456', phone: '13800138000' }); // 敏感词拦截

// 优势：
// 1. submit 回归单一职责，每条校验是一等公民：可独立测试、可跨表单复用
// 2. 新增规则 = 写一个校验函数 + 包一层，已有代码零修改（开闭原则）
// 3. 组装即策略：要不要校验、按什么顺序校验，全在组装那几行，不用注释代码
// 4. before 装饰器天然支持"一票否决"，任何一步失败都拦得住提交

export {};
