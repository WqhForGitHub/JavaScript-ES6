# 023 - 对象（扁平列表）转换为树形结构

> 常见场景：后端返回扁平数组（每项有 `id` 和 `parentId`），前端需要组装成树。

## 测试数据

```js
const list = [
  { id: 1, name: '部门A', parentId: 0 },
  { id: 2, name: '部门B', parentId: 1 },
  { id: 3, name: '部门C', parentId: 1 },
  { id: 4, name: '部门D', parentId: 2 },
  { id: 5, name: '部门E', parentId: 2 },
  { id: 6, name: '部门F', parentId: 3 },
];
```

## 方式一：Map + 两次遍历（推荐，O(n)）

```js
function listToTree(list, rootId = 0) {
  const nodeMap = new Map(); // id -> 节点（含 children）
  const result = [];

  // 第一次遍历：建立 id -> 节点 的映射
  for (const item of list) {
    nodeMap.set(item.id, { ...item, children: [] });
  }

  // 第二次遍历：挂载父子关系
  for (const item of list) {
    const node = nodeMap.get(item.id);
    if (item.parentId === rootId) {
      result.push(node); // 根节点
    } else {
      const parent = nodeMap.get(item.parentId);
      if (parent) parent.children.push(node);
    }
  }

  return result;
}

console.log(JSON.stringify(listToTree(list), null, 2));
```

输出结构：

```json
[
  {
    "id": 1,
    "name": "部门A",
    "parentId": 0,
    "children": [
      {
        "id": 2,
        "name": "部门B",
        "parentId": 1,
        "children": [
          { "id": 4, "name": "部门D", "parentId": 2, "children": [] },
          { "id": 5, "name": "部门E", "parentId": 2, "children": [] }
        ]
      },
      {
        "id": 3,
        "name": "部门C",
        "parentId": 1,
        "children": [{ "id": 6, "name": "部门F", "parentId": 3, "children": [] }]
      }
    ]
  }
]
```

## 方式二：递归（直观但性能较低，O(n²)）

```js
function listToTree(list, rootId = 0) {
  const tree = [];
  for (const item of list) {
    if (item.parentId === rootId) {
      // 递归查找当前节点的子节点
      const children = listToTree(list, item.id);
      if (children.length) item.children = children;
      tree.push(item);
    }
  }
  return tree;
}

console.log(listToTree(list));
```

> 递归版会修改原数组对象；Map 版不修改原数据（拷贝了节点），推荐方式一。
