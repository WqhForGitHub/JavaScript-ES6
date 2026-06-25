/**
 * 手写图的深度优先遍历（DFS）
 *
 * 深度优先搜索沿着一条路径尽可能深入，遇到死胡同回溯，使用递归或栈实现。
 * 时间复杂度 O(V+E)，空间 O(V)。
 * 应用：连通分量、环检测、拓扑排序、路径搜索。
 * 本实现同时提供递归版和迭代版（用栈模拟），以及环检测。
 */

class GraphDFS {
  constructor(directed = false) {
    this.adjList = new Map();
    this.directed = directed;
  }

  addEdge(v, w) {
    if (!this.adjList.has(v)) this.adjList.set(v, []);
    if (!this.adjList.has(w)) this.adjList.set(w, []);
    this.adjList.get(v).push(w);
    if (!this.directed) {
      this.adjList.get(w).push(v);
    }
  }

  // 递归 DFS
  dfsRecursive(start) {
    const visited = new Set();
    const result = [];
    const dfs = (v) => {
      visited.add(v);
      result.push(v);
      for (const neighbor of this.adjList.get(v) || []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }
    };
    dfs(start);
    return result;
  }

  // 迭代 DFS（使用栈）
  dfsIterative(start) {
    const visited = new Set();
    const stack = [start];
    const result = [];
    visited.add(start);
    while (stack.length > 0) {
      const v = stack.pop();
      result.push(v);
      // 逆序入栈，保证遍历顺序与递归一致
      const neighbors = (this.adjList.get(v) || []).slice().reverse();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }
    return result;
  }

  // 检测图中是否有环
  hasCycle() {
    const visited = new Set();
    const recStack = new Set();

    const dfs = (v) => {
      visited.add(v);
      recStack.add(v);
      for (const neighbor of this.adjList.get(v) || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
      recStack.delete(v);
      return false;
    };

    for (const v of this.adjList.keys()) {
      if (!visited.has(v)) {
        if (dfs(v)) return true;
      }
    }
    return false;
  }

  // 求从 start 到 target 的所有路径
  findAllPaths(start, target) {
    const visited = new Set();
    const path = [start];
    const result = [];
    const dfs = (v) => {
      if (v === target) {
        result.push([...path]);
        return;
      }
      visited.add(v);
      for (const neighbor of this.adjList.get(v) || []) {
        if (!visited.has(neighbor)) {
          path.push(neighbor);
          dfs(neighbor);
          path.pop();
        }
      }
      visited.delete(v);
    };
    dfs(start);
    return result;
  }
}

// 测试
const g = new GraphDFS();
//   A
//  / \
// B   C
// |   |
// D---E
g.addEdge("A", "B");
g.addEdge("A", "C");
g.addEdge("B", "D");
g.addEdge("C", "E");
g.addEdge("D", "E");

console.log(g.dfsRecursive("A")); // ['A', 'B', 'D', 'E', 'C']
console.log(g.dfsIterative("A")); // ['A', 'B', 'D', 'E', 'C']

console.log(g.findAllPaths("A", "E")); // [['A','B','D','E'], ['A','C','E']]

// 有向图环检测
const dg = new GraphDFS(true);
dg.addEdge("A", "B");
dg.addEdge("B", "C");
dg.addEdge("C", "A");
console.log(dg.hasCycle()); // true

const dag = new GraphDFS(true);
dag.addEdge("A", "B");
dag.addEdge("B", "C");
dag.addEdge("A", "C");
console.log(dag.hasCycle()); // false
