/**
 * 手写 Floyd-Warshall 算法
 * 功能：全源最短路径，可处理负权（无负环）
 * 复杂度：O(n^3)
 * 原理：dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j])
 */
function floydWarshall(matrix) {
  const n = matrix.length;
  const dist = matrix.map(row => [...row]);
  const next = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => j));
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity && dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j]; next[i][j] = next[i][k];
        }
  return { dist, next };
}
function getPath(next, from, to) {
  if (next[from][to] === undefined) return [];
  const path = [from];
  while (from !== to) { from = next[from][to]; path.push(from); }
  return path;
}
// ===== 测试 =====
const INF = Infinity;
const matrix = [
  [0, 4, 2, INF, INF],
  [INF, 0, -1, 5, INF],
  [INF, INF, 0, 3, 8],
  [INF, INF, INF, 0, 2],
  [INF, INF, INF, INF, 0],
];
const { dist, next } = floydWarshall(matrix);
console.log('全源最短路径:');
dist.forEach((row, i) => console.log('  从' + i + ':', row));
console.log('0->4 路径:', getPath(next, 0, 4)); // [0, 2, 3, 4]
