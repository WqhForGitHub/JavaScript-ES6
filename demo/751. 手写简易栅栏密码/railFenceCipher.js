/**
 * 手写简易栅栏密码
 *
 * 功能：实现栅栏密码（Rail Fence Cipher），一种经典的换位密码
 *       将明文按「之」字形排列在多条「栅栏」上，再逐行读出
 *
 * 实现思路：
 *   1. 用 rails 行数构造之字形排列
 *      位置 i 的行号 = 0,1,2,...,r-1,r-2,...,1,0,1,2,... 周期为 2*(r-1)
 *   2. 加密：按行顺序拼接字符
 *   3. 解密：先计算每行字符数，再按之字形从密文填回原位置
 */

// 计算 index 在之字形中的行号（0-based）
function getRow(index, rails) {
  const cycle = 2 * (rails - 1);
  if (cycle === 0) return 0;
  const pos = index % cycle;
  return pos < rails ? pos : cycle - pos;
}

function encrypt(plaintext, rails) {
  if (rails < 2) return plaintext;
  // 构造每行字符数组
  const rows = Array.from({ length: rails }, () => []);
  for (let i = 0; i < plaintext.length; i++) {
    rows[getRow(i, rails)].push(plaintext[i]);
  }
  return rows.map((r) => r.join("")).join("");
}

function decrypt(ciphertext, rails) {
  if (rails < 2) return ciphertext;

  // 1. 计算每行字符数
  const rowLen = new Array(rails).fill(0);
  for (let i = 0; i < ciphertext.length; i++) {
    rowLen[getRow(i, rails)]++;
  }
  // 2. 按行切分密文
  const rows = [];
  let offset = 0;
  for (let r = 0; r < rails; r++) {
    rows.push(ciphertext.slice(offset, offset + rowLen[r]).split(""));
    offset += rowLen[r];
  }
  // 3. 按之字形读回
  const rowIdx = new Array(rails).fill(0);
  let result = "";
  for (let i = 0; i < ciphertext.length; i++) {
    const r = getRow(i, rails);
    result += rows[r][rowIdx[r]++];
  }
  return result;
}

// ===== 测试 =====
console.log("=== 手写简易栅栏密码 ===");

// 经典示例：WEAREDISCOVEREDFLEEATONCE, rails=3
const plain = "WEAREDISCOVEREDFLEEATONCE";
const rails = 3;

const cipher = encrypt(plain, rails);
console.log("明文:", plain);
console.log("密文 (rails=3):", cipher);
// 预期: WECRLTEERDSOEEFEAOCAIVDEN

const decrypted = decrypt(cipher, rails);
console.log("解密:", decrypted);
// 预期: WEAREDISCOVEREDFLEEATONCE
console.log("加解密一致:", decrypted === plain); // 预期: true

// 之字形排列可视化
console.log("\n之字形排列 (rails=3):");
for (let r = 0; r < rails; r++) {
  let line = `行${r}: `;
  for (let i = 0; i < plain.length; i++) {
    line += getRow(i, rails) === r ? plain[i] : " ";
  }
  console.log(line);
}
// 预期:
// 行0: W   E   C   R   L   T   E
// 行1:  E R D S O E E F E A O C
// 行2:    A   I   V   D   E   N

// 不同 rails 数
console.log("\nrails=2:", encrypt("HELLO WORLD", 2)); // 预期: HLOOL ELWRD
console.log("解密:", decrypt(encrypt("HELLO WORLD", 2), 2)); // 预期: HELLO WORLD
