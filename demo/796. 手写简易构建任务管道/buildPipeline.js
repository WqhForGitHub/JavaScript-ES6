/**
 * 手写简易构建任务管道
 *
 * 功能：类似 Gulp，将多个任务串联/并联执行
 * 实现思路：
 *   1. 每个 task 接收输入，返回输出
 *   2. series: 串联执行，上一个的输出是下一个的输入
 *   3. parallel: 并联执行，合并所有输出
 *   4. 支持 watch 模式
 */

class Pipeline {
  constructor() { this.tasks = new Map(); }

  // 注册任务
  task(name, fn) { this.tasks.set(name, fn); return this; }

  // 串联执行
  series(...fns) {
    return async (input) => {
      let result = input;
      for (const fn of fns) {
        const task = typeof fn === 'string' ? this.tasks.get(fn) : fn;
        result = await task(result);
      }
      return result;
    };
  }

  // 并联执行
  parallel(...fns) {
    return async (input) => {
      const results = await Promise.all(fns.map(fn => {
        const task = typeof fn === 'string' ? this.tasks.get(fn) : fn;
        return task(input);
      }));
      return results.flat();
    };
  }

  // 管道执行
  async run(input, ...fns) {
    const pipeline = this.series(...fns);
    return await pipeline(input);
  }
}

// ===== 测试 =====
const pipe = new Pipeline();

pipe.task('read', async (files) => {
  return files.map(f => ({ name: f, content: 'content of ' + f }));
});

pipe.task('transform', async (files) => {
  return files.map(f => ({ ...f, content: f.content.toUpperCase() }));
});

pipe.task('minify', async (files) => {
  return files.map(f => ({ ...f, content: f.content.replace(/\s+/g, ' ').trim() }));
});

pipe.task('write', async (files) => {
  files.forEach(f => console.log('  Written:', f.name, '->', f.content.slice(0, 30)));
  return files;
});

// 串联测试
console.log('=== 串联执行 ===');
const result = await pipe.run(['a.js', 'b.js'], 'read', 'transform', 'minify', 'write');
console.log('处理文件数:', result.length); // 2

// 并联测试
console.log('\n=== 并联执行 ===');
const parallelResult = await pipe.parallel(
  async (files) => files.map(f => f + '.min'),
  async (files) => files.map(f => f + '.gz'),
)(['a.js', 'b.js']);
console.log('并联结果:', parallelResult); // ['a.js.min', 'b.js.min', 'a.js.gz', 'b.js.gz']
