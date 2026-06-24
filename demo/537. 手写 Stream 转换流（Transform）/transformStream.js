/**
 * 手写 Stream 转换流（Transform）
 *
 * 作用：模拟 Node.js stream.Transform，它既可读又可写，
 *       写入的数据经过 _transform 处理后从可读端输出。
 *       典型用途：压缩、加密、格式转换等。
 *
 *       关键 API：
 *         - _transform(chunk, encoding, callback)：处理输入块，调用 callback(err, outputChunk)
 *         - _flush(callback)：流结束前最后一次输出（可选）
 *         - write()：从可写端写入
 *         - on('data')：从可读端读取变换后的数据
 *
 * 实现思路：
 *   - Transform 同时具备 Writable 和 Readable 的能力（这里简化为组合实现）
 *   - 内部维护一个 Readable 和一个 Writable
 *   - 当 Writable 收到数据时，调用 _transform 得到变换后的数据，push 到 Readable
 *   - 当 Writable 结束时，调用 _flush（若有），然后 push(null) 结束 Readable
 */

const { EventEmitter } = require('events');

class Transform extends EventEmitter {
  constructor(options = {}) {
    super();
    this._transformFn = options.transform || this._transform.bind(this);
    this._flushFn = options.flush || this._flush.bind(this);

    this._readBuffer = []; // 可读端缓冲
    this._readLength = 0;
    this._flowing = false;
    this._ended = false;
    this._writing = false;
    this._writeBuffer = [];
    this._writeLength = 0;
    this._finished = false;
    this.highWaterMark = options.highWaterMark || 16 * 1024;
  }

  // 默认实现，子类覆盖
  _transform(chunk, encoding, callback) {
    callback(null, chunk);
  }

  _flush(callback) {
    callback();
  }

  // 可写端：写入
  write(chunk, encoding, callback) {
    if (typeof chunk === 'string') chunk = Buffer.from(chunk, encoding || 'utf8');
    this._writeBuffer.push({ chunk, callback });
    this._writeLength += chunk.length;
    this._processWrite();
    return this._writeLength < this.highWaterMark;
  }

  end(chunk, encoding, callback) {
    if (chunk !== undefined && chunk !== null) this.write(chunk, encoding);
    if (typeof callback === 'function') this.once('finish', callback);
    this._ended = true;
    this._processWrite();
    return this;
  }

  _processWrite() {
    if (this._writing) return;
    if (this._writeBuffer.length === 0) {
      // 写缓冲空了，如果 end 了，触发 flush
      if (this._ended && !this._finished) {
        this._writing = true;
        try {
          this._flushFn(err => {
            this._writing = false;
            if (err) {
              this.emit('error', err);
              return;
            }
            this._finished = true;
            this._pushReadable(null); // 结束可读端
            this.emit('finish');
          });
        } catch (err) {
          this.emit('error', err);
        }
      }
      return;
    }

    this._writing = true;
    const { chunk, callback } = this._writeBuffer.shift();
    this._writeLength -= chunk.length;

    try {
      this._transformFn(chunk, 'utf8', (err, output) => {
        this._writing = false;
        if (err) {
          this.emit('error', err);
          if (callback) callback(err);
          return;
        }
        if (output !== undefined && output !== null) {
          this._pushReadable(output);
        }
        if (callback) callback();
        this._processWrite();
      });
    } catch (err) {
      this._writing = false;
      this.emit('error', err);
    }
  }

  // 推入可读端缓冲
  _pushReadable(chunk) {
    if (chunk === null) {
      this._ended = true;
      this._emitReadable();
      return;
    }
    if (typeof chunk === 'string') chunk = Buffer.from(chunk, 'utf8');
    this._readBuffer.push(chunk);
    this._readLength += chunk.length;
    if (this._flowing) this._emitReadable();
  }

  // 触发可读端 data
  _emitReadable() {
    while (this._flowing && this._readBuffer.length > 0) {
      const chunk = this._readBuffer.shift();
      this._readLength -= chunk.length;
      this.emit('data', chunk);
    }
    if (this._flowing && this._ended && this._readBuffer.length === 0) {
      this._endEmitted = true;
      this.emit('end');
    }
  }

  resume() {
    if (this._flowing) return this;
    this._flowing = true;
    this._emitReadable();
    return this;
  }

  pause() {
    this._flowing = false;
    return this;
  }

  pipe(dest) {
    this.on('data', c => dest.write(c));
    this.on('end', () => dest.end && dest.end());
    this.resume();
    return dest;
  }
}

// ===== 测试 =====

// 测试 1：转换为大写
const upper = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, Buffer.from(chunk.toString().toUpperCase()));
  },
});

let result1 = '';
upper.on('data', d => (result1 += d.toString()));
upper.on('end', () => {
  console.log('test1 upper:', result1); // 'HELLO WORLD'
});
upper.write('hello ');
upper.write('world');
upper.end();

// 测试 2：累积计数（每次输出累积字符数）
const counter = new Transform({
  transform(chunk, encoding, callback) {
    this._count = (this._count || 0) + chunk.length;
    callback(null, Buffer.from(this._count.toString() + ' '));
  },
});

let result2 = '';
counter.on('data', d => (result2 += d.toString()));
counter.on('end', () => {
  console.log('test2 counter:', result2.trim()); // '5 11 14' (按块累积)
});
counter.write('hello');
counter.write(' world66'); // 8 字节 -> 5+8=13
counter.write('!'); // 1 -> 14
counter.end();

// 测试 3：使用 _flush 输出汇总
const collecter = new Transform({
  transform(chunk, encoding, callback) {
    this._parts = this._parts || [];
    this._parts.push(chunk.toString());
    callback(null); // 不输出中间结果
  },
  flush(callback) {
    // 结束时输出汇总
    callback(null, Buffer.from(this._parts.join('|')));
  },
});

let result3 = '';
collecter.on('data', d => (result3 += d.toString()));
collecter.on('end', () => {
  console.log('test3 flush:', result3); // 'a|b|c'
});
collecter.write('a');
collecter.write('b');
collecter.write('c');
collecter.end();

// 测试 4：Base64 编码流（演示实用场景）
function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}
const b64Encoder = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, Buffer.from(bytesToBase64(chunk)));
  },
});
let result4 = '';
b64Encoder.on('data', d => (result4 += d.toString()));
b64Encoder.on('end', () => {
  console.log('test4 base64:', result4); // 'aGVsbG8=' (一段时)；多段会分别编码
});
b64Encoder.write('hello');
b64Encoder.end();
