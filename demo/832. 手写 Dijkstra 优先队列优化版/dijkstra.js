/**
 * 手写 Dijkstra 优先队列优化版
 * 功能：单源最短路径（非负权）
 * 实现：最小堆 + 贪心
 * 复杂度：O((V+E) logV)
 */
class MinHeap {
  constructor() { this.heap = []; }
  push(item) { this.heap.push(item); this._up(this.heap.length - 1); }
  pop() { if (this.heap.length === 0) return null; const top = this.heap[0]; const last = this.heap.pop(); if (this.heap.length) { this.heap[0] = last; this._down(0); } return top; }
  _up(i) { while (i > 0) { const p = (i - 1) >> 1; if (this.heap[p].dist <= this.heap[i].dist) break; [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]]; i = p; } }
  _down(i) { const n = this.heap.length; while (true) { let s = i, l = 2*i+1, r = 2*i+2; if (l < n && this.heap[l].dist < this.heap[s].dist) s = l; if (r < n && this.heap[r].dist < this.heap[s].dist) s = r; if (s === i) break; [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]]; i = s; } }
  get size() { return this.heap.length; }
}
function dijkstra(graph, start) {
  const dist = {}; const prev = {};
  for (const v of Object.keys(graph)) { dist[v] = Infinity; prev[v] = null; }
  dist[start] = 0;
  const heap = new MinHeap(); heap.push({ node: start, dist: 0 });
  const visited = new Set();
  while (heap.size > 0) {
    const { node } = heap.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    for (const [neighbor, weight] of graph[node] || []) {
      const newDist = dist[node] + weight;
      if (newDist < dist[neighbor]) { dist[neighbor] = newDist; prev[neighbor] = node; heap.push({ node: neighbor, dist: newDist }); }
    }
  }
  return { dist, prev };
}
function getPath(prev, target) { const path = []; let cur = target; while (cur) { path.unshift(cur); cur = prev[cur]; } return path; }
// ===== 测试 =====
const graph = { A: [['B',4],['C',2]], B: [['C',1],['D',5]], C: [['B',1],['D',3],['E',8]], D: [['E',2]], E: [] };
const { dist, prev } = dijkstra(graph, 'A');
console.log('最短距离:', dist);
console.log('A->E 路径:', getPath(prev, 'E')); // A->C->D->E
