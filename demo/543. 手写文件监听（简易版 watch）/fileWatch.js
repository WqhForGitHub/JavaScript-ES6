/**
 * 手写文件监听（简易版 watch）
 *
 * 作用：模拟 fs.watch / fs.watchFile，监听文件或目录的变化，
 *       当文件内容修改、创建、删除时触发回调。
 *
 * 实现思路（两种）：
 *   1. 轮询（polling）：定时 stat 文件，比较 mtime/size，发现变化时触发事件
 *      —— 兼容性最好，但性能较差
 *   2. 事件驱动：用 EventEmitter 包装，polling 检测到变化时 emit 'change'
 *
 *   这里实现轮询版 watch，支持：
 *     - 监听单文件
 *     - 监听目录（递归可选）
 *     - 区分 'change' 和 'rename'（增删）
 *     - 返回一个 close() 方法停止监听
 */

const { EventEmitter } = require('events');

class FileWatcher extends EventEmitter {
  constructor(fsDep, options = {}) {
    super();
    this.fs = fsDep;
    this.interval = options.interval || 100; // 轮询间隔(ms)
    this.recursive = options.recursive !== false; // 默认递归
    this._timers = new Set();
    this._snapshots = new Map(); // path -> { mtime, size, type, children }
    this._closed = false;
  }

  // 监听目标
  watch(targetPath) {
    this._snapshot(targetPath);
    const timer = setInterval(() => this._check(targetPath), this.interval);
    this._timers.add(timer);
    return this;
  }

  // 生成快照
  _snapshot(path) {
    try {
      const stat = this.fs.statSync(path);
      if (stat.isFile()) {
        this._snapshots.set(path, {
          type: 'file',
          mtime: stat.mtimeMs,
          size: stat.size,
          exists: true,
        });
      } else if (stat.isDirectory()) {
        const children = new Map();
        const entries = this.fs.readdirSync(path);
        for (const name of entries) {
          const childPath = this.fs.join(path, name);
          if (this.recursive) {
            this._snapshot(childPath);
          }
          const childStat = this.fs.statSync(childPath);
          children.set(name, {
            type: childStat.isFile() ? 'file' : 'dir',
            mtime: childStat.mtimeMs,
            size: childStat.size,
          });
        }
        this._snapshots.set(path, {
          type: 'dir',
          mtime: stat.mtimeMs,
          children,
          exists: true,
        });
      }
    } catch (err) {
      // 不存在则记录为不存在
      if (this._snapshots.has(path)) {
        const prev = this._snapshots.get(path);
        prev.exists = false;
      } else {
        this._snapshots.set(path, { exists: false });
      }
    }
  }

  // 检查变化
  _check(path) {
    if (this._closed) return;
    const prev = this._snapshots.get(path);
    if (!prev) return;

    let cur;
    try {
      const stat = this.fs.statSync(path);
      if (stat.isFile()) {
        cur = { type: 'file', mtime: stat.mtimeMs, size: stat.size, exists: true };
      } else if (stat.isDirectory()) {
        const children = new Map();
        const entries = this.fs.readdirSync(path);
        for (const name of entries) {
          const childPath = this.fs.join(path, name);
          const childStat = this.fs.statSync(childPath);
          children.set(name, {
            type: childStat.isFile() ? 'file' : 'dir',
            mtime: childStat.mtimeMs,
            size: childStat.size,
          });
          if (this.recursive && !this._snapshots.has(childPath)) {
            // 新增的子项
            this._snapshot(childPath);
            this.emit('change', 'rename', childPath);
          } else if (this.recursive) {
            this._check(childPath);
          }
        }
        cur = { type: 'dir', mtime: stat.mtimeMs, children, exists: true };
      }
    } catch (err) {
      cur = { exists: false };
    }

    // 比较文件
    if (prev.type === 'file') {
      if (!prev.exists && !cur.exists) {
        // 都不存在
      } else if (!cur.exists && prev.exists) {
        // 文件被删除
        this.emit('change', 'rename', path);
        this._snapshots.set(path, cur);
      } else if (cur.exists && !prev.exists) {
        // 文件被创建
        this.emit('change', 'rename', path);
        this._snapshots.set(path, cur);
      } else if (cur.size !== prev.size || cur.mtime !== prev.mtime) {
        // 文件被修改
        this.emit('change', 'change', path);
        this._snapshots.set(path, cur);
      }
    } else if (prev.type === 'dir' && cur && cur.type === 'dir') {
      // 比较目录子项
      const prevNames = new Set(prev.children.keys());
      const curNames = new Set(cur.children.keys());
      for (const name of curNames) {
        if (!prevNames.has(name)) {
          // 新增
          const childPath = this.fs.join(path, name);
          this.emit('change', 'rename', childPath);
        }
      }
      for (const name of prevNames) {
        if (!curNames.has(name)) {
          // 删除
          const childPath = this.fs.join(path, name);
          this.emit('change', 'rename', childPath);
        }
      }
      this._snapshots.set(path, cur);
    } else if (prev.exists && cur && !cur.exists) {
      // 目录被删除
      this.emit('change', 'rename', path);
      this._snapshots.set(path, cur);
    }
  }

  close() {
    this._closed = true;
    for (const t of this._timers) clearInterval(t);
    this._timers.clear();
    this._snapshots.clear();
    this.emit('close');
  }
}

// ===== Mock fs（带 mtime 模拟变化）=====
function createMockFs() {
  const files = new Map(); // path -> { content, mtime }
  const dirs = new Set();

  return {
    _files: files,
    _dirs: dirs,
    join: (...p) => p.join('/').replace(/\/+/g, '/'),
    writeFile(path, content) {
      files.set(path, { content, mtime: Date.now() + Math.random() });
      // 确保父目录存在
      const parts = path.split('/');
      parts.pop();
      let cur = '';
      for (const p of parts) {
        cur = cur ? cur + '/' + p : p;
        if (!dirs.has(cur) && !files.has(cur)) dirs.add(cur);
      }
    },
    unlink(path) {
      files.delete(path);
    },
    mkdir(path) {
      dirs.add(path);
    },
    rmdir(path) {
      dirs.delete(path);
    },
    statSync(path) {
      if (files.has(path)) {
        return {
          isFile: () => true,
          isDirectory: () => false,
          mtimeMs: files.get(path).mtime,
          size: files.get(path).content.length,
        };
      }
      if (dirs.has(path)) {
        return {
          isFile: () => false,
          isDirectory: () => true,
          mtimeMs: 0,
          size: 0,
        };
      }
      // 检查是否是某文件的父目录
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      throw err;
    },
    readdirSync(path) {
      const result = [];
      const prefix = path.endsWith('/') ? path : path + '/';
      // 列出直接子项
      for (const filePath of files.keys()) {
        if (filePath.startsWith(prefix)) {
          const rest = filePath.slice(prefix.length);
          if (!rest.includes('/')) result.push(rest);
        }
      }
      for (const dirPath of dirs) {
        if (dirPath.startsWith(prefix)) {
          const rest = dirPath.slice(prefix.length);
          if (rest && !rest.includes('/')) result.push(rest);
        }
      }
      return result;
    },
  };
}

// ===== 测试 =====

// 测试 1：监听文件变化
const fs1 = createMockFs();
fs1.writeFile('/tmp/test.txt', 'hello');

const watcher1 = new FileWatcher(fs1, { interval: 20 });
const events1 = [];
watcher1.on('change', (eventType, filename) => {
  events1.push({ eventType, filename });
});
watcher1.watch('/tmp/test.txt');

setTimeout(() => fs1.writeFile('/tmp/test.txt', 'hello world'), 30);
setTimeout(() => {
  console.log('test1 events:', events1);
  // 期望至少一个 { eventType: 'change', filename: '/tmp/test.txt' }
  console.log('test1 has change:', events1.some(e => e.eventType === 'change'));
  watcher1.close();
}, 80);

// 测试 2：监听目录新增文件
const fs2 = createMockFs();
fs2.mkdir('/tmp/dir');
const watcher2 = new FileWatcher(fs2, { interval: 20 });
const events2 = [];
watcher2.on('change', (eventType, filename) => {
  events2.push({ eventType, filename });
});
watcher2.watch('/tmp/dir');

setTimeout(() => fs2.writeFile('/tmp/dir/new.txt', 'x'), 30);
setTimeout(() => {
  console.log('test2 events:', events2);
  // 期望有 rename 事件指向 /tmp/dir/new.txt
  console.log('test2 has new file:', events2.some(e => e.filename.includes('new.txt')));
  watcher2.close();
}, 80);

// 测试 3：监听文件删除
const fs3 = createMockFs();
fs3.writeFile('/tmp/del.txt', 'x');
const watcher3 = new FileWatcher(fs3, { interval: 20 });
const events3 = [];
watcher3.on('change', (et, f) => events3.push({ et, f }));
watcher3.watch('/tmp/del.txt');
setTimeout(() => fs3.unlink('/tmp/del.txt'), 30);
setTimeout(() => {
  console.log('test3 events:', events3);
  console.log('test3 has rename (delete):', events3.some(e => e.et === 'rename'));
  watcher3.close();
}, 80);

// 测试 4：close 后不再触发
const fs4 = createMockFs();
fs4.writeFile('/tmp/c.txt', '1');
const watcher4 = new FileWatcher(fs4, { interval: 20 });
let count = 0;
watcher4.on('change', () => count++);
watcher4.watch('/tmp/c.txt');
setTimeout(() => watcher4.close(), 25);
setTimeout(() => fs4.writeFile('/tmp/c.txt', '2'), 50);
setTimeout(() => {
  console.log('test4 events after close:', count); // 0
}, 100);
