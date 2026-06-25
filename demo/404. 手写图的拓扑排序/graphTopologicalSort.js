/**
 * 手写图的拓扑排序
 *
 * 拓扑排序用于有向无环图（DAG），将所有顶点排成线性序列，
 * 使得对每条边 u->v，u 在序列中位于 v 之前。
 * 本实现提供两种方法：
 *   1. Kahn 算法（基于入度的 BFS）：每次取入度为 0 的节点入队。
 *   2. DFS 后序逆序：递归完成后将节点逆序输出。
 * 若存在环，Kahn 算法无法输出全部节点。
 */

class TopologicalSort {
  constructor() {
    this.adjList = new Map();
    this.inDegree = new Map();
  }

  addEdge(v, w) {
    if (!this.adjList.has(v)) {
      this.adjList.set(v, []);
      this.inDegree.set(v, 0);
    }
    if (!this.adjList.has(w)) {
      this.adjList.set(w, []);
      this.inDegree.set(w, 0);
    }
    this.adjList.get(v).push(w);
    this.inDegree.set(w, this.inDegree.get(w) + 1);
  }

  // Kahn 算法（BFS）
  kahnSort() {
    const inDegree = new Map(this.inDegree);
    const queue = [];
    for (const [v, deg] of inDegree) {
      if (deg === 0) queue.push(v);
    }
    const result = [];
    while (queue.length > 0) {
      const v = queue.shift();
      result.push(v);
      for (const neighbor of this.adjList.get(v) || []) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }
    // 若结果数量少于节点总数，说明有环
    if (result.length !== this.adjList.size) {
      return { order: null, hasCycle: true };
    }
    return { order: result, hasCycle: false };
  }

  // DFS 后序逆序
  dfsSort() {
    const visited = new Set();
    const result = [];
    const visiting = new Set();
    let hasCycle = false;

    const dfs = (v) => {
      if (visiting.has(v)) {
        hasCycle = true;
        return;
      }
      if (visited.has(v)) return;
      visiting.add(v);
      for (const neighbor of this.adjList.get(v) || []) {
        dfs(neighbor);
      }
      visiting.delete(v);
      visited.add(v);
      result.unshift(v); // 后序，头部插入实现逆序
    };

    for (const v of this.adjList.keys()) {
      if (!visited.has(v)) dfs(v);
    }
    return { order: hasCycle ? null : result, hasCycle };
  }
}

// 测试：课程依赖关系
// 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3, 3 -> 4
const ts = new TopologicalSort();
ts.addEdge("课程0", "课程1");
ts.addEdge("课程0", "课程2");
ts.addEdge("课程1", "课程3");
ts.addEdge("课程2", "课程3");
ts.addEdge("课程3", "课程4");

console.log(ts.kahnSort());
// { order: ['课程0', '课程1', '课程2', '课程3', '课程4'], hasCycle: false }

console.log(ts.dfsSort());
// { order: ['课程0', '课程2', '课程1', '课程3', '课程4'], hasCycle: false }

// 含环的图
const cyclic = new TopologicalSort();
cyclic.addEdge("A", "B");
cyclic.addEdge("B", "C");
cyclic.addEdge("C", "A");
console.log(cyclic.kahnSort()); // { order: null, hasCycle: true }
console.log(cyclic.dfsSort()); // { order: null, hasCycle: true }
