/**
 * 手写割点与桥
 * 割点：删除后图不连通的节点
 * 桥：删除后图不连通的边
 * 实现：Tarjan 算法，dfn/low
 */
function findCutVerticesAndBridges(graph, n) {
  const dfn = new Array(n).fill(0),
    low = new Array(n).fill(0);
  const cutVertices = new Set(),
    bridges = [];
  let timer = 0;
  function dfs(u, parent, root) {
    dfn[u] = low[u] = ++timer;
    let children = 0;
    for (const v of graph[u] || []) {
      if (!dfn[v]) {
        children++;
        dfs(v, u, root);
        low[u] = Math.min(low[u], low[v]);
        if (u === root && children > 1) cutVertices.add(u);
        if (u !== root && low[v] >= dfn[u]) cutVertices.add(u);
        if (low[v] > dfn[u]) bridges.push([u, v]);
      } else if (v !== parent) low[u] = Math.min(low[u], dfn[v]);
    }
  }
  for (let i = 0; i < n; i++) if (!dfn[i]) dfs(i, -1, i);
  return { cutVertices: [...cutVertices], bridges };
}
// ===== 测试 =====
const graph = {
  0: [1, 2],
  1: [0, 2],
  2: [0, 1, 3],
  3: [2, 4, 5],
  4: [3, 5],
  5: [3, 4],
};
const { cutVertices, bridges } = findCutVerticesAndBridges(graph, 6);
console.log("割点:", cutVertices); // [2, 3]
console.log("桥:", bridges); // [[2,3]]
