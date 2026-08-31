// 改前：每个字段写一个巨型校验函数，规则内联，换个字段基本靠复制粘贴

// 校验通过返回 null，不通过返回错误提示
function validateUsername(value: string): string | null {
  if (value.trim() === '') {
    return '[用户名] 不能为空';
  }
  if (value.length < 4 || value.length > 16) {
    return '[用户名] 长度必须在 4-16 位之间';
  }
  if (!/^\w+$/.test(value)) {
    return '[用户名] 只能包含字母、数字、下划线';
  }
  return null;
}

// 换个字段？“非空、长度”这些判断再抄一遍……
function validatePassword(value: string): string | null {
  if (value.trim() === '') {
    return '[密码] 不能为空';
  }
  if (value.length < 8 || value.length > 20) {
    return '[密码] 长度必须在 8-20 位之间';
  }
  if (!/\d/.test(value)) {
    return '[密码] 必须包含数字';
  }
  if (!/[a-z]/.test(value)) {
    return '[密码] 必须包含小写字母';
  }
  return null;
}

console.log(validateUsername('')); // [用户名] 不能为空
console.log(validateUsername('ab')); // [用户名] 长度必须 4-16
console.log(validateUsername('design pattern')); // [用户名] 含空格，格式不对
console.log(validateUsername('design_pattern')); // null，通过

console.log(validatePassword('12345678')); // [密码] 缺小写字母
console.log(validatePassword('abc12345')); // null，通过

// 问题：
// 1. “非空”“长度”这类通用规则在每个函数里重复实现，改一处忘一处
// 2. 规则顺序写死在函数体内，想调整校验优先级只能重排 if
// 3. 新增规则（如用户名“不能包含敏感词”）必须修改已有函数
// 4. 规则无法单独复用：手机号、昵称想用同一套“非空 + 长度”做不到

export {};
