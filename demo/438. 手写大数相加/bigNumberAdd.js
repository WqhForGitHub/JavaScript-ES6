/**
 * 手写大数相加
 *
 * 以字符串形式表示的两个非负大整数相加，避免 JavaScript Number 精度丢失
 * （Number.MAX_SAFE_INTEGER = 2^53 - 1 = 9007199254740991）。
 *
 * 思路：模拟竖式加法，从个位（字符串末尾）开始逐位相加，处理进位。
 *   - 用两个指针 i、j 分别从 a、b 末尾向前移动。
 *   - 每轮取当前位（越界视为 0）加上进位 carry，sum % 10 为当前位结果，
 *     Math.floor(sum / 10) 为新的进位。
 *   - 最后若仍有进位需补到最高位。
 * 时间复杂度 O(max(n, m))，空间复杂度 O(max(n, m))。
 */

function bigNumberAdd(a, b) {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let result = "";
  while (i >= 0 || j >= 0 || carry > 0) {
    const digitA = i >= 0 ? a.charCodeAt(i) - 48 : 0;
    const digitB = j >= 0 ? b.charCodeAt(j) - 48 : 0;
    const sum = digitA + digitB + carry;
    result = (sum % 10) + result;
    carry = Math.floor(sum / 10);
    i--;
    j--;
  }
  return result;
}

// 扩展：支持负整数的加法（本质是带符号的加减）
function bigNumberAddSigned(a, b) {
  const negA = a.startsWith("-");
  const negB = b.startsWith("-");
  const absA = negA ? a.slice(1) : a;
  const absB = negB ? b.slice(1) : b;

  if (!negA && !negB) return bigNumberAdd(absA, absB);
  if (negA && negB) return "-" + bigNumberAdd(absA, absB);
  // 一正一负：转化为大数减法
  return bigNumberSub(negA ? absB : absA, negA ? absA : absB);
}

// 辅助：大数减法（a - b，假设 a >= b，结果非负）
function bigNumberSub(a, b) {
  let i = a.length - 1;
  let j = b.length - 1;
  let borrow = 0;
  let result = "";
  while (i >= 0) {
    const digitA = a.charCodeAt(i) - 48;
    const digitB = j >= 0 ? b.charCodeAt(j) - 48 : 0;
    let diff = digitA - digitB - borrow;
    if (diff < 0) {
      diff += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result = diff + result;
    i--;
    j--;
  }
  // 去掉前导零
  return result.replace(/^0+/, "") || "0";
}

// --- 测试 ---

console.log(bigNumberAdd("123", "456")); // '579'
console.log(bigNumberAdd("999", "1")); // '1000'
console.log(bigNumberAdd("1", "999")); // '1000'
console.log(bigNumberAdd("0", "0")); // '0'
console.log(bigNumberAdd("123456789", "987654321")); // '1111111110'
console.log(bigNumberAdd("9007199254740991", "1")); // '9007199254740992' (超过安全整数)
console.log(bigNumberAdd("99999999999999999999", "1")); // '100000000000000000000'
console.log(
  bigNumberAdd(
    "123456789012345678901234567890",
    "987654321098765432109876543210",
  ),
);
// '1111111110111111111011111111100'

console.log(bigNumberAddSigned("100", "50")); // '150'
console.log(bigNumberAddSigned("-100", "50")); // '-50'
console.log(bigNumberAddSigned("-50", "100")); // '50'
console.log(bigNumberAddSigned("-50", "-50")); // '-100'

// 与 BigInt 对照验证
const big1 = "123456789012345678901234567890";
const big2 = "987654321098765432109876543210";
console.log("BigInt check:", (BigInt(big1) + BigInt(big2)).toString());
// '1111111110111111111011111111100'  (与上面结果一致)
