/**
 * 手写强连通分量（Tarjan 算法）
 * 功能：找到有向图的所有强连通分量
 * 原理：DFS + low/dfn + 栈
 */
function tarjanSCC(graph, n) {
  const dfn = new Array(n).fill(0), low = new Array(n).fill(0);
  const inStack = new Array(n).fill(false), stack = [];
  const sccs = []; let timer = 0;
  function dfs(u) {
    dfn[u] = low[u] = ++timer; stack.push(u); inStack[u] = true;
    for (const v of graph[u] || []) {
      if (!dfn[v]) { dfs(v); low[u] = Math.min(low[u], low[v]); }
      else if (inStack[v]) low[u] = Math.min(low[u], dfn[v]);
    }
    if (low[u] === dfn[u]) {
      const scc = []; let v;
      do { v = stack.pop(); inStack[v] = false; scc.push(v); } while (v !== u);
      sccs.push(scc);
    }
  }
  for (let i = 0; i < n; i++) if (!dfn[i]) dfs(i);
  return sccs;
}
// ===== 测试 =====
const graph = { 0: [1], 1: [2,4], 2: [3], 3: [2], 4: [0,5], 5: [] };
const sccs = tarjanSCC(graph, 6);
console.log('强连通分量:', sccs); // [[2,3],[0,1,4],[5]]
