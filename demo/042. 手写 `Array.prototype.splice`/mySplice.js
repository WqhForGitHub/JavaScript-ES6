/**
 * 手写 Array.prototype.splice
 *
 * 作用：从 start 位置开始删除 deleteCount 个元素，并在该位置插入若干新元素，
 *       原地修改数组，返回被删除元素组成的数组。
 *
 * 参数说明：
 *   - start：起始下标；负数则 len + start；超过 len 则取 len
 *   - deleteCount：删除个数；缺省（仅传 start）则删到末尾；超过可删数量则截断
 *   - 第 3 个及之后的参数：要插入的新元素
 *
 * 实现思路：
 *   1. 规范化 start 与 deleteCount
 *   2. 收集要插入的元素 items，并记录被删除的元素 removed
 *   3. 计算插入数量与删除数量的差值 diff = items.length - deleteCount
 *      - diff > 0：需要把尾部元素整体后移 diff 位（从后往前搬，避免覆盖）
 *      - diff < 0：需要把尾部元素整体前移 |diff| 位（从前往后搬）
 *   4. 调整数组长度，再把新元素写入 start 位置
 *   5. 返回 removed
 */

Array.prototype.mySplice = function (start, deleteCount) {
  const len = this.length;

  // 规范化 start
  let s = Number(start);
  if (isNaN(s)) s = 0;
  if (s < 0) {
    s = len + s;
    if (s < 0) s = 0;
  } else if (s > len) {
    s = len;
  }

  // 规范化 deleteCount
  let dc;
  if (arguments.length <= 1) {
    dc = len - s;
  } else {
    dc = Number(deleteCount);
    if (isNaN(dc) || dc < 0) dc = 0;
    if (dc > len - s) dc = len - s;
  }

  // 收集要插入的元素
  const items = [];
  for (let i = 2; i < arguments.length; i++) {
    items[items.length] = arguments[i];
  }

  // 记录被删除的元素
  const removed = [];
  for (let i = 0; i < dc; i++) {
    removed[removed.length] = this[s + i];
  }

  const insertCount = items.length;
  const diff = insertCount - dc;

  // 移动尾部元素
  if (diff > 0) {
    // 后移：从后往前搬，避免覆盖
    for (let i = len - 1; i >= s + dc; i--) {
      this[i + diff] = this[i];
    }
  } else if (diff < 0) {
    // 前移：从前往后搬
    for (let i = s + dc; i < len; i++) {
      this[i + diff] = this[i];
    }
  }

  // 调整长度
  if (diff !== 0) {
    this.length = len + diff;
  }

  // 写入新元素
  for (let i = 0; i < insertCount; i++) {
    this[s + i] = items[i];
  }

  return removed;
};

// ===== 测试 =====

// --- 仅删除 ---
console.log([1, 2, 3, 4, 5].mySplice(1, 2)); // [2, 3]
let a = [1, 2, 3, 4, 5];
a.mySplice(1, 2);
console.log(a); // [1, 4, 5]

// --- 仅传 start：删到末尾 ---
let b = [1, 2, 3, 4, 5];
console.log(b.mySplice(2)); // [3, 4, 5]
console.log(b); // [1, 2]

// --- 删除并插入（替换）---
let c = [1, 2, 3, 4, 5];
console.log(c.mySplice(1, 2, "a", "b")); // [2, 3]
console.log(c); // [1, 'a', 'b', 4, 5]

// --- 插入数量多于删除数量（数组变长）---
let d = [1, 2, 3];
console.log(d.mySplice(1, 1, "x", "y", "z")); // [2]
console.log(d); // [1, 'x', 'y', 'z', 3]

// --- 插入数量少于删除数量（数组变短）---
let e = [1, 2, 3, 4, 5];
console.log(e.mySplice(1, 3, "x")); // [2, 3, 4]
console.log(e); // [1, 'x', 5]

// --- 仅插入（deleteCount = 0）---
let f = [1, 2, 3];
console.log(f.mySplice(1, 0, "a", "b")); // []
console.log(f); // [1, 'a', 'b', 2, 3]

// --- 负数 start ---
let g = [1, 2, 3, 4, 5];
console.log(g.mySplice(-2, 1)); // [4]
console.log(g); // [1, 2, 3, 5]

// --- start 超过长度 ---
let h = [1, 2, 3];
console.log(h.mySplice(10, 1, "end")); // []
console.log(h); // [1, 2, 3, 'end']
