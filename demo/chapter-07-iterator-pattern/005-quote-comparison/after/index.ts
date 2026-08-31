// 改后：迭代器模式 -- 外部迭代器手动 next() 推进，两份报价单步调一致地逐项核对

const oldQuote = ['需求分析', 'UI 设计', '前端开发', '后端开发', '部署上线'];
const newQuote = ['需求分析', 'UI 设计', '测试验收', '后端开发', '部署上线'];

// 外部迭代器：把"前进的时机"交还给调用方
function createIterator<T>(list: T[]) {
  let index = 0;
  return {
    next(): IteratorResult<T> {
      if (index < list.length) {
        return { value: list[index++], done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

// 两个迭代器并排推进，像两个人拿着清单逐行核对
function diffQuote<T>(
  oldIter: { next(): IteratorResult<T> },
  newIter: { next(): IteratorResult<T> },
): string {
  let step = 1;
  while (true) {
    const a = oldIter.next();
    const b = newIter.next();

    if (a.done && b.done) return '两份报价单完全一致';
    if (a.done || b.done) return '两份报价单条目数量不同';
    if (a.value !== b.value) {
      return `第 ${step} 项不同：${a.value} -> ${b.value}`; // 发现即停
    }
    step++;
  }
}

console.log(diffQuote(createIterator(oldQuote), createIterator(newQuote)));
// 第 3 项不同：前端开发 -> 测试验收（只核对了 3 项就停）

console.log(diffQuote(createIterator(oldQuote), createIterator(oldQuote)));
// 两份报价单完全一致

console.log(diffQuote(createIterator(['需求分析']), createIterator(newQuote)));
// 两份报价单条目数量不同

// 优势：
// 1. next() 由调用方驱动，发现第一处差异立即返回，零浪费
// 2. 两个（甚至多个）集合并排协同迭代，内部迭代器做不到
// 3. 迭代节奏完全可控：跳项、暂停、提前退出都随心
// 4. diffQuote 只依赖迭代协议，传入任何可迭代的数据源都能用

export {};
