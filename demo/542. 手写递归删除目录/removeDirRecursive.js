/**
 * 手写递归删除目录
 *
 * 作用：递归删除一个目录及其下所有文件和子目录（类似 rm -rf）。
 *       Node 的 fs.rmdirSync(path, { recursive: true }) 或 fs.rmSync(path, { recursive: true })
 *       实现这个功能时需要先清空目录内容再删除目录本身。
 *
 * 实现思路（三种）：
 *   1. 同步递归：readdirSync + statSync 判断，文件直接 unlinkSync，目录递归处理
 *   2. 异步回调递归
 *   3. 异步 Promise 递归（最清晰）
 *
 *   为了不依赖真实文件系统，这里使用 mock fs 演示。
 */

// ===== 方式一：同步递归删除 =====
function removeDirRecursiveSync(targetPath, fsDep) {
  // 先判断是否存在
  let stat;
  try {
    stat = fsDep.statSync(targetPath);
  } catch (err) {
    if (err.code === "ENOENT") return; // 不存在视为已删除
    throw err;
  }

  if (stat.isFile()) {
    fsDep.unlinkSync(targetPath);
    return;
  }

  if (stat.isDirectory()) {
    const entries = fsDep.readdirSync(targetPath);
    for (const entry of entries) {
      const childPath = fsDep.join(targetPath, entry);
      removeDirRecursiveSync(childPath, fsDep);
    }
    // 子项清空后再删除目录本身
    fsDep.rmdirSync(targetPath);
  }
}

// ===== 方式二：异步 Promise 递归 =====
async function removeDirRecursive(targetPath, fsDep) {
  let stat;
  try {
    stat = await fsDep.stat(targetPath);
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }

  if (stat.isFile()) {
    await fsDep.unlink(targetPath);
    return;
  }

  if (stat.isDirectory()) {
    const entries = await fsDep.readdir(targetPath);
    // 并发删除子项
    await Promise.all(
      entries.map((entry) =>
        removeDirRecursive(fsDep.join(targetPath, entry), fsDep),
      ),
    );
    await fsDep.rmdir(targetPath);
  }
}

// ===== Mock fs：用对象表示文件系统 =====
function createMockFs(initialTree) {
  // 深拷贝初始树
  const fsTree = JSON.parse(JSON.stringify(initialTree));
  // fsTree 结构: { '/tmp': { 'a.txt': 'content', 'sub': { ... } } }
  // 用对象表示目录，字符串表示文件

  function lookup(path) {
    // path 形如 '/tmp/sub'，拆分为 ['', 'tmp', 'sub']
    const parts = path.split("/").filter(Boolean);
    let node = fsTree;
    for (const p of parts) {
      if (node == null || typeof node !== "object") return null;
      node = node[p];
    }
    return node;
  }

  function lookupParent(path) {
    const parts = path.split("/").filter(Boolean);
    const name = parts.pop();
    let node = fsTree;
    for (const p of parts) {
      if (node == null || typeof node !== "object") return null;
      node = node[p];
    }
    return { parent: node, name };
  }

  return {
    _tree: fsTree,
    join(...parts) {
      return parts.join("/").replace(/\/+/g, "/");
    },
    statSync(path) {
      const node = lookup(path);
      if (node === null || node === undefined) {
        const err = new Error("ENOENT");
        err.code = "ENOENT";
        throw err;
      }
      return {
        isFile: () => typeof node === "string",
        isDirectory: () => typeof node === "object" && node !== null,
      };
    },
    async stat(path) {
      return this.statSync(path);
    },
    readdirSync(path) {
      const node = lookup(path);
      if (typeof node !== "object" || node === null) {
        const err = new Error("ENOTDIR");
        err.code = "ENOTDIR";
        throw err;
      }
      return Object.keys(node);
    },
    async readdir(path) {
      return this.readdirSync(path);
    },
    unlinkSync(path) {
      const { parent, name } = lookupParent(path);
      if (!parent || !(name in parent)) {
        const err = new Error("ENOENT");
        err.code = "ENOENT";
        throw err;
      }
      delete parent[name];
    },
    async unlink(path) {
      return this.unlinkSync(path);
    },
    rmdirSync(path) {
      const { parent, name } = lookupParent(path);
      if (!parent || !(name in parent)) {
        const err = new Error("ENOENT");
        err.code = "ENOENT";
        throw err;
      }
      delete parent[name];
    },
    async rmdir(path) {
      return this.rmdirSync(path);
    },
  };
}

// ===== 测试 =====

// 测试 1：同步删除
const tree1 = {
  tmp: {
    "a.txt": "aaa",
    "b.txt": "bbb",
    sub: {
      "c.txt": "ccc",
      deep: {
        "d.txt": "ddd",
      },
    },
  },
};
const fs1 = createMockFs(tree1);
console.log("before delete tmp keys:", Object.keys(fs1._tree.tmp)); // ['a.txt','b.txt','sub']
removeDirRecursiveSync("tmp", fs1);
console.log("after delete tmp exists:", "tmp" in fs1._tree); // false

// 测试 2：删除单个文件
const tree2 = { tmp: { "file.txt": "x", "keep.txt": "y" } };
const fs2 = createMockFs(tree2);
removeDirRecursiveSync("tmp/file.txt", fs2);
console.log("test2 remaining:", Object.keys(fs2._tree.tmp)); // ['keep.txt']

// 测试 3：删除不存在的路径（不报错）
const tree3 = { tmp: { "a.txt": "x" } };
const fs3 = createMockFs(tree3);
removeDirRecursiveSync("tmp/not-exists", fs3);
console.log("test3 no error, tmp still there:", "tmp" in fs3._tree); // true

// 测试 4：异步删除
const tree4 = {
  data: {
    "1.txt": "1",
    sub1: { "2.txt": "2" },
    sub2: { deep: { "3.txt": "3" } },
  },
};
const fs4 = createMockFs(tree4);
(async () => {
  await removeDirRecursive("data", fs4);
  console.log("test4 async deleted:", !("data" in fs4._tree)); // true
})();

// 测试 5：删除空目录
const tree5 = { tmp: { empty: {} } };
const fs5 = createMockFs(tree5);
removeDirRecursiveSync("tmp/empty", fs5);
console.log("test5 empty dir removed:", !("empty" in fs5._tree.tmp)); // true
