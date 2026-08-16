# 051 - 判断对象是否存在循环引用

> 循环引用：对象的属性直接或间接引用了自身。
> `JSON.stringify` 遇到循环引用会抛出 `TypeError: Converting circular structure to JSON`。

## 问题演示

```js
const obj = { name: '张三' };
obj.self = obj; // 循环引用

// JSON.stringify(obj); // TypeError: Converting circular structure to JSON
```

## 方式一：递归 + Set（保存访问过的对象）

```js
function hasCycle(obj, seen = new Set()) {
  // 非对象类型直接返回 false
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  // 当前对象已访问过 => 存在循环引用
  if (seen.has(obj)) {
    return true;
  }

  // 记录当前对象
  seen.add(obj);

  // 遍历所有属性（需要同一个 seen 贯穿整条路径）
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (hasCycle(obj[key], seen)) {
        return true;
      }
    }
  }

  // 回溯：从当前路径移除（兄弟分支之间不算循环）
  seen.delete(obj);

  return false;
}

// 测试
const normal = { a: { b: { c: 1 } } };
console.log(hasCycle(normal)); // false

const cycled = { a: 1 };
cycled.b = cycled;
console.log(hasCycle(cycled)); // true

// 间接循环：a -> b -> c -> a
const indirect = { a: { b: {} } };
indirect.a.b.c = indirect;
console.log(hasCycle(indirect)); // true

// 兄弟引用同一对象（不是循环）
const shared = { x: 1 };
const siblings = { a: shared, b: shared };
console.log(hasCycle(siblings)); // false（回溯机制保证）
```

## 方式二：WeakMap 标记访问过的对象

```js
function hasCycle(obj) {
  const visited = new WeakMap();

  function detect(value) {
    if (value === null || typeof value !== 'object') return false;
    if (visited.has(value)) return true; // 再次遇到 => 循环
    visited.set(value, true);

    for (const key of Object.keys(value)) {
      if (detect(value[key])) return true;
    }
    return false;
  }

  return detect(obj);
}

const obj2 = { list: [1, 2] };
obj2.list.push(obj2); // 数组内循环
console.log(hasCycle(obj2)); // true
```

> WeakMap 的 key 是弱引用，不会阻止对象被垃圾回收，适合做临时标记。

## 方式三：拓扑染色法（DFS 三色标记）

```js
function hasCycle(obj) {
  const WHITE = 0; // 未访问
  const GRAY = 1; // 当前访问路径上
  const BLACK = 2; // 已完成，确认无环

  const color = new WeakMap();

  function detect(value) {
    if (value === null || typeof value !== 'object') return false;

    const state = color.get(value);
    if (state === GRAY) return true; // 回到正在访问的路径 => 有环
    if (state === BLACK) return false; // 已确认无环的子树，直接跳过

    color.set(value, GRAY); // 标记为路径中
    for (const key of Object.keys(value)) {
      if (detect(value[key])) return true;
    }
    color.set(value, BLACK); // 子树处理完成

    return false;
  }

  return detect(obj);
}
```

## 扩展：检测循环引用并返回引用路径

```js
function findCyclePath(obj, path = new WeakMap(), stack = []) {
  if (obj === null || typeof obj !== 'object') return null;
  if (path.has(obj)) {
    // 找到环，返回从重复节点开始的路径
    const startIndex = stack.indexOf(obj);
    return (
      stack
        .slice(startIndex)
        .map((n, i) => `[${i}]`)
        .join(' -> ') + ' -> 循环点'
    );
  }

  path.set(obj, true);
  stack.push(obj);

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findCyclePath(obj[key], path, stack);
      if (result) return `${key} -> ${result}`;
    }
  }

  stack.pop();
  path.delete(obj);
  return null;
}

const bad = { user: { name: '张三' } };
bad.user.self = bad;
console.log(findCyclePath(bad)); // user -> self -> [0] -> 循环点
```
