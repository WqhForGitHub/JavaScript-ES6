// 改前：用 forEach（内部迭代器）比对两份报价单，迭代节奏完全不受你控制

const oldQuote = ['需求分析', 'UI 设计', '前端开发', '后端开发', '部署上线'];
const newQuote = ['需求分析', 'UI 设计', '测试验收', '后端开发', '部署上线'];

// forEach 是内部迭代器：规则写死在内部，遍历必须一口气跑完
let firstDiff = '';
oldQuote.forEach((item, index) => {
  if (item !== newQuote[index] && !firstDiff) {
    firstDiff = `第 ${index + 1} 项不同：${item} -> ${newQuote[index]}`;
    // 已经发现第一处不同了，但 forEach 停不下来，剩下的项照样比一遍
  }
});
console.log(firstDiff); // 第 3 项不同：前端开发 -> 测试验收

// 问题：
// 1. 内部迭代器不能中断，发现差异后剩余比对全是浪费
// 2. 两个集合无法"步调一致"地协同迭代，只能靠下标硬凑
// 3. 迭代节奏（什么时候前进、什么时候停）完全不可控
// 4. 想在"并排核对两个清单"的场景里复用遍历逻辑？无从下手

export {};
