// 改后：策略模式 -- 通用校验规则封装成策略对象，Validator 负责收集并逐条执行

// ========== 策略对象：每个规则一个函数，统一签名 (value, ...ruleArgs, errorMsg) ==========
// 签名声明为开放的 Record，方便运行时注册新策略
type ValidateStrategy = (value: string, ...args: unknown[]) => string | undefined;

const validateStrategies: Record<string, ValidateStrategy> = {
  isNonEmpty(value, errorMsg) {
    if (value === '') return errorMsg as string;
  },
  minLength(value, length, errorMsg) {
    if (value.length < (length as number)) return errorMsg as string;
  },
  isMobile(value, errorMsg) {
    if (!/(^1[3-9][0-9]{9}$)/.test(value)) return errorMsg as string;
  },
};

// 规则的统一描述：策略名 + 可选参数 + 错误提示
interface Rule {
  strategy: string;
  args?: unknown[]; // 如 minLength 的 6
  errorMsg: string;
}

// ========== 环境类：Validator 收集规则 -> start() 时逐条委托给策略 ==========
class Validator {
  private rules: Array<() => string | undefined> = [];

  // 给某个值挂上一条规则（惰性求值：先把闭包存起来）
  add(value: string, rule: Rule): this {
    const { strategy, args = [], errorMsg } = rule;
    this.rules.push(() => {
      const fn = validateStrategies[strategy];
      if (!fn) throw new Error(`不存在的校验策略：${strategy}`);
      return fn(value, ...args, errorMsg);
    });
    return this; // 支持链式调用
  }

  // 逐条执行策略，遇到第一个错误就返回
  start(): string | undefined {
    for (const ruleFn of this.rules) {
      const errorMsg = ruleFn();
      if (errorMsg) return errorMsg;
    }
  }
}

// ========== 使用：规则像"配置"一样自由组合 ==========
const form1 = { userName: '', password: '123456', phoneNumber: '13800138000' };

const validator1 = new Validator()
  .add(form1.userName, { strategy: 'isNonEmpty', errorMsg: '用户名不能为空' })
  .add(form1.userName, { strategy: 'minLength', args: [6], errorMsg: '用户名长度不能少于 6 位' })
  .add(form1.password, { strategy: 'minLength', args: [6], errorMsg: '密码长度不能少于 6 位' });

console.log('校验结果1：', validator1.start() ?? '验证通过'); // 用户名不能为空

const form2 = { userName: 'zhangsan', password: '123', phoneNumber: '13800138000' };

const validator2 = new Validator()
  .add(form2.userName, { strategy: 'minLength', args: [6], errorMsg: '用户名长度不能少于 6 位' })
  .add(form2.password, { strategy: 'minLength', args: [6], errorMsg: '密码长度不能少于 6 位' })
  .add(form2.phoneNumber, { strategy: 'isMobile', errorMsg: '手机号码格式不正确' });

console.log('校验结果2：', validator2.start() ?? '验证通过'); // 密码长度不能少于 6 位

// ========== 新需求：校验邮箱？注册一个新策略即可 ==========
Object.assign(validateStrategies, {
  isEmail(value: string, errorMsg: string): string | undefined {
    if (!/^\S+@\S+\.\S+$/.test(value)) return errorMsg;
  },
});

const validator3 = new Validator().add('not-an-email', {
  strategy: 'isEmail',
  errorMsg: '邮箱格式不正确',
});
console.log('校验结果3：', validator3.start() ?? '验证通过'); // 邮箱格式不正确

// 优势：
// 1. 规则与字段解耦：同一套策略可以给任何字段组合使用
// 2. 新增校验类型 = 注册新策略，Validator 不用动
// 3. 规则像配置一样可增删，甚至可以存成 JSON 由后端下发

export {};
