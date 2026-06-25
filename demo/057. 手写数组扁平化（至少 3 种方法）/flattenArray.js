/**
 * 手写数组扁平化（至少 3 种方法）
 *
 * 核心需求：把多维数组"拉平"成一维数组
 *   例如：[1, [2, [3, [4]]]] => [1, 2, 3, 4]
 *
 * 以下提供 5 种方法，并支持指定深度的扁平化：
 *   1. 递归（手写核心）
 *   2. reduce + 递归
 *   3. 迭代（栈）
 *   4. toString（仅适用于数字数组）
 *   5. 原生 Array.prototype.flat
 */

// ===== 方法 1：递归 + concat =====
// 遍历每个元素，如果是数组则递归处理，否则直接放入结果

function flatten1(arr, depth = Infinity) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatten1(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}

// 优点：思路清晰，支持指定深度
// 缺点：递归深度过大可能栈溢出

// ===== 方法 2：reduce + 递归（函数式风格）=====

function flatten2(arr, depth = Infinity) {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item) && depth > 0) {
      return acc.concat(flatten2(item, depth - 1));
    }
    return acc.concat(item);
  }, []);
}

// 优点：函数式风格，链式友好
// 缺点：concat 每次创建新数组，性能稍差

// ===== 方法 3：迭代（栈）=====
// 用栈模拟递归，避免栈溢出

function flatten3(arr, depth = Infinity) {
  const result = [];
  // 栈中存放 [元素, 当前深度]
  const stack = arr.map((item) => [item, depth]);

  while (stack.length) {
    const [item, d] = stack.pop();
    if (Array.isArray(item) && d > 0) {
      // 注意：因为是从栈顶弹出，要逆序入栈以保持原顺序
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push([item[i], d - 1]);
      }
    } else {
      result.push(item);
    }
  }
  return result;
}

// 优点：不会栈溢出，适合超深嵌套数组
// 缺点：逻辑稍复杂

// ===== 方法 4：toString（仅限数字字符串数组）=====
// 数组 toString 会自动用逗号连接所有元素

function flatten4(arr) {
  return arr
    .toString()
    .split(",")
    .map((item) => Number(item));
}

// 优点：一行代码搞定
// 缺点：只能处理数字，且会丢失类型信息（true 变 1），不通用

// ===== 方法 5：原生 flat =====

function flatten5(arr, depth = Infinity) {
  return arr.flat(depth);
}

// 优点：官方标准，性能最优
// 缺点：IE 不支持（现代开发无需考虑）

// ===== 测试 =====

const nested = [1, [2, [3, [4, [5]]]]];

console.log("========== 数组扁平化 ==========\n");
console.log("原始数组:", nested);

const methods = [
  { name: "递归", fn: flatten1 },
  { name: "reduce 递归", fn: flatten2 },
  { name: "迭代栈", fn: flatten3 },
  { name: "toString", fn: flatten4 },
  { name: "flat 原生", fn: flatten5 },
];

console.log("\n--- 完全扁平化（depth = Infinity）---");
methods.forEach(({ name, fn }) => {
  console.log(`${name}:`, fn(nested)); // [1, 2, 3, 4, 5]
});

console.log("\n--- 指定深度扁平化 ---");
console.log("depth=1:", flatten1(nested, 1)); // [1, 2, [3, [4, [5]]]]
console.log("depth=2:", flatten1(nested, 2)); // [1, 2, 3, [4, [5]]]
console.log("depth=3:", flatten1(nested, 3)); // [1, 2, 3, 4, [5]]

// --- 混合类型数组 ---
console.log("\n--- 混合类型 ---");
const mixed = [1, "a", [true, [null, undefined]]];
console.log("原始:", mixed);
console.log("递归:", flatten1(mixed)); // [1, 'a', true, null, undefined]

// --- 空数组与空槽 ---
console.log("\n--- 边界情况 ---");
console.log("空数组:", flatten1([])); // []
console.log("含空数组:", flatten1([1, [], [2, []]])); // [1, 2]

// --- 总结 ---
console.log("\n========== 总结 ==========");
console.log("推荐优先级：flat 原生 > 递归 > reduce > 迭代栈 > toString");
console.log("flat：生产环境首选，性能好且语义清晰");
console.log("递归：面试常考，体现对递归和边界处理的理解");
console.log("迭代栈：适合处理超深嵌套，避免栈溢出");
console.log("toString：仅适用于纯数字数组，不推荐通用场景");
