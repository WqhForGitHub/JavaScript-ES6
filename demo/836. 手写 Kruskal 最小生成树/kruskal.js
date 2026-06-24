/**
 * 手写 Kruskal 最小生成树
 * 功能：无向连通图最小生成树
 * 实现：按边权排序 + 并查集
 * 复杂度：O(E logE)
 */
class UnionFind {
  constructor(n) { this.parent = Array.from({ length: n }, (_, i) => i); this.rank = new Array(n).fill(0); }
  find(x) { if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); return this.parent[x]; }
  union(x, y) { const px = this.find(x), py = this.find(y); if (px === py) return false; if (this.rank[px] < this.rank[py]) [px, py] = [py, px]; this.parent[py] = px; if (this.rank[px] === this.rank[py]) this.rank[px]++; return true; }
}
function kruskal(edges, n) {
  edges.sort((a, b) => a[2] - b[2]);
  const uf = new UnionFind(n);
  const mst = []; let totalWeight = 0;
  for (const [u, v, w] of edges) {
    if (uf.union(u, v)) { mst.push([u, v, w]); totalWeight += w; if (mst.length === n - 1) break; }
  }
  return { mst, totalWeight };
}
// ===== 测试 =====
const edges = [[0,1,4],[0,2,2],[1,2,1],[1,3,5],[2,3,3],[2,4,8],[3,4,2]];
const { mst, totalWeight } = kruskal(edges, 5);
console.log('MST 边:', mst);
console.log('总权重:', totalWeight); // 8
