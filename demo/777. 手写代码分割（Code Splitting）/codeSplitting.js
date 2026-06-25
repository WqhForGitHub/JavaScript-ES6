/**
 * 手写代码分割（Code Splitting）
 *
 * 功能：将依赖图分割为多个 chunk，支持动态 import 产生异步块
 * 实现思路：
 *   1. 静态依赖归入主 chunk
 *   2. 动态 import() 创建新的异步 chunk
 *   3. 生成 chunk 映射表，支持运行时按需加载
 */

class CodeSplitter {
  constructor() {
    this.chunks = new Map();
    this.sources = {};
  }
  setSources(s) {
    this.sources = s;
  }

  parseStatic(code) {
    const deps = [];
    let m;
    const r = /import\s+.*?from\s+['"`](.+?)['"`]/g;
    while ((m = r.exec(code)) !== null) deps.push(m[1]);
    return deps;
  }
  parseDynamic(code) {
    const deps = [];
    let m;
    const r = /import\s*\(['"`](.+?)['"`]\)/g;
    while ((m = r.exec(code)) !== null) deps.push(m[1]);
    return deps;
  }

  split(entry) {
    let cid = 0;
    const main = { id: cid++, modules: new Set(), asyncDeps: [] };
    this.chunks.set(main.id, main);
    const queue = [entry],
      visited = new Set();
    while (queue.length) {
      const p = queue.shift();
      if (visited.has(p)) continue;
      visited.add(p);
      main.modules.add(p);
      const code = this.sources[p] || "";
      this.parseStatic(code).forEach((d) => queue.push(d));
      this.parseDynamic(code).forEach((d) => {
        main.asyncDeps.push(d);
        const async = {
          id: cid++,
          modules: new Set(),
          asyncDeps: [],
          parent: main.id,
        };
        this.chunks.set(async.id, async);
        this.collectChunk(d, async);
      });
    }
  }

  collectChunk(entry, chunk) {
    const queue = [entry],
      visited = new Set();
    while (queue.length) {
      const p = queue.shift();
      if (visited.has(p)) continue;
      visited.add(p);
      chunk.modules.add(p);
      const code = this.sources[p] || "";
      this.parseStatic(code).forEach((d) => queue.push(d));
    }
  }

  generateManifest() {
    const m = {};
    for (const [id, c] of this.chunks)
      m[id] = {
        modules: [...c.modules],
        asyncDeps: c.asyncDeps || [],
        parent: c.parent || null,
      };
    return m;
  }
}

// ===== 测试 =====
const splitter = new CodeSplitter();
splitter.setSources({
  "entry.js": "import './a'; import('./lazy');",
  "./a": "import './b';",
  "./b": "module.exports = 'b';",
  "./lazy": "import './c';",
  "./c": "module.exports = 'c';",
});
splitter.split("entry.js");
const manifest = splitter.generateManifest();
console.log("Chunk 数量:", splitter.chunks.size); // 2
for (const [id, info] of Object.entries(manifest)) {
  console.log(
    "Chunk " +
      id +
      ": modules=[" +
      info.modules.join(", ") +
      "] asyncDeps=[" +
      info.asyncDeps.join(", ") +
      "]",
  );
}
