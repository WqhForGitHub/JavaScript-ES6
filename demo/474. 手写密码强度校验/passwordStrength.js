/**
 * 手写密码强度校验
 *
 * 功能：根据密码字符组成评估密码强度，返回强度等级和分值
 * 实现思路：
 *   1. 长度分：长度越长得分越高（>=8、>=12、>=16 阶梯加分）
 *   2. 字符种类分：小写字母、大写字母、数字、特殊字符，每满足一种加分
 *   3. 额外奖励：多种字符组合、不含连续重复字符、不含常见弱口令
 *   4. 扣分项：纯数字、纯字母、常见弱口令（如 123456、password）扣分
 *   5. 根据总分映射为 weak / medium / strong / veryStrong 四个等级
 */

/**
 * 校验密码强度
 * @param {string} password 待校验密码
 * @returns {{score: number, level: string, suggestions: string[]}} 强度信息
 */
function passwordStrength(password) {
  const result = { score: 0, level: "weak", suggestions: [] };

  if (typeof password !== "string" || password.length === 0) {
    result.suggestions.push("密码不能为空");
    return result;
  }

  let score = 0;
  const len = password.length;

  // 1. 长度评分
  if (len >= 8) score += 10;
  if (len >= 12) score += 15;
  if (len >= 16) score += 15;
  if (len < 6) {
    score -= 10;
    result.suggestions.push("密码太短，建议至少 8 位");
  }

  // 2. 字符种类评分
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(
    Boolean,
  ).length;
  score += varietyCount * 10;

  // 3. 多样性奖励
  if (varietyCount >= 3) score += 10;
  if (varietyCount === 4) score += 10;

  // 4. 连续重复字符扣分（如 aaa、111）
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    result.suggestions.push("避免连续重复字符");
  }

  // 5. 常见弱口令扣分
  const weakPasswords = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "111111",
    "admin",
    "letmein",
  ];
  if (weakPasswords.includes(password.toLowerCase())) {
    score -= 40;
    result.suggestions.push("避免使用常见弱口令");
  }

  // 6. 纯数字 / 纯字母扣分
  if (/^\d+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
    score -= 10;
    result.suggestions.push("建议混合使用字母、数字和特殊字符");
  }

  // 7. 限制分数范围
  score = Math.max(0, Math.min(100, score));
  result.score = score;

  // 8. 映射强度等级
  if (score < 40) {
    result.level = "weak";
  } else if (score < 70) {
    result.level = "medium";
  } else if (score < 90) {
    result.level = "strong";
  } else {
    result.level = "veryStrong";
  }

  return result;
}

// ===== 测试用例 =====
console.log("=== 密码强度校验 ===");

// 1. 极弱密码
console.log(passwordStrength("123456"));
// 期望输出: { score: 0, level: 'weak', suggestions: [...] }

// 2. 常见弱口令
console.log(passwordStrength("password"));
// 期望输出: { score: 0, level: 'weak', suggestions: [...] }

// 3. 纯数字中等长度
console.log(passwordStrength("12345678"));
// 期望输出: level 为 'weak' 或 'medium'

// 4. 字母+数字
console.log(passwordStrength("abc12345"));
// 期望输出: level: 'weak'（仅小写+数字且为常见模式，得分偏低）

// 5. 大小写+数字+特殊字符，长度足够
console.log(passwordStrength("Abc@1234def"));
// 期望输出: level: 'strong' 或 'veryStrong'

// 6. 强密码
console.log(passwordStrength("P@ssw0rd!2024#Xy"));
// 期望输出: level: 'veryStrong'

// 7. 含连续重复字符
console.log(passwordStrength("AAAbbb123!"));
// 期望输出: suggestions 中包含避免连续重复字符的提示

// 8. 空密码
console.log(passwordStrength(""));
// 期望输出: { score: 0, level: 'weak', suggestions: ['密码不能为空'] }
