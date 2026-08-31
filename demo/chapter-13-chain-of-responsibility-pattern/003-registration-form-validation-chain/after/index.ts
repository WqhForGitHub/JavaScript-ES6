// 改后：职责链模式 -- 每条规则是链上一个节点，谁发现问题谁拦截，没问题就交给下一条

// ========== 校验结果约定：null 表示通过，字符串表示错误信息 ==========
type RuleResult = string | null;

// ========== 抽象规则节点：“拦截或放行”的链式流程只在基类写一遍 ==========
abstract class ValidationRule {
  private next: ValidationRule | null = null;

  constructor(protected field: string) {}

  setNext(next: ValidationRule): ValidationRule {
    this.next = next;
    return next;
  }

  // 模板方法：自己发现问题就拦截，否则交给下一条规则
  check(value: string): RuleResult {
    const error = this.test(value);
    if (error !== null) {
      return `[${this.field}] ${error}`; // 拦截：不再往下传
    }
    if (this.next) {
      return this.next.check(value); // 放行：交给下一条
    }
    return null; // 走到链尾说明全部通过
  }

  // 子类只回答：这条规则过不过？不过给出原因
  protected abstract test(value: string): RuleResult;
}

// ========== 具体规则：每条规则是一个可自由组合的小对象 ==========
class RequiredRule extends ValidationRule {
  protected test(value: string): RuleResult {
    return value.trim() === '' ? '不能为空' : null;
  }
}

class LengthRule extends ValidationRule {
  constructor(
    field: string,
    private min: number,
    private max: number,
  ) {
    super(field);
  }

  protected test(value: string): RuleResult {
    return value.length < this.min || value.length > this.max
      ? `长度必须在 ${this.min}-${this.max} 位之间`
      : null;
  }
}

class PatternRule extends ValidationRule {
  constructor(
    field: string,
    private pattern: RegExp,
    private hint: string,
  ) {
    super(field);
  }

  protected test(value: string): RuleResult {
    return this.pattern.test(value) ? null : this.hint;
  }
}

// ========== 组装“用户名”校验链：非空 -> 长度 -> 格式 ==========
const usernameChain = new RequiredRule('用户名');
usernameChain
  .setNext(new LengthRule('用户名', 4, 16))
  .setNext(new PatternRule('用户名', /^\w+$/, '只能包含字母、数字、下划线'));

console.log(usernameChain.check('')); // [用户名] 不能为空
console.log(usernameChain.check('ab')); // [用户名] 长度必须 4-16
console.log(usernameChain.check('design pattern')); // [用户名] 只能包含字母数字下划线
console.log(usernameChain.check('design_pattern')); // null，通过

// ========== 组装“密码”校验链：非空 -> 长度 -> 含数字 -> 含小写 ==========
// RequiredRule、LengthRule 直接复用，不用再抄一遍
const passwordChain = new RequiredRule('密码');
passwordChain
  .setNext(new LengthRule('密码', 8, 20))
  .setNext(new PatternRule('密码', /\d/, '必须包含数字'))
  .setNext(new PatternRule('密码', /[a-z]/, '必须包含小写字母'));

console.log(passwordChain.check('12345678')); // [密码] 必须包含小写字母
console.log(passwordChain.check('abc12345')); // null，通过

// ========== 扩展：给用户名加一条“敏感词”规则，只动组装处 ==========
class BannedWordsRule extends ValidationRule {
  private banned = ['admin', 'official'];

  protected test(value: string): RuleResult {
    const hit = this.banned.find((word) => value.toLowerCase().includes(word));
    return hit ? `不能包含敏感词「${hit}」` : null;
  }
}

const strictUsernameChain = new RequiredRule('用户名');
strictUsernameChain
  .setNext(new LengthRule('用户名', 4, 16))
  .setNext(new PatternRule('用户名', /^\w+$/, '只能包含字母、数字、下划线'))
  .setNext(new BannedWordsRule('用户名'));

console.log(strictUsernameChain.check('admin_2024')); // [用户名] 不能包含敏感词「admin」

// 优势：
// 1. 每条规则是独立对象，“非空”“长度”等通用规则写一次、处处复用
// 2. 链的组装权交给调用方：不同字段按需挑选规则、自由排序
// 3. 新增规则 = 新增子类，已有规则和链式流程零修改
// 4. 谁拦截的请求一目了然，能精确知道“死”在哪条规则上

export {};
