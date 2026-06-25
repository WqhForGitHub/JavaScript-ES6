/**
 * 手写 Bellman-Ford 算法
 * 功能：单源最短路径，可处理负权边，检测负环
 * 复杂度：O(VE)
 */
function bellmanFord(edges, n, start) {
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(null);
  dist[start] = 0;
  // 松弛 n-1 次
  for (let i = 0; i < n - 1; i++) {
    for (const [from, to, weight] of edges) {
      if (dist[from] !== Infinity && dist[from] + weight < dist[to]) {
        dist[to] = dist[from] + weight;
        prev[to] = from;
      }
    }
  }
  // 检测负环
  for (const [from, to, weight] of edges) {
    if (dist[from] !== Infinity && dist[from] + weight < dist[to]) {
      return { dist, prev, hasNegativeCycle: true };
    }
  }
  return { dist, prev, hasNegativeCycle: false };
}
// ===== 测试 =====
// 5个节点 0-4
const edges = [
  [0, 1, 4],
  [0, 2, 2],
  [1, 2, -1],
  [1, 3, 5],
  [2, 3, 3],
  [2, 4, 8],
  [3, 4, 2],
];
const { dist, prev, hasNegativeCycle } = bellmanFord(edges, 5, 0);
console.log("最短距离:", dist); // [0, 3, 2, 5, 7]
console.log("有负环:", hasNegativeCycle); // false
// 测试负环
const negEdges = [
  [0, 1, 1],
  [1, 2, -1],
  [2, 0, -1],
];
const r2 = bellmanFord(negEdges, 3, 0);
console.log("负环检测:", r2.hasNegativeCycle); // true
