// 改前：所有校验规则写死在提交函数里，一个字段改动就要重测整个函数

interface FormData {
  userName: string;
  password: string;
  phoneNumber: string;
}

function validateForm(formData: FormData): string | undefined {
  // 用户名的规则
  if (formData.userName === '') {
    return '用户名不能为空';
  }
  if (formData.userName.length < 6) {
    return '用户名长度不能少于 6 位';
  }

  // 密码的规则
  if (formData.password === '') {
    return '密码不能为空';
  }
  if (formData.password.length < 6) {
    return '密码长度不能少于 6 位';
  }

  // 手机号的规则
  if (!/(^1[3-9][0-9]{9}$)/.test(formData.phoneNumber)) {
    return '手机号码格式不正确';
  }

  return undefined; // 全部通过
}

// 模拟用户提交
console.log(validateForm({ userName: '', password: '123456', phoneNumber: '13800138000' })); // 用户名不能为空
console.log(validateForm({ userName: 'zhangsan', password: '123', phoneNumber: '13800138000' })); // 密码长度不能少于 6 位
console.log(validateForm({ userName: 'zhangsan', password: '123456', phoneNumber: 'abc' })); // 手机号码格式不正确

// 问题：
// 1. 校验规则和"哪个字段用哪些规则"绑死在一起，复用不了
// 2. 想给密码加一条"必须包含字母"规则？继续往函数里塞 if
// 3. isNonEmpty、minLength 这些通用规则，在每个字段的 if 里被重复手写

export {};
