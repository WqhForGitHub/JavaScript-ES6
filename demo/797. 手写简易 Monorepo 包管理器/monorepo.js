/**
 * 手写简易 Monorepo 包管理器
 *
 * 功能：管理 monorepo 中的多个包，支持依赖链接、批量安装、批量构建
 * 实现思路：
 *   1. 读取所有包的 package.json
 *   2. 分析包间依赖关系
 *   3. 按拓扑序执行安装/构建
 *   4. 将本地包依赖符号链接到 node_modules
 */

const fs = require('fs');
const path = require('path');

class MonorepoManager {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.packages = new Map(); // name -> { dir, pkg, deps }
  }

  // 发现所有包
  discoverPackages(packagesDir = 'packages') {
    const dir = path.join(this.rootDir, packagesDir);
    // 模拟发现包
    const mockPackages = [
      { name: '@monorepo/utils', dir: 'packages/utils', dependencies: {} },
      { name: '@monorepo/core', dir: 'packages/core', dependencies: { '@monorepo/utils': '*' } },
      { name: '@monorepo/ui', dir: 'packages/ui', dependencies: { '@monorepo/core': '*', 'react': '*' } },
      { name: '@monorepo/app', dir: 'packages/app', dependencies: { '@monorepo/ui': '*', '@monorepo/core': '*' } },
    ];
    mockPackages.forEach(p => this.packages.set(p.name, p));
    return [...this.packages.keys()];
  }

  // 拓扑排序
  topologicalSort() {
    const sorted = [], visited = new Set(), visiting = new Set();
    const visit = (name) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) throw new Error('Circular dependency detected: ' + name);
      visiting.add(name);
      const pkg = this.packages.get(name);
      if (pkg && pkg.dependencies) {
        for (const dep of Object.keys(pkg.dependencies)) {
          if (this.packages.has(dep)) visit(dep);
        }
      }
      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    };
    for (const name of this.packages.keys()) visit(name);
    return sorted;
  }

  // 批量安装（模拟）
  async installAll() {
    const order = this.topologicalSort();
    console.log('[Monorepo] Install order:', order);
    for (const name of order) {
      const pkg = this.packages.get(name);
      console.log('[Monorepo] Installing', name, '...');
      // 模拟符号链接本地依赖
      for (const dep of Object.keys(pkg.dependencies || {})) {
        if (this.packages.has(dep)) {
          console.log('  [link]', dep, '->', path.join(pkg.dir, 'node_modules', dep));
        }
      }
    }
  }

  // 批量构建
  async buildAll() {
    const order = this.topologicalSort();
    for (const name of order) {
      console.log('[Monorepo] Building', name, '...');
    }
    return order;
  }

  // 批量运行脚本
  async runScript(scriptName) {
    const order = this.topologicalSort();
    const results = {};
    for (const name of order) {
      console.log('[Monorepo] Running', scriptName, 'in', name);
      results[name] = 'success';
    }
    return results;
  }
}

// ===== 测试 =====
const mono = new MonorepoManager('/project');
const packages = mono.discoverPackages();
console.log('发现的包:', packages);
// @monorepo/utils, @monorepo/core, @monorepo/ui, @monorepo/app

const order = mono.topologicalSort();
console.log('拓扑排序:', order);
// utils -> core -> ui -> app

console.log('\n=== 批量安装 ===');
mono.installAll();

console.log('\n=== 批量构建 ===');
mono.buildAll();
