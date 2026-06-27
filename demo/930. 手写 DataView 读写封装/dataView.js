/**
 * 手写 DataView 读写封装（BinaryWriter / BinaryReader）
 *
 * 提供各种类型的读写方法：
 * - uint8 / int8   (1 字节)
 * - uint16 / int16 (2 字节)
 * - uint32 / int32 (4 字节)
 * - float32        (4 字节)
 * - float64        (8 字节)
 * 支持大端序（Big-Endian）和小端序（Little-Endian）。
 *
 * 设计思路：
 * - BinaryWriter：内部维护一个可自动扩容的 ArrayBuffer 和 DataView，
 *   按顺序写入各类型数据，支持链式调用
 * - BinaryReader：封装 ArrayBuffer 和 DataView，按顺序读取各类型数据
 * - 字符串读写：先写入 4 字节长度（uint32），再写入 UTF-8 字节
 */

/**
 * 二进制写入器
 */
class BinaryWriter {
  /**
   * @param {number} [size=256] - 初始缓冲区大小（字节）
   */
  constructor(size = 256) {
    this.buffer = new ArrayBuffer(size);
    this.view = new DataView(this.buffer);
    this.offset = 0;
  }

  /**
   * 确保缓冲区有足够空间，不足时自动扩容（翻倍）
   * @param {number} extra - 额外需要的字节数
   */
  ensureCapacity(extra) {
    if (this.offset + extra > this.buffer.byteLength) {
      let newLength = this.buffer.byteLength;
      while (newLength < this.offset + extra) newLength *= 2;
      const newBuffer = new ArrayBuffer(newLength);
      new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
      this.buffer = newBuffer;
      this.view = new DataView(this.buffer);
    }
  }

  /**
   * 写入无符号 8 位整数
   * @param {number} value - 0-255
   * @returns {BinaryWriter} this（支持链式调用）
   */
  writeUint8(value) {
    this.ensureCapacity(1);
    this.view.setUint8(this.offset, value & 0xff);
    this.offset += 1;
    return this;
  }

  /**
   * 写入有符号 8 位整数
   * @param {number} value - -128 到 127
   * @returns {BinaryWriter} this
   */
  writeInt8(value) {
    this.ensureCapacity(1);
    this.view.setInt8(this.offset, value);
    this.offset += 1;
    return this;
  }

  /**
   * 写入无符号 16 位整数
   * @param {number} value - 0-65535
   * @param {boolean} [littleEndian=false] - 是否小端序
   * @returns {BinaryWriter} this
   */
  writeUint16(value, littleEndian = false) {
    this.ensureCapacity(2);
    this.view.setUint16(this.offset, value & 0xffff, littleEndian);
    this.offset += 2;
    return this;
  }

  /**
   * 写入有符号 16 位整数
   * @param {number} value - -32768 到 32767
   * @param {boolean} [littleEndian=false] - 是否小端序
   * @returns {BinaryWriter} this
   */
  writeInt16(value, littleEndian = false) {
    this.ensureCapacity(2);
    this.view.setInt16(this.offset, value, littleEndian);
    this.offset += 2;
    return this;
  }

  /**
   * 写入无符号 32 位整数
   * @param {number} value - 0-4294967295
   * @param {boolean} [littleEndian=false] - 是否小端序
   * @returns {BinaryWriter} this
   */
  writeUint32(value, littleEndian = false) {
    this.ensureCapacity(4);
    this.view.setUint32(this.offset, value >>> 0, littleEndian);
    this.offset += 4;
    return this;
  }

  /**
   * 写入有符号 32 位整数
   * @param {number} value
   * @param {boolean} [littleEndian=false] - 是否小端序
   * @returns {BinaryWriter} this
   */
  writeInt32(value, littleEndian = false) {
    this.ensureCapacity(4);
    this.view.setInt32(this.offset, value, littleEndian);
    this.offset += 4;
    return this;
  }

  /**
   * 写入 32 位浮点数
   * @param {number} value
   * @param {boolean} [littleEndian=false] - 是否小端序
   * @returns {BinaryWriter} this
   */
  writeFloat32(value, littleEndian = false) {
    this.ensureCapacity(4);
    this.view.setFloat32(this.offset, value, littleEndian);
    this.offset += 4;
    return this;
  }

  /**
   * 写入 64 位浮点数
   * @param {number} value
   * @param {boolean} [littleEndian=false] - 是否小端序
   * @returns {BinaryWriter} this
   */
  writeFloat64(value, littleEndian = false) {
    this.ensureCapacity(8);
    this.view.setFloat64(this.offset, value, littleEndian);
    this.offset += 8;
    return this;
  }

  /**
   * 写入 UTF-8 字符串（先写 uint32 长度，再写字节）
   * @param {string} str - 要写入的字符串
   * @param {boolean} [littleEndian=false] - 长度字段的字节序
   * @returns {BinaryWriter} this
   */
  writeString(str, littleEndian = false) {
    // UTF-8 编码
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      let code = str.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
        const low = str.charCodeAt(i + 1);
        if (low >= 0xdc00 && low <= 0xdfff) {
          code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
          i++;
        }
      }
      if (code < 0x80) bytes.push(code);
      else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3f));
      } else if (code < 0x10000) {
        bytes.push(0xe0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      } else {
        bytes.push(0xf0 | (code >> 18));
        bytes.push(0x80 | ((code >> 12) & 0x3f));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      }
    }
    // 先写长度，再写字节
    this.writeUint32(bytes.length, littleEndian);
    this.ensureCapacity(bytes.length);
    for (const b of bytes) this.view.setUint8(this.offset++, b & 0xff);
    return this;
  }

  /**
   * 获取写入的数据（截取实际使用的部分）
   * @returns {ArrayBuffer}
   */
  toBuffer() {
    return this.buffer.slice(0, this.offset);
  }

  /** 获取当前已写入的字节长度 */
  get length() {
    return this.offset;
  }
}

/**
 * 二进制读取器
 */
class BinaryReader {
  /**
   * @param {ArrayBuffer} buffer - 要读取的缓冲区
   */
  constructor(buffer) {
    this.buffer = buffer;
    this.view = new DataView(buffer);
    this.offset = 0;
  }

  /** 读取无符号 8 位整数 */
  readUint8() {
    const v = this.view.getUint8(this.offset);
    this.offset += 1;
    return v;
  }

  /** 读取有符号 8 位整数 */
  readInt8() {
    const v = this.view.getInt8(this.offset);
    this.offset += 1;
    return v;
  }

  /**
   * 读取无符号 16 位整数
   * @param {boolean} [littleEndian=false]
   */
  readUint16(littleEndian = false) {
    const v = this.view.getUint16(this.offset, littleEndian);
    this.offset += 2;
    return v;
  }

  /**
   * 读取有符号 16 位整数
   * @param {boolean} [littleEndian=false]
   */
  readInt16(littleEndian = false) {
    const v = this.view.getInt16(this.offset, littleEndian);
    this.offset += 2;
    return v;
  }

  /**
   * 读取无符号 32 位整数
   * @param {boolean} [littleEndian=false]
   */
  readUint32(littleEndian = false) {
    const v = this.view.getUint32(this.offset, littleEndian);
    this.offset += 4;
    return v;
  }

  /**
   * 读取有符号 32 位整数
   * @param {boolean} [littleEndian=false]
   */
  readInt32(littleEndian = false) {
    const v = this.view.getInt32(this.offset, littleEndian);
    this.offset += 4;
    return v;
  }

  /**
   * 读取 32 位浮点数
   * @param {boolean} [littleEndian=false]
   */
  readFloat32(littleEndian = false) {
    const v = this.view.getFloat32(this.offset, littleEndian);
    this.offset += 4;
    return v;
  }

  /**
   * 读取 64 位浮点数
   * @param {boolean} [littleEndian=false]
   */
  readFloat64(littleEndian = false) {
    const v = this.view.getFloat64(this.offset, littleEndian);
    this.offset += 8;
    return v;
  }

  /**
   * 读取 UTF-8 字符串（先读 uint32 长度，再读字节并解码）
   * @param {boolean} [littleEndian=false] - 长度字段的字节序
   * @returns {string}
   */
  readString(littleEndian = false) {
    const length = this.readUint32(littleEndian);
    const bytes = [];
    for (let i = 0; i < length; i++)
      bytes.push(this.view.getUint8(this.offset++));
    // UTF-8 解码
    let result = "";
    let i = 0;
    while (i < bytes.length) {
      const b1 = bytes[i];
      let code;
      if (b1 < 0x80) {
        code = b1;
        i++;
      } else if (b1 < 0xe0) {
        code = ((b1 & 0x1f) << 6) | (bytes[i + 1] & 0x3f);
        i += 2;
      } else if (b1 < 0xf0) {
        code =
          ((b1 & 0x0f) << 12) |
          ((bytes[i + 1] & 0x3f) << 6) |
          (bytes[i + 2] & 0x3f);
        i += 3;
      } else {
        code =
          ((b1 & 0x07) << 18) |
          ((bytes[i + 1] & 0x3f) << 12) |
          ((bytes[i + 2] & 0x3f) << 6) |
          (bytes[i + 3] & 0x3f);
        i += 4;
      }
      if (code < 0x10000) result += String.fromCharCode(code);
      else {
        code -= 0x10000;
        result += String.fromCharCode(
          0xd800 + (code >> 10),
          0xdc00 + (code & 0x3ff),
        );
      }
    }
    return result;
  }

  /** 获取缓冲区总长度 */
  get length() {
    return this.buffer.byteLength;
  }
}

// ===================== 测试用例 =====================
console.log("===== BinaryWriter / BinaryReader 测试 =====");

// 大端序测试
console.log("\n--- 大端序（Big-Endian）---");
const writerBE = new BinaryWriter();
writerBE
  .writeUint8(0xff)
  .writeInt8(-1)
  .writeUint16(0x1234)
  .writeInt16(-1000)
  .writeUint32(0xdeadbeef)
  .writeInt32(-2000000)
  .writeFloat32(3.14)
  .writeFloat64(2.718281828459045)
  .writeString("Hello 中文 🎉");

const bufferBE = writerBE.toBuffer();
console.log(`写入字节数: ${bufferBE.byteLength}`);
console.log(
  `十六进制: ${Array.from(new Uint8Array(bufferBE))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ")}`,
);

const readerBE = new BinaryReader(bufferBE);
console.log(`uint8: ${readerBE.readUint8()}`);
console.log(`int8: ${readerBE.readInt8()}`);
console.log(`uint16: 0x${readerBE.readUint16().toString(16)}`);
console.log(`int16: ${readerBE.readInt16()}`);
console.log(`uint32: 0x${readerBE.readUint32().toString(16)}`);
console.log(`int32: ${readerBE.readInt32()}`);
console.log(`float32: ${readerBE.readFloat32()}`);
console.log(`float64: ${readerBE.readFloat64()}`);
console.log(`string: ${readerBE.readString()}`);

// 小端序测试
console.log("\n--- 小端序（Little-Endian）---");
const writerLE = new BinaryWriter();
writerLE
  .writeUint16(0x1234, true)
  .writeUint32(0xdeadbeef, true)
  .writeFloat64(123.456, true)
  .writeString("小端序测试", true);

const bufferLE = writerLE.toBuffer();
console.log(
  `十六进制: ${Array.from(new Uint8Array(bufferLE))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ")}`,
);

const readerLE = new BinaryReader(bufferLE);
console.log(`uint16: 0x${readerLE.readUint16(true).toString(16)}`);
console.log(`uint32: 0x${readerLE.readUint32(true).toString(16)}`);
console.log(`float64: ${readerLE.readFloat64(true)}`);
console.log(`string: ${readerLE.readString(true)}`);

// 往返验证
console.log("\n--- 往返验证 ---");
const data = {
  u8: 200,
  i8: -50,
  u16: 60000,
  i16: -30000,
  u32: 4000000000,
  i32: -1000000000,
  f32: 1.5,
  f64: 3.141592653589793,
  str: "数据验证 Test 数据",
};
const w = new BinaryWriter();
w.writeUint8(data.u8)
  .writeInt8(data.i8)
  .writeUint16(data.u16)
  .writeInt16(data.i16)
  .writeUint32(data.u32)
  .writeInt32(data.i32)
  .writeFloat32(data.f32)
  .writeFloat64(data.f64)
  .writeString(data.str);
const r = new BinaryReader(w.toBuffer());
const result = {
  u8: r.readUint8(),
  i8: r.readInt8(),
  u16: r.readUint16(),
  i16: r.readInt16(),
  u32: r.readUint32(),
  i32: r.readInt32(),
  f32: r.readFloat32(),
  f64: r.readFloat64(),
  str: r.readString(),
};
console.log("原始数据:", data);
console.log("读取数据:", result);
console.log(`uint8 一致: ${result.u8 === data.u8}`);
console.log(`int8 一致: ${result.i8 === data.i8}`);
console.log(`uint16 一致: ${result.u16 === data.u16}`);
console.log(`int16 一致: ${result.i16 === data.i16}`);
console.log(`uint32 一致: ${result.u32 === data.u32}`);
console.log(`int32 一致: ${result.i32 === data.i32}`);
console.log(`float32 一致: ${Math.abs(result.f32 - data.f32) < 1e-6}`);
console.log(`float64 一致: ${result.f64 === data.f64}`);
console.log(`string 一致: ${result.str === data.str}`);

// 自动扩容测试
console.log("\n--- 自动扩容测试 ---");
const smallWriter = new BinaryWriter(4); // 初始只有 4 字节
for (let i = 0; i < 100; i++) smallWriter.writeUint8(i);
console.log(
  `初始 4 字节，写入 100 字节后实际容量: ${smallWriter.buffer.byteLength}`,
);
console.log(`有效数据长度: ${smallWriter.length}`);
