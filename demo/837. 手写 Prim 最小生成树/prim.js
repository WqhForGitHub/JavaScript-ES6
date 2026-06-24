/**
 * 手写 Prim 最小生成树
 * 功能：从某点出发，每次选最小权重的横切边
 * 实现：优先队列/数组查找
 */
function prim(graph, n, start = 0) {
  const inMST = new Array(n).fill(false);
  const dist = new Array(n).fill(Infinity);
  const parent = new Array(n).fill(-1);
  dist[start] = 0;
  const mst = []; let totalWeight = 0;
  for (let i = 0; i < n; i++) {
    let u = -1, minDist = Infinity;
    for (let j = 0; j < n; j++) if (!inMST[j] && dist[j] < minDist) { minDist = dist[j]; u = j; }
    if (u === -1) break;
    inMST[u] = true; totalWeight += dist[u];
    if (parent[u] !== -1) mst.push([parent[u], u, dist[u]]);
    for (const [v, w] of graph[u] || []) if (!inMST[v] && w < dist[v]) { dist[v] = w; parent[v] = u; }
  }
  return { mst, totalWeight };
}
// ===== 测试 =====
const graph = { 0: [[1,4],[2,2]], 1: [[0,4],[2,1],[3,5]], 2: [[0,2],[1,1],[3,3],[4,8]], 3: [[1,5],[2,3],[4,2]], 4: [[2,8],[3,2]] };
const { mst, totalWeight } = prim(graph, 5, 0);
console.log('MST 边:', mst);
console.log('总权重:', totalWeight); // 8
