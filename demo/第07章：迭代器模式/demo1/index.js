// 第07章：迭代器模式 - 内部迭代器与外部迭代器

// ========== 内部迭代器 ==========
console.log('===== 内部迭代器 =====');

const each = function (ary, callback) {
  for (let i = 0, l = ary.length; i < l; i++) {
    callback.call(ary[i], ary[i], i); // 把 ary[i] 作为 callback 的 this
  }
};

each([1, 2, 3, 4], function (item, index) {
  console.log('索引', index, '：', item);
});

// 内部迭代器的 compare 函数
const compare = function (ary1, ary2) {
  if (ary1.length !== ary2.length) {
    console.log('两个数组不相等');
    return;
  }
  each(ary1, function (item, index) {
    if (item !== ary2[index]) {
      console.log('两个数组不相等');
      return;
    }
  });
  console.log('两个数组相等');
};

console.log('\n--- 内部迭代器比较数组 ---');
compare([1, 2, 3], [1, 2, 3]); // 相等
compare([1, 2, 3], [1, 2, 4]); // 不相等

// 注意：内部迭代器中，each 的 callback 如果 return false，并不能中断 each 循环
// 因为 each 内部没有检查 callback 的返回值

// ========== 外部迭代器 ==========
console.log('\n===== 外部迭代器 =====');

const Iterator = function (obj) {
  let current = 0;

  const next = function () {
    current += 1;
  };

  const isDone = function () {
    return current >= obj.length;
  };

  const getCurrItem = function () {
    return obj[current];
  };

  return {
    next: next,
    isDone: isDone,
    getCurrItem: getCurrItem,
  };
};

// 使用外部迭代器遍历数组
console.log('\n--- 使用外部迭代器遍历 ---');
const iter = Iterator([10, 20, 30]);
while (!iter.isDone()) {
  console.log('当前项：', iter.getCurrItem());
  iter.next();
}

// 使用外部迭代器的 compare 函数
const compare2 = function (iterator1, iterator2) {
  while (!iterator1.isDone() && !iterator2.isDone()) {
    if (iterator1.getCurrItem() !== iterator2.getCurrItem()) {
      console.log('两个数组不相等');
      return;
    }
    iterator1.next();
    iterator2.next();
  }
  console.log('两个数组相等');
};

console.log('\n--- 外部迭代器比较数组 ---');
const iter1 = Iterator([1, 2, 3]);
const iter2 = Iterator([1, 2, 3]);
compare2(iter1, iter2); // 相等

const iter3 = Iterator([1, 2, 3]);
const iter4 = Iterator([1, 2, 4]);
compare2(iter3, iter4); // 不相等

// ========== 内部迭代器 vs 外部迭代器 ==========
console.log('\n===== 内部迭代器 vs 外部迭代器 =====');
console.log(
  '内部迭代器：调用简单，但迭代规则已在内部写死，无法灵活控制迭代过程'
);
console.log('外部迭代器：调用稍复杂，但可以手动控制迭代过程，更灵活');
