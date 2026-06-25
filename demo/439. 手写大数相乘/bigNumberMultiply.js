/**
 * 手写大数相乘
 *
 * 以字符串形式表示的两个非负大整数相乘，返回字符串结果，
 * 避免 JavaScript Number 精度丢失。
 *
 * 思路：模拟竖式乘法。设 num1 长度 m、num2 长度 n，结果最多 m+n 位。
 *   用一个长度 m+n 的数组 res 累加每位乘积：
 *     num1[i] * num2[j] 的结果放在 res[i+j]（高位）和 res[i+j+1]（低位）。
 *   逆序遍历两个字符串逐位相乘，累加进位，最后去除前导零。
 * 时间复杂度 O(n * m)，空间复杂度 O(n + m)。
 */

function bigNumberMultiply(num1, num2) {
  if (num1 === "0" || num2 === "0") return "0";

  const m = num1.length;
  const n = num2.length;
  const res = new Array(m + n).fill(0);

  // 逆序遍历，逐位相乘并累加到对应位置
  for (let i = m - 1; i >= 0; i--) {
    const x = num1.charCodeAt(i) - 48;
    for (let j = n - 1; j >= 0; j--) {
      const y = num2.charCodeAt(j) - 48;
      const mul = x * y;
      const p1 = i + j; // 高位
      const p2 = i + j + 1; // 低位
      const sum = mul + res[p2];
      res[p2] = sum % 10;
      res[p1] += Math.floor(sum / 10);
    }
  }

  // 跳过前导零，转成字符串
  let result = "";
  let k = 0;
  while (k < res.length && res[k] === 0) k++;
  for (; k < res.length; k++) {
    result += res[k];
  }
  return result === "" ? "0" : result;
}

// 扩展：基于大数加法的竖式乘法（更直观，每位乘后整体左移累加）
function bigNumberMultiplyByAdd(num1, num2) {
  if (num1 === "0" || num2 === "0") return "0";

  // 让 num2 为较短者，减少加法次数
  if (num1.length < num2.length) [num1, num2] = [num2, num1];

  let result = "0";
  const m = num2.length;
  for (let i = m - 1; i >= 0; i--) {
    const y = num2.charCodeAt(i) - 48;
    if (y === 0) continue;
    // num1 * y 的单次乘积
    let part = "";
    let carry = 0;
    for (let j = num1.length - 1; j >= 0; j--) {
      const x = num1.charCodeAt(j) - 48;
      const p = x * y + carry;
      part = (p % 10) + part;
      carry = Math.floor(p / 10);
    }
    if (carry > 0) part = carry + part;
    // 末尾补 0，相当于左移 (m - 1 - i) 位
    part += "0".repeat(m - 1 - i);
    result = bigNumberAdd(result, part);
  }
  return result;
}

// 复用大数加法（与 438 题一致）
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

// --- 测试 ---

console.log(bigNumberMultiply("123", "456")); // '56088'
console.log(bigNumberMultiply("2", "3")); // '6'
console.log(bigNumberMultiply("0", "123456")); // '0'
console.log(bigNumberMultiply("999", "999")); // '998001'
console.log(bigNumberMultiply("123456789", "987654321")); // '121932631112635269'
console.log(bigNumberMultiply("99999999999999999999", "99999999999999999999"));
// '9999999999999999999800000000000000000001'

console.log(bigNumberMultiplyByAdd("123", "456")); // '56088'
console.log(bigNumberMultiplyByAdd("999", "999")); // '998001'

// 与 BigInt 对照验证
const a = "123456789012345678901234567890";
const b = "987654321098765432109876543210";
console.log("BigInt check:", (BigInt(a) * BigInt(b)).toString());
// '1219326311370217952261850327336229233322374638011112613526900'
console.log(bigNumberMultiply(a, b));
// 应与上面 BigInt 结果一致
