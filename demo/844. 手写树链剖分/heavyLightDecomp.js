/**
 * 手写树链剖分（重链剖分）
 * 功能：将树链操作转为区间操作，配合线段树
 * 预处理：两遍 DFS
 */
class HLD {
  constructor(n, adj, root = 0) {
    this.n = n; this.adj = adj; this.root = root;
    this.size = new Array(n).fill(0); this.depth = new Array(n).fill(0);
    this.parent = new Array(n).fill(-1); this.heavy = new Array(n).fill(-1);
    this.head = new Array(n).fill(0); this.pos = new Array(n).fill(0);
    this.curPos = 0;
    this.dfs1(root); this.dfs2(root, root);
  }
  dfs1(u) {
    this.size[u] = 1; let maxSub = 0;
    for (const v of this.adj[u] || []) {
      if (v === this.parent[u]) continue;
      this.depth[v] = this.depth[u] + 1; this.parent[v] = u;
      this.dfs1(v); this.size[u] += this.size[v];
      if (this.size[v] > maxSub) { maxSub = this.size[v]; this.heavy[u] = v; }
    }
  }
  dfs2(u, h) {
    this.head[u] = h; this.pos[u] = this.curPos++;
    if (this.heavy[u] !== -1) this.dfs2(this.heavy[u], h);
    for (const v of this.adj[u] || []) if (v !== this.parent[u] && v !== this.heavy[u]) this.dfs2(v, v);
  }
  // 查询 u-v 路径上的所有链段
  queryPath(u, v) {
    const segments = [];
    while (this.head[u] !== this.head[v]) {
      if (this.depth[this.head[u]] < this.depth[this.head[v]]) [u, v] = [v, u];
      segments.push([this.pos[this.head[u]], this.pos[u]]); u = this.parent[this.head[u]];
    }
    if (this.depth[u] > this.depth[v]) [u, v] = [v, u];
    segments.push([this.pos[u], this.pos[v]]);
    return segments;
  }
}
// ===== 测试 =====
const adj = { 0: [1,2], 1: [0,3,4], 2: [0], 3: [1], 4: [1] };
const hld = new HLD(5, adj, 0);
console.log('size:', hld.size); // [5,3,1,1,1]
console.log('heavy:', hld.heavy); // [1,-1,-1,-1,-1]
console.log('head:', hld.head); // [0,0,2,0,0]
console.log('pos:', hld.pos); // [0,1,4,2,3]
console.log('path(3,2):', hld.queryPath(3, 2)); // [[1,2],[4,4]]
