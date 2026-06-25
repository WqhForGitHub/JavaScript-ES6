/**
 * 手写简易打包产物分析
 *
 * 功能：分析打包产物，统计各模块大小、依赖关系
 * 实现思路：
 *   1. 解析打包产物
 *   2. 统计每个模块的代码大小
 *   3. 分析依赖关系
 *   4. 生成报告
 */

class BundleAnalyzer {
  constructor() {
    this.modules = [];
    this.totalSize = 0;
  }

  // 添加模块
  addModule(name, size, deps = []) {
    this.modules.push({ name, size, deps, percentage: 0 });
    this.totalSize += size;
  }

  // 计算百分比
  calculatePercentages() {
    for (const mod of this.modules) {
      mod.percentage = ((mod.size / this.totalSize) * 100).toFixed(2);
    }
  }

  // 分析结果
  analyze() {
    this.calculatePercentages();
    this.modules.sort((a, b) => b.size - a.size);

    console.log("=== Bundle Analysis Report ===");
    console.log("Total size:", this.formatSize(this.totalSize));
    console.log("Module count:", this.modules.length);
    console.log("");
    console.log("Module".padEnd(40) + "Size".padStart(10) + "Pct".padStart(10));
    console.log("-".repeat(60));

    for (const mod of this.modules) {
      console.log(
        mod.name.padEnd(40) +
          this.formatSize(mod.size).padStart(10) +
          (mod.percentage + "%").padStart(10),
      );
    }

    // 重复依赖检测
    const depCount = new Map();
    for (const mod of this.modules) {
      for (const dep of mod.deps) {
        depCount.set(dep, (depCount.get(dep) || 0) + 1);
      }
    }
    const duplicates = [...depCount.entries()].filter(
      ([_, count]) => count > 1,
    );
    if (duplicates.length) {
      console.log("\n=== Duplicate Dependencies ===");
      for (const [dep, count] of duplicates) {
        console.log("  " + dep + ": imported " + count + " times");
      }
    }

    return {
      totalSize: this.totalSize,
      moduleCount: this.modules.length,
      modules: this.modules,
      duplicates,
    };
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + "B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
    return (bytes / (1024 * 1024)).toFixed(2) + "MB";
  }

  // 生成可视化数据（Treemap 数据格式）
  toTreemapData() {
    return {
      name: "bundle",
      value: this.totalSize,
      children: this.modules.map((m) => ({
        name: m.name,
        value: m.size,
        deps: m.deps,
      })),
    };
  }
}

// ===== 测试 =====
const analyzer = new BundleAnalyzer();
analyzer.addModule("react", 45000, []);
analyzer.addModule("react-dom", 120000, ["react"]);
analyzer.addModule("lodash", 80000, []);
analyzer.addModule("moment", 67000, []);
analyzer.addModule("axios", 23000, []);
analyzer.addModule("./src/App.jsx", 5000, ["react", "axios"]);
analyzer.addModule("./src/utils.js", 3000, ["lodash"]);
analyzer.addModule("./src/api.js", 2000, ["axios", "./src/utils.js"]);
analyzer.addModule("./src/components/Header.jsx", 4000, ["react"]);
analyzer.addModule("./src/components/Footer.jsx", 2000, ["react"]);

analyzer.analyze();

console.log("\n=== Treemap Data ===");
console.log(
  JSON.stringify(analyzer.toTreemapData(), null, 2).slice(0, 200) + "...",
);
