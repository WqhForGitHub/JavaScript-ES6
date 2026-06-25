/**
 * 手写 Stream 可写流（Writable）
 *
 * 作用：模拟 Node.js stream.Writable，提供事件驱动的写入流。
 *       关键 API/事件：
 *         - _write(chunk, encoding, callback)：子类实现，把数据写入底层
 *         - write(chunk, encoding, callback)：写入数据，返回 false 表示需要等待 drain
 *         - end(chunk, callback)：标记结束，触发 'finish'
 *         - 'drain' 事件：缓冲排空后可继续写入
 *         - 'finish' 事件：所有数据写完且 end() 被调用
 *         - 'error' 事件
 *         - highWaterMark：缓冲水位线
 *
 * 实现思路：
 *   - 维护写缓冲队列 buffer（待写入底层的 chunk 数组）
 *   - writing 标记是否正在写底层
 *   - write(chunk)：入缓冲；若 writing 则入队等待；否则立即执行 _write
 *     返回值：缓冲长度 < highWaterMark 时 true，否则 false（建议等 drain）
 *   - _write 完成后回调，处理下一个缓冲
 *   - end() 设置 ended 标记，全部写完后 emit 'finish'
 *   - 缓冲排空且 needDrain 时 emit 'drain'
 */

const { EventEmitter } = require("events");

class Writable extends EventEmitter {
  constructor(options = {}) {
    super();
    this._writableState = {
      buffer: [], // 待写入的队列 { chunk, encoding, callback }
      bufferedLength: 0,
      writing: false, // 是否正在写底层
      ended: false, // 是否调用过 end
      finished: false,
      needDrain: false,
      highWaterMark: options.highWaterMark || 16 * 1024,
      decodeStrings: options.decodeStrings !== false,
    };
    this._write = options.write || this._write.bind(this);
    this._final = options.final || this._final.bind(this);
    this._destroyed = false;
  }

  // 默认 _write（子类应覆盖）
  _write(chunk, encoding, callback) {
    callback();
  }

  _final(callback) {
    callback();
  }

  write(chunk, encoding, callback) {
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = "utf8";
    }
    if (this._writableState.ended) {
      throw new Error("write after end");
    }
    if (typeof chunk === "string") {
      chunk = Buffer.from(chunk, encoding || "utf8");
    }

    const state = this._writableState;
    const cb = (err) => {
      if (err) this.emit("error", err);
      else if (callback) callback();
    };

    state.buffer.push({ chunk, encoding: encoding || "utf8", callback: cb });
    state.bufferedLength += chunk.length;

    const ret = state.bufferedLength < state.highWaterMark;

    if (!ret) state.needDrain = true;

    if (!state.writing) {
      state.writing = true;
      this._doWrite();
    }

    return ret;
  }

  _doWrite() {
    const state = this._writableState;
    if (state.buffer.length === 0) {
      state.writing = false;
      // 触发 drain
      if (state.needDrain) {
        state.needDrain = false;
        this.emit("drain");
      }
      // 如果已 end，执行 final
      if (state.ended && !state.finished) {
        state.finished = true;
        this._final((err) => {
          if (err) this.emit("error", err);
          else this.emit("finish");
        });
      }
      return;
    }

    const { chunk, encoding, callback } = state.buffer.shift();
    state.bufferedLength -= chunk.length;

    try {
      this._write(chunk, encoding, (err) => {
        callback(err);
        // 继续写下一个
        if (!this._destroyed) this._doWrite();
      });
    } catch (err) {
      callback(err);
      if (!this._destroyed) this._doWrite();
    }
  }

  end(chunk, encoding, callback) {
    if (typeof chunk === "function") {
      callback = chunk;
      chunk = null;
    } else if (typeof encoding === "function") {
      callback = encoding;
      encoding = "utf8";
    }

    if (chunk !== null && chunk !== undefined) {
      this.write(chunk, encoding);
    }

    const state = this._writableState;
    state.ended = true;

    if (callback) this.once("finish", callback);

    if (!state.writing) {
      // 没有正在写，直接进入结束流程
      state.writing = true;
      this._doWrite();
    }
    return this;
  }

  destroy(err) {
    if (this._destroyed) return;
    this._destroyed = true;
    this._writableState.buffer = [];
    if (err) this.emit("error", err);
    this.emit("close");
  }
}

// ===== 测试 =====

// 测试 1：基本写入
const written1 = [];
const w1 = new Writable({
  write(chunk, encoding, cb) {
    written1.push(chunk.toString());
    // 模拟异步写
    setTimeout(cb, 5);
  },
});

w1.write("a");
w1.write("b");
w1.write("c");
w1.end(() => {
  console.log("test1 written:", written1); // ['a', 'b', 'c']
  console.log("test1 finish emitted");
});

// 测试 2：背压（highWaterMark）
const written2 = [];
const w2 = new Writable({
  highWaterMark: 10,
  write(chunk, encoding, cb) {
    written2.push(chunk.toString());
    setTimeout(cb, 30); // 慢写入
  },
});

let drained = false;
let canWriteCount = 0;
for (let i = 0; i < 5; i++) {
  const ok = w2.write("xyz"); // 每次写 3 字节
  if (ok) canWriteCount++;
}
console.log("test2 initial ok count (backpressure):", canWriteCount); // 3 左右（10/3≈3）
w2.on("drain", () => {
  drained = true;
  console.log("test2 drain fired");
});
w2.end(() => {
  console.log("test2 all written:", written2);
});

// 测试 3：错误处理
const w3 = new Writable({
  write(chunk, encoding, cb) {
    cb(new Error("write fail"));
  },
});
w3.on("error", (err) => {
  console.log("test3 error:", err.message); // 'write fail'
});
w3.write("data");
