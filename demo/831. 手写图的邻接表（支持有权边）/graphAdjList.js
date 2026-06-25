/**
 * 手写图的邻接表（支持有权边）
 * 功能：有向/无向图，支持加权边
 */
class Graph {
  constructor(directed = false) {
    this.directed = directed;
    this.adj = new Map();
  }
  addVertex(v) {
    if (!this.adj.has(v)) this.adj.set(v, []);
  }
  addEdge(from, to, weight = 1) {
    this.addVertex(from);
    this.addVertex(to);
    this.adj.get(from).push({ to, weight });
    if (!this.directed) this.adj.get(to).push({ to: from, weight });
  }
  getNeighbors(v) {
    return this.adj.get(v) || [];
  }
  getVertices() {
    return [...this.adj.keys()];
  }
  getEdgeCount() {
    let count = 0;
    for (const [, edges] of this.adj) count += edges.length;
    return this.directed ? count : count / 2;
  }
  BFS(start) {
    const visited = new Set([start]),
      queue = [start],
      result = [];
    while (queue.length) {
      const v = queue.shift();
      result.push(v);
      for (const { to } of this.getNeighbors(v))
        if (!visited.has(to)) {
          visited.add(to);
          queue.push(to);
        }
    }
    return result;
  }
  DFS(start) {
    const visited = new Set(),
      result = [];
    const dfs = (v) => {
      visited.add(v);
      result.push(v);
      for (const { to } of this.getNeighbors(v)) if (!visited.has(to)) dfs(to);
    };
    dfs(start);
    return result;
  }
  toString() {
    let s = "";
    for (const [v, edges] of this.adj) {
      s +=
        v +
        " -> " +
        edges.map((e) => e.to + "(" + e.weight + ")").join(", ") +
        "\n";
    }
    return s;
  }
}
// ===== 测试 =====
const g = new Graph(false);
g.addEdge("A", "B", 4);
g.addEdge("A", "C", 2);
g.addEdge("B", "C", 1);
g.addEdge("B", "D", 5);
g.addEdge("C", "D", 3);
console.log("邻接表:");
console.log(g.toString());
console.log("BFS from A:", g.BFS("A"));
console.log("DFS from A:", g.DFS("A"));
console.log("边数:", g.getEdgeCount());
