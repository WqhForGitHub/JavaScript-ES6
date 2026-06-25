/**
 * 手写 SPFA（Shortest Path Faster Algorithm）
 * 功能：Bellman-Ford 的队列优化版
 * 实现：只有 dist 发生变化的节点才需要松弛
 */
function spfa(graph, start, n) {
  const dist = new Array(n).fill(Infinity);
  const inQueue = new Array(n).fill(false);
  const count = new Array(n).fill(0);
  const prev = new Array(n).fill(null);
  dist[start] = 0;
  inQueue[start] = true;
  const queue = [start];
  while (queue.length) {
    const u = queue.shift();
    inQueue[u] = false;
    for (const [v, w] of graph[u] || []) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        if (!inQueue[v]) {
          queue.push(v);
          inQueue[v] = true;
          count[v]++;
          if (count[v] > n) return { dist, prev, hasNegativeCycle: true };
        }
      }
    }
  }
  return { dist, prev, hasNegativeCycle: false };
}
// ===== 测试 =====
const graph = {
  0: [
    [1, 4],
    [2, 2],
  ],
  1: [
    [2, -1],
    [3, 5],
  ],
  2: [
    [3, 3],
    [4, 8],
  ],
  3: [[4, 2]],
  4: [],
};
const { dist, hasNegativeCycle } = spfa(graph, 0, 5);
console.log("最短距离:", dist); // [0, 3, 2, 5, 7]
console.log("有负环:", hasNegativeCycle); // false
