/**
 * 手写二分图匹配（匈牙利算法）
 * 功能：二分图最大匹配
 * 实现：DFS 找增广路
 */
function hungarian(graph, nLeft, nRight) {
  const matchR = new Array(nRight).fill(-1);
  function tryKohn(u, visited) {
    for (const v of graph[u] || []) {
      if (!visited[v]) {
        visited[v] = true;
        if (matchR[v] === -1 || tryKohn(matchR[v], visited)) { matchR[v] = u; return true; }
      }
    }
    return false;
  }
  let count = 0;
  for (let u = 0; u < nLeft; u++) {
    const visited = new Array(nRight).fill(false);
    if (tryKohn(u, visited)) count++;
  }
  return { matchCount: count, matchR };
}
// ===== 测试 =====
// 左侧 0-3, 右侧 0-4
const graph = { 0: [0,1], 1: [0,2], 2: [1,3], 3: [3,4] };
const { matchCount, matchR } = hungarian(graph, 4, 5);
console.log('最大匹配数:', matchCount); // 4
console.log('匹配:', matchR.map((l, r) => l + '->' + r).filter(s => !s.startsWith('-1')).join(', '));
