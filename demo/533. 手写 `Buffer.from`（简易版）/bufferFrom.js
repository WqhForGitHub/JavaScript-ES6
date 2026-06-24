/**
 * 手写 `Buffer.from`（简易版）
 *
 * 作用：模拟 Node.js 的 Buffer.from，把多种来源（字符串、数组、ArrayBuffer、Buffer）转换为 Buffer。
 *       Buffer 本质是一段固定长度的字节序列，本实现用一个 Uint8Array 子类来模拟。
 *
 * 实现思路：
 *   - 用 Uint8Array 作为底层字节存储（与 Node Buffer 内存布局一致）
 *   - 按入参类型分支处理：
 *       string + encoding：按指定编码把字符串编码为字节（这里用 TextEncoder 处理 utf-8，
 *                          并模拟 utf-16le、ascii、base64 等编码）
 *       Array：当作字节数组直接拷贝
 *       ArrayBuffer/TypedArray：按字节拷贝
 *       Buffer：复制副本
 *   - 返回 MyBuffer 实例，附带 toString/length 等
 */

// 简易 base64 解码
function base64ToBytes(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = str.replace(/=+$/, '');
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of clean) {
    const idx = chars.indexOf(ch);
    if (idx === -1) continue;
    buffer = (buffer << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

class MyBuffer extends Uint8Array {
  constructor(arg) {
    if (typeof arg === 'number') {
      super(arg); // 分配长度
    } else if (Array.isArray(arg) || arg instanceof ArrayBuffer) {
      super(arg);
    } else if (arg instanceof Uint8Array) {
      super(arg.length);
      this.set(arg);
    } else {
      super(0);
    }
  }

  toString(encoding = 'utf8') {
    if (encoding === 'utf8' || encoding === 'utf-8') {
      return new TextDecoder('utf-8').decode(this);
    }
    if (encoding === 'ascii' || encoding === 'latin1') {
      let s = '';
      for (let i = 0; i < this.length; i++) s += String.fromCharCode(this[i] & 0x7f);
      return s;
    }
    if (encoding === 'base64') {
      return bytesToBase64(this);
    }
    if (encoding === 'hex') {
      let s = '';
      for (let i = 0; i < this.length; i++) s += this[i].toString(16).padStart(2, '0');
      return s;
    }
    return new TextDecoder('utf-8').decode(this);
  }
}

function bytesToBase64(bytes) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    result += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + chars[n & 63];
  }
  const remain = bytes.length - i;
  if (remain === 1) {
    const n = bytes[i] << 16;
    result += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + '==';
  } else if (remain === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    result += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + '=';
  }
  return result;
}

function bufferFrom(value, encodingOrOffset) {
  // 1. 字符串
  if (typeof value === 'string') {
    const encoding = typeof encodingOrOffset === 'string' ? encodingOrOffset : 'utf8';
    let bytes;
    if (encoding === 'utf8' || encoding === 'utf-8') {
      bytes = Array.from(new TextEncoder().encode(value));
    } else if (encoding === 'ascii' || encoding === 'latin1') {
      bytes = [];
      for (let i = 0; i < value.length; i++) bytes.push(value.charCodeAt(i) & 0xff);
    } else if (encoding === 'base64') {
      bytes = base64ToBytes(value);
    } else if (encoding === 'hex') {
      bytes = [];
      for (let i = 0; i + 1 < value.length; i += 2) bytes.push(parseInt(value.slice(i, i + 2), 16));
    } else if (encoding === 'utf16le' || encoding === 'ucs2') {
      bytes = [];
      for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);
        bytes.push(code & 0xff, (code >> 8) & 0xff);
      }
    } else {
      bytes = Array.from(new TextEncoder().encode(value));
    }
    const buf = new MyBuffer(bytes.length);
    for (let i = 0; i < bytes.length; i++) buf[i] = bytes[i];
    return buf;
  }

  // 2. 数组
  if (Array.isArray(value)) {
    const buf = new MyBuffer(value.length);
    for (let i = 0; i < value.length; i++) buf[i] = value[i] & 0xff;
    return buf;
  }

  // 3. ArrayBuffer
  if (value instanceof ArrayBuffer) {
    const view = new Uint8Array(value);
    const buf = new MyBuffer(view.length);
    buf.set(view);
    return buf;
  }

  // 4. 另一个 Buffer / TypedArray
  if (value instanceof Uint8Array) {
    const buf = new MyBuffer(value.length);
    buf.set(value);
    return buf;
  }

  throw new TypeError('Unsupported type for Buffer.from');
}

// ===== 测试 =====

// 字符串 -> utf-8
const b1 = bufferFrom('hello');
console.log('utf8 bytes:', Array.from(b1)); // [104, 101, 108, 108, 111]
console.log('utf8 length:', b1.length); // 5
console.log('back to string:', b1.toString()); // 'hello'

// 中文字符串
const b2 = bufferFrom('你好');
console.log('中文 utf8 bytes:', Array.from(b2)); // [228, 189, 160, 229, 165, 189]
console.log('中文 length:', b2.length); // 6

// base64
const b3 = bufferFrom('aGVsbG8=', 'base64');
console.log('base64 decode:', b3.toString()); // 'hello'

// hex
const b4 = bufferFrom('68656c6c6f', 'hex');
console.log('hex decode:', b4.toString()); // 'hello'

// ascii
const b5 = bufferFrom('abc', 'ascii');
console.log('ascii bytes:', Array.from(b5)); // [97, 98, 99]

// 数组
const b6 = bufferFrom([1, 2, 3, 255]);
console.log('from array:', Array.from(b6)); // [1, 2, 3, 255]

// ArrayBuffer
const ab = new ArrayBuffer(3);
new Uint8Array(ab).set([10, 20, 30]);
const b7 = bufferFrom(ab);
console.log('from ArrayBuffer:', Array.from(b7)); // [10, 20, 30]

// 复制 Buffer（修改副本不影响原）
const b8 = bufferFrom(b1);
b8[0] = 72;
console.log('copy modified:', b8.toString()); // 'Hello'
console.log('original unchanged:', b1.toString()); // 'hello'

// base64 编码验证
console.log('encode to base64:', bytesToBase64(bufferFrom('hello'))); // 'aGVsbG8='
