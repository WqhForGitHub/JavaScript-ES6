/**
 * 手写图的广度优先遍历（BFS）
 *
 * 广度优先搜索从起点出发，逐层访问邻接节点，使用队列实现。
 * 时间复杂度 O(V+E)，空间 O(V)。
 * 应用：求无权图最短路径、层级遍历、连通分量判断。
 * 本实现使用邻接表，返回遍历顺序，并支持求最短路径（边数）。
 */

class GraphBFS {
  constructor() {
    this.adjList = new Map();
  }

  addEdge(v, w) {
    if (!this.adjList.has(v)) this.adjList.set(v, []);
    if (!this.adjList.has(w)) this.adjList.set(w, []);
    this.adjList.get(v).push(w);
    this.adjList.get(w).push(v); // 无向图
  }

  // BFS 遍历，返回访问顺序
  bfs(start) {
    const visited = new Set();
    const queue = [start];
    const order = [];
    visited.add(start);
    while (queue.length > 0) {
      const v = queue.shift();
      order.push(v);
      for (const neighbor of this.adjList.get(v) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return order;
  }

  // BFS 求无权图从 start 到 target 的最短路径（返回路径数组）
  shortestPath(start, target) {
    const visited = new Set([start]);
    const queue = [start];
    const parent = new Map(); // 记录前驱节点
    while (queue.length > 0) {
      const v = queue.shift();
      if (v === target) {
        // 回溯路径
        const path = [];
        let cur = target;
        while (cur !== undefined) {
          path.unshift(cur);
          cur = parent.get(cur);
        }
        return path;
      }
      for (const neighbor of this.adjList.get(v) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, v);
          queue.push(neighbor);
        }
      }
    }
    return null; // 不可达
  }

  // BFS 分层遍历，返回每一层的节点数组
  bfsLevelOrder(start) {
    const visited = new Set([start]);
    const queue = [start];
    const levels = [];
    while (queue.length > 0) {
      const levelSize = queue.length;
      const level = [];
      for (let i = 0; i < levelSize; i++) {
        const v = queue.shift();
        level.push(v);
        for (const neighbor of this.adjList.get(v) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      levels.push(level);
    }
    return levels;
  }
}

// 测试
const g = new GraphBFS();
// 构建图：  A
//         / \
//        B   C
//       / \   \
//      D   E   F
g.addEdge("A", "B");
g.addEdge("A", "C");
g.addEdge("B", "D");
g.addEdge("B", "E");
g.addEdge("C", "F");

console.log(g.bfs("A")); // ['A', 'B', 'C', 'D', 'E', 'F']
console.log(g.bfsLevelOrder("A")); // [['A'], ['B', 'C'], ['D', 'E', 'F']]

console.log(g.shortestPath("A", "F")); // ['A', 'C', 'F']
console.log(g.shortestPath("A", "E")); // ['A', 'B', 'E']
console.log(g.shortestPath("D", "F")); // ['D', 'B', 'A', 'C', 'F']
