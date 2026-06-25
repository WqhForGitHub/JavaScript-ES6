/**
 * 手写 `Buffer.concat`
 *
 * 作用：模拟 Node.js 的 Buffer.concat(list, totalLength)。
 *       将多个 Buffer 拼接成一个新的 Buffer。如果提供了 totalLength 可以避免遍历求和的开销。
 *
 * 实现思路：
 *   1. list 必须是数组，元素为类 Buffer（有 length 且按下标取字节）
 *   2. 计算 totalLength：若未传则遍历 list 累加每个 buf.length
 *   3. 分配 totalLength 字节的新 Buffer
 *   4. 依次把每个 buf 的字节拷贝到新 Buffer 中，维护偏移量 offset
 *   5. 返回拼接后的 Buffer
 *
 * 边界：
 *   - totalLength 为 0 时返回空 Buffer
 *   - list 为空时返回空 Buffer
 *   - totalLength 小于实际总和时，只拷贝前 totalLength 字节（与 Node 行为一致）
 */

class MyBuffer extends Uint8Array {
  constructor(arg) {
    if (typeof arg === "number") super(arg);
    else if (Array.isArray(arg)) super(arg);
    else if (arg instanceof ArrayBuffer) super(arg);
    else if (arg instanceof Uint8Array) {
      super(arg.length);
      this.set(arg);
    } else super(0);
  }

  toString(encoding = "utf8") {
    return new TextDecoder("utf-8").decode(this);
  }
}

function bufferConcat(list, totalLength) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }

  // 校验元素类型
  for (const item of list) {
    if (!(item instanceof Uint8Array) && !Array.isArray(item)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
  }

  // 计算 totalLength
  if (totalLength === undefined) {
    totalLength = 0;
    for (const buf of list) totalLength += buf.length;
  } else if (typeof totalLength !== "number" || totalLength < 0) {
    throw new TypeError('"totalLength" argument must be a non-negative number');
  }

  // 空结果
  if (list.length === 0 || totalLength === 0) {
    return new MyBuffer(0);
  }

  const result = new MyBuffer(totalLength);
  let offset = 0;

  for (const buf of list) {
    const len = Math.min(buf.length, totalLength - offset);
    if (len <= 0) break;
    for (let i = 0; i < len; i++) {
      result[offset + i] = buf[i];
    }
    offset += len;
  }

  return result;
}

// ===== 测试 =====

// 拼接多个 Buffer
const a = new MyBuffer([1, 2, 3]);
const b = new MyBuffer([4, 5, 6, 7]);
const c = new MyBuffer([8, 9]);

const r1 = bufferConcat([a, b, c]);
console.log("concat bytes:", Array.from(r1)); // [1,2,3,4,5,6,7,8,9]
console.log("length:", r1.length); // 9

// 拼接字符串 Buffer
const s1 = new MyBuffer(Array.from(new TextEncoder().encode("Hello, ")));
const s2 = new MyBuffer(Array.from(new TextEncoder().encode("World!")));
const r2 = bufferConcat([s1, s2]);
console.log("concat string:", r2.toString()); // 'Hello, World!'

// 空数组
const r3 = bufferConcat([]);
console.log("empty concat length:", r3.length); // 0

// 指定 totalLength 大于实际
const r4 = bufferConcat([a, b], 20);
console.log("totalLength > actual:", Array.from(r4)); // [1,2,3,4,5,6,7,0,0,0,0,0,0,0,0,0,0,0,0,0]
console.log("length:", r4.length); // 20

// 指定 totalLength 小于实际（只拷贝前 N 字节）
const r5 = bufferConcat([a, b, c], 5);
console.log("totalLength < actual:", Array.from(r5)); // [1,2,3,4,5]

// 传入 Uint8Array（非 MyBuffer 也能用）
const r6 = bufferConcat([new Uint8Array([10, 20]), new Uint8Array([30])]);
console.log("concat Uint8Array:", Array.from(r6)); // [10, 20, 30]

// 大量小 Buffer 拼接
const parts = [];
for (let i = 0; i < 5; i++) parts.push(new MyBuffer([i]));
const r7 = bufferConcat(parts);
console.log("concat many:", Array.from(r7)); // [0, 1, 2, 3, 4]
