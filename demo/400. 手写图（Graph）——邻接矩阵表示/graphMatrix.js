/**
 * 手写图（Graph）——邻接矩阵表示
 *
 * 邻接矩阵用二维数组 graph[i][j] 表示节点 i 到 j 的边权（0 或 Infinity 表示无边）。
 * 优点：查询边是否存在 O(1)，适合稠密图；缺点：空间 O(V^2)，稀疏图浪费。
 * 本实现支持有向/无向图、加权边，并提供深度/广度遍历。
 */

class GraphMatrix {
  constructor(vertices, directed = false) {
    this.vertices = vertices;
    this.directed = directed;
    const n = vertices.length;
    this.matrix = Array.from({ length: n }, () => new Array(n).fill(0));
    this.vertexIndex = {};
    vertices.forEach((v, i) => {
      this.vertexIndex[v] = i;
    });
  }

  _getIndex(v) {
    const i = this.vertexIndex[v];
    if (i === undefined) throw new Error('Vertex not found: ' + v);
    return i;
  }

  // 添加边，weight 默认 1
  addEdge(v, w, weight = 1) {
    const i = this._getIndex(v);
    const j = this._getIndex(w);
    this.matrix[i][j] = weight;
    if (!this.directed) {
      this.matrix[j][i] = weight;
    }
  }

  removeEdge(v, w) {
    const i = this._getIndex(v);
    const j = this._getIndex(w);
    this.matrix[i][j] = 0;
    if (!this.directed) {
      this.matrix[j][i] = 0;
    }
  }

  hasEdge(v, w) {
    return this.matrix[this._getIndex(v)][this._getIndex(w)] !== 0;
  }

  getWeight(v, w) {
    return this.matrix[this._getIndex(v)][this._getIndex(w)];
  }

  // 获取邻接顶点
  getNeighbors(v) {
    const i = this._getIndex(v);
    const neighbors = [];
    for (let j = 0; j < this.matrix[i].length; j++) {
      if (this.matrix[i][j] !== 0) {
        neighbors.push(this.vertices[j]);
      }
    }
    return neighbors;
  }

  print() {
    console.log('  ' + this.vertices.join(' '));
    for (let i = 0; i < this.vertices.length; i++) {
      console.log(this.vertices[i] + ' ' + this.matrix[i].join(' '));
    }
  }

  // 广度优先遍历
  bfs(start) {
    const visited = new Set();
    const queue = [start];
    const result = [];
    visited.add(start);
    while (queue.length > 0) {
      const v = queue.shift();
      result.push(v);
      for (const neighbor of this.getNeighbors(v)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return result;
  }

  // 深度优先遍历
  dfs(start) {
    const visited = new Set();
    const result = [];
    const dfsVisit = (v) => {
      visited.add(v);
      result.push(v);
      for (const neighbor of this.getNeighbors(v)) {
        if (!visited.has(neighbor)) dfsVisit(neighbor);
      }
    };
    dfsVisit(start);
    return result;
  }
}

// 测试
const g = new GraphMatrix(['A', 'B', 'C', 'D', 'E', 'F']);
g.addEdge('A', 'B');
g.addEdge('A', 'C');
g.addEdge('B', 'D');
g.addEdge('C', 'D');
g.addEdge('D', 'E');
g.addEdge('E', 'F');

console.log(g.hasEdge('A', 'B')); // true
console.log(g.hasEdge('A', 'D')); // false
console.log(g.getNeighbors('A')); // ['B', 'C']
console.log(g.getWeight('A', 'B')); // 1

console.log(g.bfs('A')); // ['A', 'B', 'C', 'D', 'E', 'F']
console.log(g.dfs('A')); // ['A', 'B', 'D', 'C', 'E', 'F']

g.print();
//   A B C D E F
// A 0 1 1 0 0 0
// B 1 0 0 1 0 0
// C 1 0 0 1 0 0
// D 0 1 1 0 1 0
// E 0 0 0 1 0 1
// F 0 0 0 0 1 0
