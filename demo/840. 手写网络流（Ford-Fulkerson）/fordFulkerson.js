/**
 * 手写网络流（Ford-Fulkerson / Edmonds-Karp）
 * 功能：求最大流
 * 实现：BFS 找增广路，累加流量
 */
function bfs(rGraph, s, t, parent) {
  const n = rGraph.length;
  const visited = new Array(n).fill(false);
  const queue = [s];
  visited[s] = true;
  while (queue.length) {
    const u = queue.shift();
    for (let v = 0; v < n; v++) {
      if (!visited[v] && rGraph[u][v] > 0) {
        visited[v] = true;
        parent[v] = u;
        queue.push(v);
        if (v === t) return true;
      }
    }
  }
  return false;
}
function fordFulkerson(graph, source, sink) {
  const n = graph.length;
  const rGraph = graph.map((r) => [...r]);
  const parent = new Array(n).fill(-1);
  let maxFlow = 0;
  while (bfs(rGraph, source, sink, parent)) {
    let pathFlow = Infinity;
    for (let v = sink; v !== source; v = parent[v])
      pathFlow = Math.min(pathFlow, rGraph[parent[v]][v]);
    for (let v = sink; v !== source; v = parent[v]) {
      rGraph[parent[v]][v] -= pathFlow;
      rGraph[v][parent[v]] += pathFlow;
    }
    maxFlow += pathFlow;
  }
  return maxFlow;
}
// ===== 测试 =====
const graph = [
  [0, 16, 13, 0, 0, 0],
  [0, 0, 10, 12, 0, 0],
  [0, 4, 0, 0, 14, 0],
  [0, 0, 9, 0, 0, 20],
  [0, 0, 0, 7, 0, 4],
  [0, 0, 0, 0, 0, 0],
];
console.log("最大流:", fordFulkerson(graph, 0, 5)); // 23
