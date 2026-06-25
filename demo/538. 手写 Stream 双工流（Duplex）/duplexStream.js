/**
 * 手写 Stream 双工流（Duplex）
 *
 * 作用：模拟 Node.js stream.Duplex，它既可读又可写，但读和写是独立的两个通道
 *       （不像 Transform 那样写入数据会被变换后从可读端输出）。
 *       典型场景：TCP socket —— 一边接收数据，一边发送数据，两端互不影响。
 *
 *       关键 API：
 *         - 可读端：_read(size)、push(chunk)、on('data')、on('end')、pause/resume
 *         - 可写端：_write(chunk, encoding, cb)、write()、end()、on('drain')、on('finish')
 *
 * 实现思路：
 *   - 内部维护两个独立的状态：readState 和 writeState
 *   - 可读端逻辑同 Readable；可写端逻辑同 Writable
 *   - 两端互不干扰，可分别 end
 */

const { EventEmitter } = require("events");

class Duplex extends EventEmitter {
  constructor(options = {}) {
    super();
    // 可读端状态
    this._readState = {
      buffer: [],
      length: 0,
      flowing: null,
      ended: false,
      endEmitted: false,
      reading: false,
      highWaterMark: (options && options.readableHighWaterMark) || 16 * 1024,
    };
    // 可写端状态
    this._writeState = {
      buffer: [],
      length: 0,
      writing: false,
      ended: false,
      finished: false,
      needDrain: false,
      highWaterMark: (options && options.writableHighWaterMark) || 16 * 1024,
    };
    this._read = options.read || this._read.bind(this);
    this._write = options.write || this._write.bind(this);
    this._final = options.final || this._final.bind(this);
    this._destroyed = false;
  }

  // ===== 默认实现，子类覆盖 =====
  _read(size) {
    this.push(null);
  }
  _write(chunk, encoding, callback) {
    callback();
  }
  _final(callback) {
    callback();
  }

  // ===== 可读端 API =====
  push(chunk) {
    const s = this._readState;
    if (chunk === null) {
      s.ended = true;
      this._maybeEndRead();
      return false;
    }
    if (typeof chunk === "string") chunk = Buffer.from(chunk, "utf8");
    s.buffer.push(chunk);
    s.length += chunk.length;
    if (s.flowing === true) this._emitData();
    return s.length < s.highWaterMark;
  }

  _emitData() {
    const s = this._readState;
    while (s.flowing && s.buffer.length > 0) {
      const chunk = s.buffer.shift();
      s.length -= chunk.length;
      this.emit("data", chunk);
    }
    if (s.flowing && !s.ended && s.buffer.length === 0 && !s.reading) {
      s.reading = true;
      this._read(s.highWaterMark);
      s.reading = false;
    }
    this._maybeEndRead();
  }

  _maybeEndRead() {
    const s = this._readState;
    if (s.ended && s.buffer.length === 0 && !s.endEmitted) {
      s.endEmitted = true;
      this.emit("end");
    }
  }

  resume() {
    const s = this._readState;
    if (s.flowing !== true) {
      s.flowing = true;
      this._emitData();
    }
    return this;
  }

  pause() {
    this._readState.flowing = false;
    return this;
  }

  isPaused() {
    return this._readState.flowing === false;
  }

  // ===== 可写端 API =====
  write(chunk, encoding, callback) {
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = "utf8";
    }
    if (this._writeState.ended) throw new Error("write after end");
    if (typeof chunk === "string")
      chunk = Buffer.from(chunk, encoding || "utf8");

    const s = this._writeState;
    const cb = (err) => {
      if (err) this.emit("error", err);
      else if (callback) callback();
    };

    s.buffer.push({ chunk, encoding: encoding || "utf8", callback: cb });
    s.length += chunk.length;

    const ret = s.length < s.highWaterMark;
    if (!ret) s.needDrain = true;

    if (!s.writing) {
      s.writing = true;
      this._doWrite();
    }
    return ret;
  }

  _doWrite() {
    const s = this._writeState;
    if (s.buffer.length === 0) {
      s.writing = false;
      if (s.needDrain) {
        s.needDrain = false;
        this.emit("drain");
      }
      if (s.ended && !s.finished) {
        s.finished = true;
        this._final((err) => {
          if (err) this.emit("error", err);
          else this.emit("finish");
        });
      }
      return;
    }
    const { chunk, encoding, callback } = s.buffer.shift();
    s.length -= chunk.length;
    try {
      this._write(chunk, encoding, (err) => {
        callback(err);
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
    if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);
    const s = this._writeState;
    s.ended = true;
    if (callback) this.once("finish", callback);
    if (!s.writing) {
      s.writing = true;
      this._doWrite();
    }
    return this;
  }

  // 关闭两端
  destroy(err) {
    if (this._destroyed) return;
    this._destroyed = true;
    this._readState.buffer = [];
    this._writeState.buffer = [];
    if (err) this.emit("error", err);
    this.emit("close");
  }
}

// ===== 测试 =====

// 测试 1：模拟 socket，写入端记录到数组，读取端定时推送
const sentMessages = [];
const socket = new Duplex({
  write(chunk, encoding, cb) {
    sentMessages.push(chunk.toString());
    setTimeout(cb, 5);
  },
  read(size) {
    // 服务端推送两条消息
    if (!this._sent1) {
      this._sent1 = true;
      this.push(Buffer.from("server-msg-1\n"));
    } else if (!this._sent2) {
      this._sent2 = true;
      this.push(Buffer.from("server-msg-2\n"));
    } else {
      this.push(null);
    }
  },
});

const received = [];
socket.on("data", (d) => received.push(d.toString()));
socket.on("end", () => {
  console.log("test1 received:", received.join("")); // 'server-msg-1\nserver-msg-2\n'
});

socket.write("client-hello");
socket.write("client-bye");
socket.end(() => {
  console.log("test1 sent:", sentMessages); // ['client-hello', 'client-bye']
  console.log("test1 write finished");
});

// 测试 2：读端和写端独立结束
const echo = new Duplex({
  write(chunk, encoding, cb) {
    // 写入不向读端推送，保持独立
    setTimeout(cb, 1);
  },
  read() {
    this.push(Buffer.from("only-read"));
    this.push(null);
  },
});

let readResult = "";
echo.on("data", (d) => (readResult += d.toString()));
echo.on("end", () => console.log("test2 read end:", readResult)); // 'only-read'

echo.write("something");
echo.end(() => console.log("test2 write finish"));

// 测试 3：背压（写端水位线）
const w = new Duplex({
  highWaterMark: 5,
  writableHighWaterMark: 5,
  write(chunk, encoding, cb) {
    setTimeout(cb, 30);
  },
  read() {
    this.push(null);
  },
});
let okCount = 0;
for (let i = 0; i < 10; i++) {
  if (w.write("x")) okCount++;
}
console.log("test3 backpressure ok count:", okCount); // 大约 5 左右
w.on("drain", () => console.log("test3 drained"));
w.end();
