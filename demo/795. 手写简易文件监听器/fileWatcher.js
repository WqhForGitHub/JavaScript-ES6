/**
 * 手写简易文件监听器
 *
 * 功能：监听文件/目录变化，触发回调
 * 实现思路：
 *   1. 轮询方式：定时检查文件 mtime
 *   2. 事件方式：使用 fs.watch / fs.watchFile
 *   3. 支持 debounce 避免频繁触发
 */

const fs = require('fs');
const path = require('path');

class FileWatcher {
  constructor(options = {}) {
    this.interval = options.interval || 1000;
    this.debounce = options.debounce || 300;
    this.watchers = new Map(); // path -> { lastMtime, timer, callback }
  }

  // 轮询方式监听
  watch(filePath, callback) {
    const abs = path.resolve(filePath);
    let lastMtime = 0;
    try { lastMtime = fs.statSync(abs).mtimeMs; } catch (e) {}
    this.watchers.set(abs, { lastMtime, callback });

    const check = () => {
      try {
        const stat = fs.statSync(abs);
        if (stat.mtimeMs > lastMtime) {
          lastMtime = stat.mtimeMs;
          // debounce
          if (this.watchers.get(abs).timer) clearTimeout(this.watchers.get(abs).timer);
          this.watchers.get(abs).timer = setTimeout(() => {
            callback(abs, 'change');
          }, this.debounce);
        }
      } catch (e) {
        callback(abs, 'unlink');
        this.unwatch(abs);
        return;
      }
      this.watchers.get(abs).timer = setTimeout(check, this.interval);
    };
    this.watchers.get(abs).timer = setTimeout(check, this.interval);
    console.log('[Watcher] Watching:', abs);
  }

  // 监听目录
  watchDir(dirPath, callback) {
    const abs = path.resolve(dirPath);
    const watchRecursively = (dir) => {
      fs.readdir(dir, (err, files) => {
        if (err) return;
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          fs.stat(fullPath, (err, stat) => {
            if (err) return;
            if (stat.isDirectory()) watchRecursively(fullPath);
            else this.watch(fullPath, callback);
          });
        });
      });
    };
    watchRecursively(abs);
  }

  unwatch(filePath) {
    const abs = path.resolve(filePath);
    const w = this.watchers.get(abs);
    if (w) { clearTimeout(w.timer); this.watchers.delete(abs); console.log('[Watcher] Stopped:', abs); }
  }

  close() {
    for (const [p, w] of this.watchers) { clearTimeout(w.timer); }
    this.watchers.clear();
    console.log('[Watcher] All watchers closed');
  }
}

// ===== 测试（模拟演示） =====
const watcher = new FileWatcher({ interval: 500, debounce: 200 });

// 模拟文件变化检测
console.log('=== 文件监听器演示 ===');
const mockFiles = new Map([['test.js', { mtime: 1000, content: 'old' }]]);
function mockStat(file) { return mockFiles.get(file); }

// 模拟检测变化
let mockLastMtime = 1000;
function mockCheck() {
  const stat = mockStat('test.js');
  if (stat.mtime > mockLastMtime) {
    console.log('[Watcher] File changed: test.js at', stat.mtime);
    mockLastMtime = stat.mtime;
  }
}

// 模拟文件修改
mockCheck(); // 无变化
mockFiles.set('test.js', { mtime: 2000, content: 'new' });
mockCheck(); // 检测到变化
mockCheck(); // 无变化

console.log('\n实际使用:');
console.log('watcher.watch("file.js", (path, event) => { ... })');
console.log('watcher.watchDir("./src", (path, event) => { ... })');
console.log('watcher.close()');
