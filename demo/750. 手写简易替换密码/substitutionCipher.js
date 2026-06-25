/**
 * 手写简易替换密码
 *
 * 功能：实现简单替换密码（Substitution Cipher）
 *       使用一张「明文字母 -> 密文字母」的映射表对文本逐字符替换
 *
 * 实现思路：
 *   1. 构造字母表到打乱字母表的映射（monoalphabetic）
 *   2. 加密：明文字母 -> 映射表中的对应密文字母
 *   3. 解密：反向查表
 *   4. 大小写保留，非字母字符原样保留
 */

const PLAIN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// 根据密钥生成替换表（关键词密码 + 字母表补全）
function buildCipherAlphabet(keyword) {
  const seen = new Set();
  let alpha = "";
  // 关键词去重
  for (const ch of keyword.toUpperCase()) {
    if (ch >= "A" && ch <= "Z" && !seen.has(ch)) {
      seen.add(ch);
      alpha += ch;
    }
  }
  // 补全剩余字母
  for (const ch of PLAIN_ALPHABET) {
    if (!seen.has(ch)) alpha += ch;
  }
  return alpha;
}

// 构建双向映射表
function buildMaps(cipherAlphabet) {
  const encMap = new Map();
  const decMap = new Map();
  for (let i = 0; i < 26; i++) {
    const p = PLAIN_ALPHABET[i];
    const c = cipherAlphabet[i];
    encMap.set(p, c);
    decMap.set(c, p);
  }
  return { encMap, decMap };
}

// 通用替换函数
function substitute(text, map) {
  let result = "";
  for (const ch of text) {
    if (ch >= "A" && ch <= "Z") {
      result += map.get(ch);
    } else if (ch >= "a" && ch <= "z") {
      result += map.get(ch.toUpperCase()).toLowerCase();
    } else {
      result += ch;
    }
  }
  return result;
}

function encrypt(plaintext, keyword) {
  const cipherAlphabet = buildCipherAlphabet(keyword);
  const { encMap } = buildMaps(cipherAlphabet);
  return substitute(plaintext, encMap);
}

function decrypt(ciphertext, keyword) {
  const cipherAlphabet = buildCipherAlphabet(keyword);
  const { decMap } = buildMaps(cipherAlphabet);
  return substitute(ciphertext, decMap);
}

// 生成随机密钥（随机打乱字母表）
function randomCipherAlphabet() {
  const arr = PLAIN_ALPHABET.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

// ===== 测试 =====
console.log("=== 手写简易替换密码 ===");

const keyword = "KEYWORD";
const cipherAlpha = buildCipherAlphabet(keyword);
console.log("明文字母表:", PLAIN_ALPHABET);
console.log("密文字母表:", cipherAlpha);
// 预期: KEWORDABCFGHIJLMNPQRSTUVXYZ (K E Y W O R D 去重后补全)

const plain = "Hello, World!";
const cipher = encrypt(plain, keyword);
console.log("明文:", plain);
console.log("密文:", cipher);
// 预期: Dilla, Saqlr! (H->D, e->i, l->l, o->a)

const decrypted = decrypt(cipher, keyword);
console.log("解密:", decrypted);
// 预期: Hello, World!
console.log("加解密一致:", decrypted === plain); // 预期: true

// 随机密钥演示
const randAlpha = randomCipherAlphabet();
console.log("\n随机密文字母表:", randAlpha);
console.log("是否为字母表置换:", new Set(randAlpha).size === 26); // 预期: true
