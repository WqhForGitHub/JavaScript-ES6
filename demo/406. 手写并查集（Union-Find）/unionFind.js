/**
 * 手写并查集（Union-Find）
 *
 * 并查集用于高效处理不相交集合的合并与查询。
 * 核心操作：find（查找元素所属集合的代表）和 union（合并两个集合）。
 * 优化：路径压缩（find 时将节点直接指向根）+ 按秩合并（小树挂到大树下），
 * 使单次操作均摊接近 O(1)（准确为阿克曼函数的反函数）。
 * 应用：连通分量、Kruskal 最小生成树、判断图是否有环。
 */

class UnionFind {
  constructor(size) {
    this.parent = new Array(size);
    this.rank = new Array(size).fill(0);
    this.count = size; // 连通分量数
    for (let i = 0; i < size; i++) {
      this.parent[i] = i;
    }
  }

  // 查找根节点（带路径压缩）
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // 路径压缩
    }
    return this.parent[x];
  }

  // 迭代版 find
  findIterative(x) {
    let root = x;
    while (this.parent[root] !== root) {
      root = this.parent[root];
    }
    // 第二次遍历压缩路径
    while (this.parent[x] !== root) {
      const next = this.parent[x];
      this.parent[x] = root;
      x = next;
    }
    return root;
  }

  // 合并两个集合（按秩合并）
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false; // 已在同一集合
    // 按秩合并：rank 小的挂到 rank 大的下面
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    this.count--;
    return true;
  }

  // 判断是否连通
  connected(x, y) {
    return this.find(x) === this.find(y);
  }

  // 连通分量数
  getCount() {
    return this.count;
  }
}

// 测试
const uf = new UnionFind(10);
uf.union(0, 1);
uf.union(2, 3);
uf.union(4, 5);
uf.union(1, 3); // 合并 {0,1} 和 {2,3}
uf.union(5, 6);

console.log(uf.connected(0, 2)); // true
console.log(uf.connected(0, 4)); // false
console.log(uf.connected(4, 6)); // true
console.log(uf.getCount()); // 5

// 应用：判断无向图是否有环
function hasCycleInGraph(n, edges) {
  const uf = new UnionFind(n);
  for (const [u, v] of edges) {
    if (uf.connected(u, v)) return true; // 已连通，再加边成环
    uf.union(u, v);
  }
  return false;
}

console.log(hasCycleInGraph(5, [[0, 1], [1, 2], [2, 3], [3, 4]])); // false
console.log(hasCycleInGraph(5, [[0, 1], [1, 2], [2, 0], [3, 4]])); // true

// 应用：连通分量
console.log(uf.getCount()); // 5 个连通分量
