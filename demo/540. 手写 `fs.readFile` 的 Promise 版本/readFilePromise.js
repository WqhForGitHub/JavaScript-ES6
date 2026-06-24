/**
 * 手写 `fs.readFile` 的 Promise 版本
 *
 * 作用：把 Node.js 风格的回调式 fs.readFile 封装成 Promise，支持 async/await。
 *       readFile(path, options) 返回 Promise<Buffer|string>
 *
 * 实现思路（三种方式）：
 *   方式一：手动用 new Promise 包装回调 API
 *   方式二：使用 util.promisify 的原理 —— 通用包装器
 *   方式三：基于流（createReadStream + chunks 拼接）
 *
 *   这里实现方式一和方式二（通用 promisify），并在测试中用 mock fs 演示。
 */

// ===== 通用 promisify（util.promisify 原理）=====
function promisify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type function');
  }
  function fn(...args) {
    return new Promise((resolve, reject) => {
      original.call(this, ...args, (err, ...values) => {
        if (err) reject(err);
        else resolve(values.length > 1 ? values : values[0]);
      });
    });
  }
  // 设置 __promisify__ 让 promisify 自身也兼容
  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
  return fn;
}

// ===== 方式一：手写包装某个特定回调函数 =====
function readFilePromise(readFileFn, path, options) {
  return new Promise((resolve, reject) => {
    readFileFn(path, options, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// ===== 方式二：通用 readFile（接受 options，返回 Promise）=====
function makeReadFilePromise(readFileFn) {
  return function (path, options) {
    return new Promise((resolve, reject) => {
      readFileFn(path, options, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  };
}

// ===== 方式三：基于流实现 readFile =====
function readFileFromStream(createReadStreamFn, path, options) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = createReadStreamFn(path, options);
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => {
      const data = Buffer.concat(chunks);
      resolve(options && options.encoding ? data.toString(options.encoding) : data);
    });
    stream.on('error', reject);
  });
}

// ===== Mock fs 模块用于测试 =====
const mockFs = {
  _files: {
    '/tmp/hello.txt': Buffer.from('hello world'),
    '/tmp/data.json': Buffer.from(JSON.stringify({ a: 1, b: 2 })),
    '/tmp/big.txt': Buffer.from('x'.repeat(100)),
  },
  readFile(path, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = undefined;
    }
    setImmediate(() => {
      const data = this._files[path];
      if (!data) {
        cb(new Error(`ENOENT: no such file or directory, open '${path}'`));
        return;
      }
      if (options && options.encoding) {
        cb(null, data.toString(options.encoding));
      } else {
        cb(null, Buffer.from(data)); // 返回副本
      }
    });
  },
  createReadStream(path, options) {
    const { EventEmitter } = require('events');
    const stream = new EventEmitter();
    setImmediate(() => {
      const data = this._files[path];
      if (!data) {
        stream.emit('error', new Error(`ENOENT: no such file or directory, open '${path}'`));
        return;
      }
      // 分两块推送
      const half = Math.floor(data.length / 2);
      stream.emit('data', data.slice(0, half));
      if (half < data.length) stream.emit('data', data.slice(half));
      stream.emit('end');
    });
    return stream;
  },
};

// ===== 测试 =====

(async () => {
  // 测试 1：方式一 —— 读取 Buffer
  const buf = await readFilePromise(mockFs.readFile.bind(mockFs), '/tmp/hello.txt');
  console.log('test1 buffer:', buf.toString()); // 'hello world'

  // 测试 2：方式一 —— 指定 encoding 返回字符串
  const str = await readFilePromise(
    (path, options, cb) => mockFs.readFile(path, options, cb),
    '/tmp/hello.txt',
    { encoding: 'utf8' }
  );
  console.log('test2 string:', str); // 'hello world'

  // 测试 3：通用 promisify
  const readFile = promisify(mockFs.readFile.bind(mockFs));
  const json = await readFile('/tmp/data.json', { encoding: 'utf8' });
  console.log('test3 json:', JSON.parse(json)); // { a: 1, b: 2 }

  // 测试 4：makeReadFilePromise
  const myReadFile = makeReadFilePromise(mockFs.readFile.bind(mockFs));
  const big = await myReadFile('/tmp/big.txt', { encoding: 'utf8' });
  console.log('test4 length:', big.length); // 100

  // 测试 5：基于流
  const streamed = await readFileFromStream(mockFs.createReadStream.bind(mockFs), '/tmp/hello.txt');
  console.log('test5 stream:', streamed.toString()); // 'hello world'

  // 测试 6：错误处理
  try {
    await readFile('/tmp/not-exists.txt');
  } catch (err) {
    console.log('test6 error caught:', err.message.includes('ENOENT')); // true
  }

  // 测试 7：async/await 与 try/catch
  try {
    const content = await myReadFile('/tmp/hello.txt', { encoding: 'utf8' });
    console.log('test7 await:', content === 'hello world'); // true
  } catch (err) {
    console.log('test7 unexpected error');
  }

  console.log('all tests done');
})();
