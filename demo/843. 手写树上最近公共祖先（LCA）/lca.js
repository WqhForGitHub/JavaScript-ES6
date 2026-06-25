/**
 * 手写树上最近公共祖先（LCA）
 * 实现：倍增法（Binary Lifting）
 * 预处理 O(n logn)，查询 O(logn)
 */
class LCA {
  constructor(n, root, adj) {
    this.LOG = Math.ceil(Math.log2(n)) + 1;
    this.depth = new Array(n).fill(0);
    this.parent = Array.from({ length: n }, () => new Array(this.LOG).fill(-1));
    this.dfs(root, -1, 0, adj);
    for (let j = 1; j < this.LOG; j++)
      for (let i = 0; i < n; i++)
        if (this.parent[i][j - 1] !== -1)
          this.parent[i][j] = this.parent[this.parent[i][j - 1]][j - 1];
  }
  dfs(u, p, d, adj) {
    this.depth[u] = d;
    this.parent[u][0] = p;
    for (const v of adj[u] || []) if (v !== p) this.dfs(v, u, d + 1, adj);
  }
  query(u, v) {
    if (this.depth[u] < this.depth[v]) [u, v] = [v, u];
    const diff = this.depth[u] - this.depth[v];
    for (let j = 0; j < this.LOG; j++)
      if ((diff >> j) & 1) u = this.parent[u][j];
    if (u === v) return u;
    for (let j = this.LOG - 1; j >= 0; j--)
      if (this.parent[u][j] !== this.parent[v][j]) {
        u = this.parent[u][j];
        v = this.parent[v][j];
      }
    return this.parent[u][0];
  }
}
// ===== 测试 =====
// 树结构: 0-1, 0-2, 1-3, 1-4, 2-5, 2-6
const adj = {
  0: [1, 2],
  1: [0, 3, 4],
  2: [0, 5, 6],
  3: [1],
  4: [1],
  5: [2],
  6: [2],
};
const lca = new LCA(7, 0, adj);
console.log("LCA(3,4):", lca.query(3, 4)); // 1
console.log("LCA(3,5):", lca.query(3, 5)); // 0
console.log("LCA(5,6):", lca.query(5, 6)); // 2
console.log("LCA(3,3):", lca.query(3, 3)); // 3
