/**
 * 手写管道链（pipe）
 *
 * 作用：模拟 Node.js 流的 pipe 机制，并支持链式调用（src.pipe(t1).pipe(t2).pipe(dest)）。
 *       pipe 把可读流的数据自动写入可写流，并处理背压（drain）。
 *       常用于：读取文件 -> 解压 -> 解密 -> 写入文件 这类流水线。
 *
 * 实现思路：
 *   - 在 Readable 上实现 pipe(dest, options)：
 *       监听 'data' 把数据写到 dest；dest.write 返回 false 时 pause；
 *       监听 dest 的 'drain' 恢复 resume；
 *       监听 'end' 调用 dest.end()（除非 options.end === false）
 *       监听 'error' 传播错误
 *       返回 dest 以便链式调用
 *   - 配合简单的 Readable / Writable / Transform 实现链式管道
 */

const { EventEmitter } = require('events');

// ===== 简化版 Readable =====
class Readable extends EventEmitter {
  constructor(options = {}) {
    super();
    this._buffer = [];
    this._length = 0;
    this._flowing = false;
    this._ended = false;
    this._reading = false;
    this._read = options.read || this._read.bind(this);
    this.highWaterMark = options.highWaterMark || 16 * 1024;
  }
  _read() {
    this.push(null);
  }
  push(chunk) {
    if (chunk === null) {
      this._ended = true;
      this._maybeEnd();
      return false;
    }
    if (typeof chunk === 'string') chunk = Buffer.from(chunk);
    this._buffer.push(chunk);
    this._length += chunk.length;
    if (this._flowing) this._emitData();
    return this._length < this.highWaterMark;
  }
  _emitData() {
    while (this._flowing && this._buffer.length > 0) {
      const chunk = this._buffer.shift();
      this._length -= chunk.length;
      this.emit('data', chunk);
    }
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
  resume() {
    if (!this._flowing) {
      this._flowing = true;
      this._emitData();
    }
    return this;
  }
  pause() {
    this._flowing = false;
    return this;
  }
  pipe(dest, options = {}) {
    const ondata = chunk => {
      const ret = dest.write(chunk);
      if (ret === false) this.pause();
    };
    this.on('data', ondata);

    const ondrain = () => this.resume();
    if (dest.on) dest.on('drain', ondrain);

    const onend = () => {
      if (options.end !== false && dest.end) dest.end();
    };
    this.on('end', onend);

    const onerror = err => {
      this.destroy && this.destroy(err);
      if (dest.destroy) dest.destroy(err);
    };
    this.on('error', onerror);
    if (dest.on) dest.on('error', onerror);

    // 启动流动
    this.resume();

    // 支持解绑
    dest.unpipe = () => {
      this.removeListener('data', ondata);
      this.removeListener('end', onend);
      this.removeListener('error', onerror);
      if (dest.removeListener) {
        dest.removeListener('drain', ondrain);
      }
    };

    return dest; // 返回 dest，支持链式
  }
  destroy(err) {
    if (this._destroyed) return;
    this._destroyed = true;
    this._buffer = [];
    if (err) this.emit('error', err);
    this.emit('close');
  }
}

// ===== 简化版 Writable =====
class Writable extends EventEmitter {
  constructor(options = {}) {
    super();
    this._buffer = [];
    this._length = 0;
    this._writing = false;
    this._ended = false;
    this._finished = false;
    this._needDrain = false;
    this._write = options.write || this._write.bind(this);
    this.highWaterMark = options.highWaterMark || 16 * 1024;
    this.chunks = []; // 记录所有写入（便于测试）
  }
  _write(chunk, encoding, cb) {
    cb();
  }
  write(chunk, encoding, cb) {
    if (typeof chunk === 'string') chunk = Buffer.from(chunk);
    if (this._ended) throw new Error('write after end');
    const state = this;
    this._buffer.push({ chunk, cb: err => {
      if (err) this.emit('error', err);
      else if (cb) cb();
    } });
    this._length += chunk.length;
    const ret = this._length < this.highWaterMark;
    if (!ret) this._needDrain = true;
    if (!this._writing) {
      this._writing = true;
      this._doWrite();
    }
    return ret;
  }
  _doWrite() {
    if (this._buffer.length === 0) {
      this._writing = false;
      if (this._needDrain) {
        this._needDrain = false;
        this.emit('drain');
      }
      if (this._ended && !this._finished) {
        this._finished = true;
        this.emit('finish');
      }
      return;
    }
    const { chunk, cb } = this._buffer.shift();
    this._length -= chunk.length;
    this.chunks.push(chunk);
    try {
      this._write(chunk, 'utf8', err => {
        cb(err);
        if (!this._destroyed) this._doWrite();
      });
    } catch (err) {
      cb(err);
    }
  }
  end(chunk, cb) {
    if (chunk !== undefined && chunk !== null) this.write(chunk);
    if (cb) this.once('finish', cb);
    this._ended = true;
    if (!this._writing) {
      this._writing = true;
      this._doWrite();
    }
    return this;
  }
}

// ===== 简化版 Transform（可读可写、写入数据变换后从读端输出）=====
class Transform extends Writable {
  constructor(options = {}) {
    super(options);
    this._transform = options.transform || this._transform.bind(this);
    this._tBuffer = [];
    this._tLength = 0;
    this._tFlowing = false;
    this._tEnded = false;
    this._tEndEmitted = false;
  }
  _transform(chunk, encoding, cb) {
    cb(null, chunk);
  }
  _write(chunk, encoding, cb) {
    // 调用 _transform 并把结果推到可读端
    this._transform(chunk, encoding, (err, out) => {
      if (err) return cb(err);
      if (out !== undefined && out !== null) {
        if (typeof out === 'string') out = Buffer.from(out);
        this._tBuffer.push(out);
        this._tLength += out.length;
        if (this._tFlowing) this._tEmitData();
      }
      cb();
    });
  }
  end(chunk, cb) {
    const origFinish = () => {
      this._tEnded = true;
      if (this._tFlowing) this._tEmitData();
      if (cb) cb();
    };
    super.end(chunk, origFinish);
  }
  _tEmitData() {
    while (this._tFlowing && this._tBuffer.length > 0) {
      const chunk = this._tBuffer.shift();
      this._tLength -= chunk.length;
      this.emit('data', chunk);
    }
    if (this._tFlowing && this._tEnded && this._tBuffer.length === 0 && !this._tEndEmitted) {
      this._tEndEmitted = true;
      this.emit('end');
    }
  }
  resume() {
    this._tFlowing = true;
    this._tEmitData();
    return this;
  }
  pause() {
    this._tFlowing = false;
    return this;
  }
}

// ===== 测试 =====

// 测试 1：简单 pipe
const src1 = new Readable({
  read() {
    this.push(Buffer.from('hello '));
    this.push(Buffer.from('world'));
    this.push(null);
  },
});
const dest1 = new Writable({
  write(chunk, enc, cb) {
    setTimeout(cb, 1);
  },
});
src1.pipe(dest1);
dest1.on('finish', () => {
  console.log('test1 piped:', Buffer.concat(dest1.chunks).toString()); // 'hello world'
});

// 测试 2：链式 pipe (src -> upper -> reverse -> dest)
const upper = new Transform({
  transform(chunk, enc, cb) {
    cb(null, Buffer.from(chunk.toString().toUpperCase()));
  },
});
const reverse = new Transform({
  transform(chunk, enc, cb) {
    const s = chunk.toString();
    cb(null, Buffer.from(s.split('').reverse().join('')));
  },
});

const src2 = new Readable({
  read() {
    this.push(Buffer.from('abc'));
    this.push(Buffer.from('XYZ'));
    this.push(null);
  },
});
const dest2 = new Writable({
  write(chunk, enc, cb) {
    setTimeout(cb, 1);
  },
});

// 链式调用核心：pipe 返回 dest，对返回值再 pipe
src2.pipe(upper).pipe(reverse).pipe(dest2);

dest2.on('finish', () => {
  console.log('test2 chain:', Buffer.concat(dest2.chunks).toString());
  // 'abc' -> 'ABC' -> 'CBA'
  // 'XYZ' -> 'XYZ' -> 'ZYX'
  // 结果: 'CBAZYX'
});

// 测试 3：背压测试 —— 慢写入时 pipe 会自动暂停上游
const slowDest = new Writable({
  highWaterMark: 5,
  write(chunk, enc, cb) {
    setTimeout(cb, 20);
  },
});
const src3 = new Readable({
  read() {
    for (let i = 0; i < 10; i++) this.push(Buffer.from('xxxxx')); // 每块 5 字节
    this.push(null);
  },
});
src3.pipe(slowDest);
slowDest.on('finish', () => {
  console.log('test3 backpressure piped bytes:', slowDest.chunks.length * 5); // 50
});
