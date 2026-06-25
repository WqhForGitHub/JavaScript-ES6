/**
 * 手写图（Graph）——邻接表表示
 *
 * 邻接表为每个顶点维护一个链表/数组，存储与其相邻的边。
 * 优点：空间 O(V+E)，适合稀疏图；查询边需遍历邻接表。
 * 本实现支持有向/无向图、加权边，使用 Map<string, Array> 存储。
 */

class GraphAdjList {
  constructor(directed = false) {
    this.adjList = new Map();
    this.directed = directed;
  }

  addVertex(v) {
    if (!this.adjList.has(v)) {
      this.adjList.set(v, []);
    }
    return this;
  }

  addEdge(v, w, weight = 1) {
    this.addVertex(v);
    this.addVertex(w);
    this.adjList.get(v).push({ vertex: w, weight });
    if (!this.directed) {
      this.adjList.get(w).push({ vertex: v, weight });
    }
  }

  getVertices() {
    return [...this.adjList.keys()];
  }

  getNeighbors(v) {
    return this.adjList.get(v) || [];
  }

  hasEdge(v, w) {
    return this.getNeighbors(v).some((e) => e.vertex === w);
  }

  removeEdge(v, w) {
    const neighbors = this.adjList.get(v);
    if (neighbors) {
      const idx = neighbors.findIndex((e) => e.vertex === w);
      if (idx !== -1) neighbors.splice(idx, 1);
    }
    if (!this.directed) {
      const neighbors2 = this.adjList.get(w);
      if (neighbors2) {
        const idx2 = neighbors2.findIndex((e) => e.vertex === v);
        if (idx2 !== -1) neighbors2.splice(idx2, 1);
      }
    }
  }

  bfs(start) {
    const visited = new Set([start]);
    const queue = [start];
    const result = [];
    while (queue.length > 0) {
      const v = queue.shift();
      result.push(v);
      for (const { vertex } of this.getNeighbors(v)) {
        if (!visited.has(vertex)) {
          visited.add(vertex);
          queue.push(vertex);
        }
      }
    }
    return result;
  }

  dfs(start) {
    const visited = new Set();
    const result = [];
    const visit = (v) => {
      visited.add(v);
      result.push(v);
      for (const { vertex } of this.getNeighbors(v)) {
        if (!visited.has(vertex)) visit(vertex);
      }
    };
    visit(start);
    return result;
  }

  toString() {
    let str = "";
    for (const [v, neighbors] of this.adjList) {
      const edges = neighbors
        .map((e) => `${e.vertex}(${e.weight})`)
        .join(" -> ");
      str += `${v} -> ${edges}\n`;
    }
    return str;
  }
}

// 测试
const g = new GraphAdjList();
g.addEdge("A", "B", 4);
g.addEdge("A", "C", 2);
g.addEdge("B", "C", 5);
g.addEdge("B", "D", 10);
g.addEdge("C", "E", 3);
g.addEdge("D", "F", 11);
g.addEdge("E", "D", 4);

console.log(g.getVertices()); // ['A', 'B', 'C', 'D', 'E', 'F']
console.log(g.hasEdge("A", "B")); // true
console.log(g.hasEdge("A", "D")); // false
console.log(g.getNeighbors("B")); // [{vertex:'C',weight:5},{vertex:'D',weight:10}]

console.log(g.bfs("A")); // ['A', 'B', 'C', 'D', 'E', 'F']
console.log(g.dfs("A")); // ['A', 'B', 'C', 'E', 'D', 'F']

console.log(g.toString());

g.removeEdge("A", "B");
console.log(g.hasEdge("A", "B")); // false
console.log(g.hasEdge("B", "A")); // false (无向图)
