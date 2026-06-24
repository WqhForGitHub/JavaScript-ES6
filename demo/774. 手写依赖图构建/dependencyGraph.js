/**
 * 手写依赖图构建
 *
 * 功能：给定入口模块，递归分析所有依赖，构建有向无环图（DAG）
 * 实现思路：
 *   1. BFS 遍历模块，解析 require/import 语句
 *   2. 记录模块 ID、路径、依赖列表
 *   3. 支持循环检测和拓扑排序
 */

class ModuleNode {
  constructor(id, path) {
    this.id = id;
    this.path = path;
    this.deps = [];
    this.incoming = [];
  }
}

class DependencyGraph {
  constructor() { this.nodes = new Map(); this.idCounter = 0; this.sources = {}; }

  setSources(sources) { this.sources = sources; }

  parseDeps(modulePath) {
    const code = this.sources[modulePath] || '';
    const deps = [];
    const re = /require\(['"`](.+?)['"`]\)|import\s+.*?from\s+['"`](.+?)['"`]/g;
    let m;
    while ((m = re.exec(code)) !== null) deps.push(m[1] || m[2]);
    return deps;
  }

  build(entryPath) {
    const queue = [entryPath];
    const visited = new Set();
    while (queue.length) {
      const cur = queue.shift();
      if (visited.has(cur)) continue;
      visited.add(cur);
      if (!this.nodes.has(cur)) this.nodes.set(cur, new ModuleNode(this.idCounter++, cur));
      const node = this.nodes.get(cur);
      for (const dep of this.parseDeps(cur)) {
        if (!this.nodes.has(dep)) this.nodes.set(dep, new ModuleNode(this.idCounter++, dep));
        const dn = this.nodes.get(dep);
        if (!node.deps.includes(dn.id)) { node.deps.push(dn.id); dn.incoming.push(node.id); }
        queue.push(dep);
      }
    }
  }

  // 拓扑排序
  topologicalSort() {
    const sorted = [], visited = new Set();
    const byId = new Map();
    for (const n of this.nodes.values()) byId.set(n.id, n);
    const visit = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      const node = byId.get(id);
      if (node) { node.deps.forEach(visit); sorted.push(id); }
    };
    for (const n of this.nodes.values()) visit(n.id);
    return sorted;
  }

  // 循环检测
  detectCycles() {
    const cycles = [], visited = new Set(), stack = new Set();
    const byId = new Map();
    for (const n of this.nodes.values()) byId.set(n.id, n);
    const dfs = (id, p) => {
      if (stack.has(id)) { cycles.push([...p, id]); return; }
      if (visited.has(id)) return;
      visited.add(id); stack.add(id);
      const node = byId.get(id);
      if (node) node.deps.forEach(d => dfs(d, [...p, id]));
      stack.delete(id);
    };
    for (const n of this.nodes.values()) dfs(n.id, []);
    return cycles;
  }
}

// ===== 测试 =====
const graph = new DependencyGraph();
graph.setSources({
  'entry.js': "require('./a'); require('./b');",
  './a': "require('./c');",
  './b': "require('./c');",
  './c': "module.exports = 42;",
});
graph.build('entry.js');
console.log('模块节点数:', graph.nodes.size); // 4
console.log('拓扑排序:', graph.topologicalSort());
console.log('循环依赖:', graph.detectCycles()); // []
