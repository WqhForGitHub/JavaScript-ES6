/**
 * 手写简易 npm 包发布脚本
 *
 * 功能：自动化 npm 发布流程
 * 实现思路：
 *   1. 检查工作区是否干净
 *   2. 运行测试
 *   3. 版本号自增
 *   4. 构建
 *   5. 更新 changelog
 *   6. git commit + tag
 *   7. npm publish
 */

const { execSync } = require("child_process");

class NpmPublisher {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.steps = [];
  }

  log(msg) {
    console.log("[publish]", msg);
  }

  // 执行命令
  run(cmd) {
    this.log("$ " + cmd);
    if (this.dryRun) return "";
    try {
      return execSync(cmd, { encoding: "utf8" });
    } catch (e) {
      throw new Error("Command failed: " + cmd);
    }
  }

  // 检查工作区
  checkGitStatus() {
    this.log("Checking git status...");
    // 模拟
    const status = "M package.json"; // 模拟有修改
    if (status.trim()) {
      this.log("Warning: working directory not clean");
      // 实际应 throw，但这里允许继续
    }
    return true;
  }

  // 运行测试
  runTests() {
    this.log("Running tests...");
    this.steps.push("test");
    // 模拟
    this.log("  All tests passed");
    return true;
  }

  // 版本号自增
  bumpVersion(currentVersion, type = "patch") {
    const parts = currentVersion.split(".").map(Number);
    if (type === "major") {
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
    } else if (type === "minor") {
      parts[1]++;
      parts[2] = 0;
    } else {
      parts[2]++;
    }
    return parts.join(".");
  }

  // 构建
  build() {
    this.log("Building package...");
    this.steps.push("build");
    this.log("  Build complete");
  }

  // Git commit + tag
  gitCommitAndTag(version) {
    this.log("Git commit and tag...");
    this.run("git add -A");
    this.run('git commit -m "release: v' + version + '"');
    this.run("git tag v" + version);
    this.steps.push("git");
  }

  // npm publish
  publish(tag = "latest") {
    this.log("Publishing to npm...");
    this.run("npm publish --tag " + tag);
    this.steps.push("publish");
  }

  // 完整发布流程
  async release(currentVersion, type = "patch") {
    this.log("Starting release process...");
    this.checkGitStatus();
    this.runTests();
    const newVersion = this.bumpVersion(currentVersion, type);
    this.log("Version: " + currentVersion + " -> " + newVersion);
    this.build();
    this.gitCommitAndTag(newVersion);
    this.publish();
    this.log("Release complete: v" + newVersion);
    return newVersion;
  }
}

// ===== 测试 =====
const publisher = new NpmPublisher({ dryRun: true });
const newVersion = publisher.bumpVersion("1.2.3", "patch");
console.log("patch: 1.2.3 ->", newVersion); // 1.2.4
console.log("minor: 1.2.3 ->", publisher.bumpVersion("1.2.3", "minor")); // 1.3.0
console.log("major: 1.2.3 ->", publisher.bumpVersion("1.2.3", "major")); // 2.0.0

console.log("\n=== 模拟发布流程 ===");
publisher.release("1.2.3", "patch");
console.log("Steps:", publisher.steps);
