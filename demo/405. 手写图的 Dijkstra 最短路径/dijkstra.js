/**
 * 手写图的 Dijkstra 最短路径
 *
 * Dijkstra 算法用于求非负权图中单源最短路径。
 * 贪心策略：维护距离数组 dist，每次从未确定节点中选 dist 最小的，
 * 用它松弛邻接边。使用最小堆优化可将复杂度降至 O((V+E)log V)。
 * 本实现用最小堆，返回从起点到各点的最短距离及到目标点的路径。
 */

class MinHeap {
  constructor() {
    this.heap = [];
  }
  size() { return this.heap.length; }
  isEmpty() { return this.heap.length === 0; }
  _parent(i) { return (i - 1) >> 1; }
  _swap(i, j) { [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]; }
  push(item) {
    this.heap.push(item);
    let i = this.heap.length - 1;
    while (i > 0 && this.heap[i].dist < this.heap[this._parent(i)].dist) {
      this._swap(i, this._parent(i));
      i = this._parent(i);
    }
  }
  pop() {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let i = 0;
      const n = this.heap.length;
      while (true) {
        let l = 2 * i + 1, r = 2 * i + 2, smallest = i;
        if (l < n && this.heap[l].dist < this.heap[smallest].dist) smallest = l;
        if (r < n && this.heap[r].dist < this.heap[smallest].dist) smallest = r;
        if (smallest === i) break;
        this._swap(i, smallest);
        i = smallest;
      }
    }
    return top;
  }
}

class GraphDijkstra {
  constructor() {
    this.adjList = new Map();
  }

  addEdge(v, w, weight) {
    if (!this.adjList.has(v)) this.adjList.set(v, []);
    if (!this.adjList.has(w)) this.adjList.set(w, []);
    this.adjList.get(v).push({ vertex: w, weight });
  }

  dijkstra(start) {
    const dist = new Map();
    const prev = new Map();
    const heap = new MinHeap();

    for (const v of this.adjList.keys()) {
      dist.set(v, Infinity);
    }
    dist.set(start, 0);
    heap.push({ vertex: start, dist: 0 });

    while (!heap.isEmpty()) {
      const { vertex: u, dist: d } = heap.pop();
      // 跳过已过期的旧记录
      if (d > dist.get(u)) continue;
      for (const { vertex: v, weight } of this.adjList.get(u) || []) {
        const newDist = d + weight;
        if (newDist < dist.get(v)) {
          dist.set(v, newDist);
          prev.set(v, u);
          heap.push({ vertex: v, dist: newDist });
        }
      }
    }
    return { dist, prev };
  }

  // 获取从 start 到 target 的最短路径
  shortestPath(start, target) {
    const { dist, prev } = this.dijkstra(start);
    if (dist.get(target) === Infinity) return { distance: Infinity, path: null };
    const path = [];
    let cur = target;
    while (cur !== undefined) {
      path.unshift(cur);
      cur = prev.get(cur);
    }
    return { distance: dist.get(target), path };
  }
}

// 测试
const g = new GraphDijkstra();
g.addEdge('A', 'B', 4);
g.addEdge('A', 'C', 2);
g.addEdge('B', 'C', 1);
g.addEdge('B', 'D', 5);
g.addEdge('C', 'B', 1);
g.addEdge('C', 'D', 8);
g.addEdge('C', 'E', 10);
g.addEdge('D', 'E', 2);
g.addEdge('D', 'F', 6);
g.addEdge('E', 'F', 3);

const { dist } = g.dijkstra('A');
console.log(dist.get('A')); // 0
console.log(dist.get('B')); // 3 (A->C->B)
console.log(dist.get('C')); // 2
console.log(dist.get('D')); // 8 (A->C->B->D)
console.log(dist.get('E')); // 10 (A->C->B->D->E)
console.log(dist.get('F')); // 13

const result = g.shortestPath('A', 'F');
console.log(result); // { distance: 13, path: ['A','C','B','D','E','F'] }

const unreachable = g.shortestPath('A', 'Z');
console.log(unreachable.distance); // Infinity
