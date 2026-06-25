/**
 * 手写欧拉路径/欧拉回路
 * 欧拉路径：经过每条边恰好一次的路径
 * 欧拉回路：起点终点相同的欧拉路径
 * 实现：Hierholzer 算法
 */
function findEulerPath(graph, n) {
  const inDeg = new Array(n).fill(0),
    outDeg = new Array(n).fill(0);
  const adj = graph.map((row) => [...row]);
  for (let u = 0; u < n; u++)
    for (let v = 0; v < n; v++) {
      outDeg[u] += adj[u][v];
      inDeg[v] += adj[u][v];
    }
  let start = 0,
    end = -1;
  for (let i = 0; i < n; i++) {
    if (outDeg[i] - inDeg[i] === 1) start = i;
    if (inDeg[i] - outDeg[i] === 1) end = i;
  }
  const path = [];
  function dfs(u) {
    for (let v = 0; v < n; v++) {
      while (adj[u][v] > 0) {
        adj[u][v]--;
        dfs(v);
      }
    }
    path.push(u);
  }
  dfs(start);
  path.reverse();
  return path;
}
// ===== 测试 =====
const graph = [
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1],
  [0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0],
];
console.log("欧拉路径:", findEulerPath(graph, 5));
