/**
 * 手写 Stream 可读流（Readable）
 *
 * 作用：模拟 Node.js stream.Readable，提供一个可读取数据的事件驱动流。
 *       关键 API/事件：
 *         - _read(size)：子类实现，从底层拉取数据并 push 到内部缓冲
 *         - push(chunk)：把数据推入缓冲，触发 'data' 事件
 *         - on('data')：消费数据
 *         - on('end')：数据读完
 *         - on('error')：出错
 *         - pause() / resume()：控制流
 *         - highWaterMark：水位线，控制 push 返回 false 暂停读取
 *
 * 实现思路：
 *   - 维护内部缓冲 buffer（用数组模拟）
 *   - reading 标记是否正在调用 _read
 *   - flowing 模式：true 时自动触发 'data'；false 时暂停
 *   - push(chunk)：null 表示结束；否则入缓冲，若 flowing 则立即 emit 'data'
 *   - resume() 启动流动模式并尝试读取
 *   - pause() 停止流动模式
 *   - read(n)：从缓冲取出 n 字节
 *   - 当 _read 返回 null 且 flowing 时，触发 'end'
 */

const { EventEmitter } = require('events');

class Readable extends EventEmitter {
  constructor(options = {}) {
    super();
    this._buffer = []; // 字节块队列
    this._bufferLength = 0;
    this._reading = false;
    this._flowing = options.readableFlowing !== false ? true : null;
    this._ended = false;
    this._destroyed = false;
    this.highWaterMark = options.highWaterMark || 16 * 1024;
    this.encoding = options.encoding || null;
    this._read = options.read || this._read.bind(this);
  }

  // 默认 _read（子类应覆盖）
  _read(size) {
    this.push(null);
  }

  // 推入数据
  push(chunk) {
    if (this._ended) return false;

    // null 表示流结束
    if (chunk === null) {
      this._ended = true;
      this._maybeEnd();
      return false;
    }

    // 字符串默认按 utf8 转字节
    if (typeof chunk === 'string') {
      chunk = Buffer.from(chunk, this.encoding || 'utf8');
    }

    this._buffer.push(chunk);
    this._bufferLength += chunk.length;

    // flowing 模式立即触发 'data'
    if (this._flowing === true) {
      this._emitData();
    }

    // 返回是否还在水位线下，可以继续 push
    return this._bufferLength < this.highWaterMark;
  }

  // 触发 'data' 事件，排空缓冲
  _emitData() {
    while (this._flowing && this._buffer.length > 0) {
      const chunk = this._buffer.shift();
      this._bufferLength -= chunk.length;

      // 若设置了 encoding，转换为字符串
      const data = this.encoding ? chunk.toString(this.encoding) : chunk;
      this.emit('data', data);
    }
    // 缓冲空了但还没结束，继续 _read
    if (this._flowing && !this._ended && this._buffer.length === 0 && !this._reading) {
      this._reading = true;
      this._read(this.highWaterMark);
      this._reading = false;
    }
    this._maybeEnd();
  }

  _maybeEnd() {
    if (this._ended && this._buffer.length === 0 && !this._endEmitted) {
      this._endEmitted = true;
      this.emit('end');
    }
  }

  // 启动流动模式
  resume() {
    if (this._destroyed) return;
    if (this._flowing !== true) {
      this._flowing = true;
      this._emitData();
    }
    return this;
  }

  // 暂停流动模式
  pause() {
    this._flowing = false;
    return this;
  }

  isPaused() {
    return this._flowing === false;
  }

  // 从缓冲读取指定字节数（暂停模式下使用）
  read(n) {
    if (n === undefined) {
      // 读取全部
      if (this._buffer.length === 0) return null;
      const all = Buffer.concat(this._buffer);
      this._buffer = [];
      this._bufferLength = 0;
      return this.encoding ? all.toString(this.encoding) : all;
    }

    if (this._bufferLength < n) return null;

    const collected = [];
    let collectedLen = 0;
    while (collectedLen < n && this._buffer.length > 0) {
      const chunk = this._buffer.shift();
      this._bufferLength -= chunk.length;
      if (collectedLen + chunk.length <= n) {
        collected.push(chunk);
        collectedLen += chunk.length;
      } else {
        // 需要切割
        const need = n - collectedLen;
        collected.push(chunk.slice(0, need));
        this._buffer.unshift(chunk.slice(need));
        this._bufferLength += chunk.length - need;
        collectedLen = n;
      }
    }
    const result = Buffer.concat(collected);
    return this.encoding ? result.toString(this.encoding) : result;
  }

  pipe(dest, options = {}) {
    this.on('data', chunk => {
      const ret = dest.write(chunk);
      if (ret === false) this.pause();
    });
    if (options.end !== false) {
      this.on('end', () => dest.end && dest.end());
    }
    dest.on && dest.on('drain', () => this.resume());
    return dest;
  }

  destroy(err) {
    if (this._destroyed) return;
    this._destroyed = true;
    this._ended = true;
    this._buffer = [];
    this._bufferLength = 0;
    if (err) this.emit('error', err);
    this.emit('close');
  }
}

// ===== 测试 =====

// 测试 1：简单字符串流
const chunks = ['Hello, ', 'World', '!\n'];
const r1 = new Readable({
  read(size) {
    if (chunks.length > 0) {
      this.push(chunks.shift());
    } else {
      this.push(null);
    }
  },
});

let result1 = '';
r1.on('data', d => (result1 += d.toString()));
r1.on('end', () => {
  console.log('test1 result:', result1); // 'Hello, World!\n'
});

// 测试 2：暂停/恢复
const data2 = ['A', 'B', 'C', 'D'];
const r2 = new Readable({
  read() {
    if (data2.length) this.push(data2.shift());
    else this.push(null);
  },
});

const collected2 = [];
r2.on('data', d => {
  collected2.push(d.toString());
  if (collected2.length === 2) {
    r2.pause();
    setTimeout(() => r2.resume(), 10);
  }
});
r2.on('end', () => {
  console.log('test2 (pause/resume):', collected2.join('')); // 'ABCD'
});

// 测试 3：read(n) 暂停模式
const r3 = new Readable({
  read() {
    for (let i = 0; i < 3; i++) this.push(Buffer.from([i + 1]));
    this.push(null);
  },
});
r3.pause();
setTimeout(() => {
  const first = r3.read(2);
  console.log('test3 read(2):', Array.from(first)); // [1, 2]
  const rest = r3.read();
  console.log('test3 read() rest:', Array.from(rest)); // [3]
}, 20);

// 测试 4：encoding 模式输出字符串
const r4 = new Readable({
  encoding: 'utf8',
  read() {
    this.push(Buffer.from([0x68, 0x69])); // 'hi'
    this.push(null);
  },
});
r4.on('data', d => {
  console.log('test4 encoding:', typeof d, d); // 'string', 'hi'
});
