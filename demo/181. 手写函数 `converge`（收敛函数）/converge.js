/**
 * 手写函数 converge（收敛函数）
 *
 * 作用：
 *   - converge(converger, branches)(x) =
 *       converger(branch1(x), branch2(x), ..., branchN(x))
 *   - 把同一个输入分发到多个分支函数，再把各分支结果汇总到一个收敛函数
 *   - 典型场景：求平均（sum / count）、复杂计算的分治
 *   - Ramda 中为 R.converge
 *
 * 实现思路：
 *   1. 收到输入后，对每个分支函数调用，得到结果数组
 *   2. 把结果数组展开传给 converger
 */

function converge(converger, branches) {
  return function (...args) {
    // 每个分支接收同样的输入，得到各自结果
    const branchResults = branches.map((branch) => branch.apply(this, args));
    // 把所有分支结果传给收敛函数
    return converger.apply(this, branchResults);
  };
}

// ===== 测试 =====

// 经典：求平均 = sum / count
const sum = (list) => list.reduce((a, b) => a + b, 0);
const length = (list) => list.length;
const divide = (a, b) => a / b;

const average = converge(divide, [sum, length]);
console.log(average([1, 2, 3, 4])); // 2.5
console.log(average([10, 20, 30])); // 20

// 求和并附带数量与最大值
const max = (list) => Math.max(...list);
const summarize = converge(
  (s, len, mx) => ({ sum: s, count: len, max: mx, avg: s / len }),
  [sum, length, max],
);
console.log(summarize([1, 2, 3, 4, 5]));
// { sum: 15, count: 5, max: 5, avg: 3 }

// 字符串：取首尾字符拼接
const first = (s) => s[0];
const last = (s) => s[s.length - 1];
const concat = (...parts) => parts.join("");
const initials = converge(concat, [first, last]);
console.log(initials("hello")); // 'ho'
console.log(initials("world")); // 'wd'

// 多分支：求成绩的等级
const score = (student) => student.score;
const name = (student) => student.name;
const grade = (s) => (s >= 90 ? "A" : s >= 60 ? "B" : "C");
const report = converge(
  (n, s, g) => `${n}: ${s} (${g})`,
  [name, score, (stu) => grade(stu.score)],
);
console.log(report({ name: "Tom", score: 95 })); // 'Tom: 95 (A)'
console.log(report({ name: "Jerry", score: 70 })); // 'Jerry: 70 (B)'

// 与 uncurry / compose 配合
const result = converge((a, b) => a + b, [(x) => x * 2, (x) => x * 3]);
console.log(result(5)); // 25 = 10 + 15

// 应用：判断数组是否单调（递增且非空）
const isIncreasing = (list) =>
  list.every((v, i) => i === 0 || list[i - 1] <= v);
const isNonEmpty = (list) => list.length > 0;
const isMonotonic = converge(
  (inc, nonEmpty) => inc && nonEmpty,
  [isIncreasing, isNonEmpty],
);
console.log(isMonotonic([1, 2, 3])); // true
console.log(isMonotonic([3, 2, 1])); // false
console.log(isMonotonic([])); // false

// 收敛后再链式（用 compose）
function compose(...fns) {
  return (x) => fns.reduceRight((acc, f) => f(acc), x);
}
const roundedAvg = compose(
  (x) => Math.round(x),
  converge(divide, [sum, length]),
);
console.log(roundedAvg([1, 2, 3, 4])); // 3（2.5 四舍五入）
