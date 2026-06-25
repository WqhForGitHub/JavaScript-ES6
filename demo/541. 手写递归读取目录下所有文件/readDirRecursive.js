/**
 * 手写递归读取目录下所有文件
 *
 * 作用：递归遍历一个目录及其所有子目录，返回其中所有文件的完整路径列表。
 *       等价于 Node 中用 fs.readdirSync({ withFileTypes: true }) 递归收集。
 *
 * 实现思路（三种）：
 *   1. 同步递归：用 fs.readdirSync + fs.statSync 判断是文件还是目录
 *   2. 异步递归（回调）：用 fs.readdir + fs.stat，回调串联
 *   3. 异步 Promise：用 promisify + async/await，最清晰
 *
 *   为了不依赖真实文件系统，这里同时实现一个基于 mock fs 的版本和基于内存虚拟文件树的版本。
 *   过滤/排序选项可扩展。
 */

// ===== 方式一：同步递归（接受 fs 模块依赖注入，便于测试）=====
function readDirRecursiveSync(rootPath, fsDep, options = {}) {
  const result = [];
  const { exclude = [], includeDirs = false, sortBy = "name" } = options;

  function walk(dir) {
    let entries;
    try {
      entries = fsDep.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
      if (err.code === "ENOENT") return;
      throw err;
    }

    for (const entry of entries) {
      if (exclude.includes(entry.name)) continue;
      const fullPath = fsDep.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (includeDirs) result.push(fullPath);
        walk(fullPath);
      } else if (entry.isFile()) {
        result.push(fullPath);
      }
      // 忽略符号链接等
    }
  }

  walk(rootPath);

  if (sortBy === "name") result.sort();
  return result;
}

// ===== 方式二：异步 Promise 递归 =====
async function readDirRecursive(rootPath, fsDep, options = {}) {
  const { exclude = [], includeDirs = false, sortBy = "name" } = options;
  const result = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await fsDep.readdir(dir, { withFileTypes: true });
    } catch (err) {
      if (err.code === "ENOENT") return;
      throw err;
    }

    for (const entry of entries) {
      if (exclude.includes(entry.name)) continue;
      const fullPath = fsDep.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (includeDirs) result.push(fullPath);
        await walk(fullPath);
      } else if (entry.isFile()) {
        result.push(fullPath);
      }
    }
  }

  await walk(rootPath);

  if (sortBy === "name") result.sort();
  return result;
}

// ===== Mock fs 依赖，用于测试 =====
function createMockFs(tree) {
  // tree: { '/a': { 'file1.txt': 'content', 'sub': { 'file2.txt': 'content' } } }
  // 这里 tree 以根路径为 key 的对象
  return {
    _tree: tree,
    join(...parts) {
      return parts.join("/").replace(/\/+/g, "/");
    },
    readdirSync(dir, options) {
      const node = lookupNode(tree, dir);
      if (!node || typeof node !== "object") {
        const err = new Error("ENOENT");
        err.code = "ENOENT";
        throw err;
      }
      const names = Object.keys(node);
      if (options && options.withFileTypes) {
        return names.map((name) => ({
          name,
          isDirectory: () =>
            typeof node[name] === "object" && node[name] !== null,
          isFile: () => typeof node[name] === "string",
        }));
      }
      return names;
    },
    async readdir(dir, options) {
      const node = lookupNode(tree, dir);
      if (!node || typeof node !== "object") {
        const err = new Error("ENOENT");
        err.code = "ENOENT";
        throw err;
      }
      const names = Object.keys(node);
      if (options && options.withFileTypes) {
        return names.map((name) => ({
          name,
          isDirectory: () =>
            typeof node[name] === "object" && node[name] !== null,
          isFile: () => typeof node[name] === "string",
        }));
      }
      return names;
    },
  };
}

function lookupNode(tree, path) {
  // path 形如 '/a/sub'，按 '/' 拆分
  const parts = path.split("/").filter(Boolean);
  let node = tree;
  for (const p of parts) {
    if (node == null || typeof node !== "object") return null;
    node = node[p];
  }
  return node;
}

// ===== 测试 =====

const tree = {
  project: {
    "index.js": "...",
    "package.json": "...",
    src: {
      "app.js": "...",
      utils: {
        "helper.js": "...",
        "format.js": "...",
      },
    },
    node_modules: {
      lodash: {
        "lodash.js": "...",
      },
    },
    ".git": {
      config: "...",
    },
  },
};

const fsMock = createMockFs(tree);

// 测试 1：同步递归
const files1 = readDirRecursiveSync("project", fsMock);
console.log("test1 files count:", files1.length); // 7
console.log("test1 files:", files1);
// 期望包含: project/index.js, project/package.json, project/src/app.js,
//          project/src/utils/helper.js, project/src/utils/format.js,
//          project/node_modules/lodash/lodash.js, project/.git/config

// 测试 2：排除 node_modules 和 .git
const files2 = readDirRecursiveSync("project", fsMock, {
  exclude: ["node_modules", ".git"],
});
console.log("test2 filtered count:", files2.length); // 5
console.log(
  "test2 has no node_modules:",
  !files2.some((f) => f.includes("node_modules")),
); // true

// 测试 3：包含目录
const files3 = readDirRecursiveSync("project", fsMock, {
  exclude: ["node_modules", ".git"],
  includeDirs: true,
});
console.log("test3 includes dirs count:", files3.length); // 8 (5 文件 + 3 目录: project, src, utils)

// 测试 4：异步版本
(async () => {
  const files4 = await readDirRecursive("project", fsMock, {
    exclude: ["node_modules", ".git"],
  });
  console.log("test4 async count:", files4.length); // 5
  console.log(
    "test4 same as sync:",
    JSON.stringify(files4) === JSON.stringify(files2),
  ); // true
})();

// 测试 5：不存在的目录
const files5 = readDirRecursiveSync("not-exists", fsMock);
console.log("test5 non-exist:", files5.length); // 0

// 测试 6：深嵌套目录
const deepTree = {
  deep: { a: { b: { c: { d: { "file.txt": "x" } } } } },
};
const fsMock2 = createMockFs(deepTree);
const files6 = readDirRecursiveSync("deep", fsMock2);
console.log("test6 deep:", files6); // ['deep/a/b/c/d/file.txt']
