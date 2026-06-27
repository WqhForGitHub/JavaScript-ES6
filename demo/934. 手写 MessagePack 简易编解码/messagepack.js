/**
 * 手写 MessagePack 简易编解码
 *
 * MessagePack 是一种高效的二进制序列化格式，比 JSON 更紧凑。
 *
 * 支持的类型：
 * - nil (0xc0)
 * - bool: true (0xc3), false (0xc2)
 * - int: positive fixint (0x00-0x7f), negative fixint (0xe0-0xff)
 * - float64 (0xcb)
 * - string: fixstr (0xa0-0xbf), str8 (0xd9), str16 (0xda)
 * - array: fixarray (0x90-0x9f), array16 (0xdc)
 * - map: fixmap (0x80-0x8f), map16 (0xde)
 */

// ===================== 格式标记常量 =====================

const Format = {
  NIL: 0xc0,
  FALSE: 0xc2,
  TRUE: 0xc3,
  BIN8: 0xc4,
  BIN16: 0xc5,
  FLOAT64: 0xcb,
  UINT8: 0xcc,
  UINT16: 0xcd,
  UINT32: 0xce,
  INT8: 0xd0,
  INT16: 0xd1,
  INT32: 0xd2,
  STR8: 0xd9,
  STR16: 0xda,
  ARRAY16: 0xdc,
  ARRAY32: 0xdd,
  MAP16: 0xde,
  MAP32: 0xdf,
};

// ===================== 编码器 =====================

/**
 * 编码器类，将 JS 值编码为 MessagePack 字节数组。
 */
class MessagePackEncoder {
  constructor() {
    this.bytes = [];
  }

  /**
   * 编码任意值。
   * @param {*} value - 要编码的值
   */
  encode(value) {
    if (value === null || value === undefined) {
      this.bytes.push(Format.NIL);
    } else if (typeof value === "boolean") {
      this.bytes.push(value ? Format.TRUE : Format.FALSE);
    } else if (typeof value === "number") {
      this.encodeNumber(value);
    } else if (typeof value === "string") {
      this.encodeString(value);
    } else if (Array.isArray(value)) {
      this.encodeArray(value);
    } else if (typeof value === "object") {
      this.encodeMap(value);
    } else {
      // 其他类型转为字符串
      this.encodeString(String(value));
    }
  }

  /**
   * 编码数字（区分整数和浮点数）。
   * @param {number} value - 数字
   */
  encodeNumber(value) {
    if (Number.isNaN(value)) {
      this.bytes.push(Format.NIL);
      return;
    }

    // 检查是否为安全整数
    if (Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER) {
      if (value >= 0) {
        // 非负整数
        if (value <= 0x7f) {
          // positive fixint
          this.bytes.push(value);
        } else if (value <= 0xff) {
          // uint8
          this.bytes.push(Format.UINT8, value);
        } else if (value <= 0xffff) {
          // uint16
          this.bytes.push(Format.UINT16);
          this.pushUint16(value);
        } else if (value <= 0xffffffff) {
          // uint32
          this.bytes.push(Format.UINT32);
          this.pushUint32(value);
        } else {
          // 超出 32 位范围用 float64
          this.encodeFloat64(value);
        }
      } else {
        // 负整数
        if (value >= -32) {
          // negative fixint: 0xe0 | (value + 32)  =>  value | 0xe0
          this.bytes.push(value & 0xff);
        } else if (value >= -128) {
          // int8
          this.bytes.push(Format.INT8);
          this.bytes.push(value & 0xff);
        } else if (value >= -32768) {
          // int16
          this.bytes.push(Format.INT16);
          this.pushInt16(value);
        } else if (value >= -2147483648) {
          // int32
          this.bytes.push(Format.INT32);
          this.pushInt32(value);
        } else {
          this.encodeFloat64(value);
        }
      }
    } else {
      // 浮点数
      this.encodeFloat64(value);
    }
  }

  /**
   * 编码 float64。
   * @param {number} value - 浮点数
   */
  encodeFloat64(value) {
    this.bytes.push(Format.FLOAT64);
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, value, false); // MessagePack 使用大端序
    for (let i = 0; i < 8; i++) {
      this.bytes.push(view.getUint8(i));
    }
  }

  /**
   * 编码字符串。
   * @param {string} str - 字符串
   */
  encodeString(str) {
    const utf8Bytes = Array.from(new TextEncoder().encode(str));
    const len = utf8Bytes.length;

    if (len <= 31) {
      // fixstr: 0xa0 | len
      this.bytes.push(0xa0 | len);
    } else if (len <= 0xff) {
      // str8
      this.bytes.push(Format.STR8, len);
    } else if (len <= 0xffff) {
      // str16
      this.bytes.push(Format.STR16);
      this.pushUint16(len);
    } else {
      // str32 (简化处理，使用 str16 不够时报错)
      throw new Error("String too long for this simplified implementation");
    }

    this.bytes.push(...utf8Bytes);
  }

  /**
   * 编码数组。
   * @param {Array} arr - 数组
   */
  encodeArray(arr) {
    const len = arr.length;
    if (len <= 15) {
      // fixarray: 0x90 | len
      this.bytes.push(0x90 | len);
    } else if (len <= 0xffff) {
      // array16
      this.bytes.push(Format.ARRAY16);
      this.pushUint16(len);
    } else {
      throw new Error("Array too long for this simplified implementation");
    }
    for (const item of arr) {
      this.encode(item);
    }
  }

  /**
   * 编码 map（普通对象）。
   * @param {Object} obj - 对象
   */
  encodeMap(obj) {
    const keys = Object.keys(obj);
    const len = keys.length;
    if (len <= 15) {
      // fixmap: 0x80 | len
      this.bytes.push(0x80 | len);
    } else if (len <= 0xffff) {
      // map16
      this.bytes.push(Format.MAP16);
      this.pushUint16(len);
    } else {
      throw new Error("Map too large for this simplified implementation");
    }
    for (const key of keys) {
      this.encodeString(key);
      this.encode(obj[key]);
    }
  }

  // ---------- 底层写入辅助 ----------

  /**
   * 写入无符号 16 位整数（大端序）。
   * @param {number} value
   */
  pushUint16(value) {
    this.bytes.push((value >> 8) & 0xff, value & 0xff);
  }

  /**
   * 写入无符号 32 位整数（大端序）。
   * @param {number} value
   */
  pushUint32(value) {
    this.bytes.push(
      (value >>> 24) & 0xff,
      (value >>> 16) & 0xff,
      (value >>> 8) & 0xff,
      value & 0xff,
    );
  }

  /**
   * 写入有符号 16 位整数（大端序）。
   * @param {number} value
   */
  pushInt16(value) {
    this.pushUint16(value & 0xffff);
  }

  /**
   * 写入有符号 32 位整数（大端序）。
   * @param {number} value
   */
  pushInt32(value) {
    this.pushUint32(value >>> 0);
  }

  /**
   * 获取编码后的字节数组。
   * @returns {number[]}
   */
  getBytes() {
    return this.bytes;
  }
}

// ===================== 解码器 =====================

/**
 * 解码器类，将 MessagePack 字节数组解码为 JS 值。
 */
class MessagePackDecoder {
  /**
   * @param {number[]} bytes - MessagePack 字节数组
   */
  constructor(bytes) {
    this.bytes = bytes;
    this.offset = 0;
  }

  /**
   * 解码为 JS 值。
   * @returns {*} 解码后的值
   */
  decode() {
    if (this.offset >= this.bytes.length) {
      throw new Error("Unexpected end of data");
    }

    const byte = this.bytes[this.offset++];

    // ---------- nil ----------
    if (byte === Format.NIL) return null;

    // ---------- bool ----------
    if (byte === Format.TRUE) return true;
    if (byte === Format.FALSE) return false;

    // ---------- positive fixint (0x00-0x7f) ----------
    if (byte <= 0x7f) return byte;

    // ---------- negative fixint (0xe0-0xff) ----------
    if (byte >= 0xe0) return byte - 256;

    // ---------- fixstr (0xa0-0xbf) ----------
    if (byte >= 0xa0 && byte <= 0xbf) {
      return this.readString(byte & 0x1f);
    }

    // ---------- fixarray (0x90-0x9f) ----------
    if (byte >= 0x90 && byte <= 0x9f) {
      return this.readArray(byte & 0x0f);
    }

    // ---------- fixmap (0x80-0x8f) ----------
    if (byte >= 0x80 && byte <= 0x8f) {
      return this.readMap(byte & 0x0f);
    }

    // ---------- 其他格式 ----------
    switch (byte) {
      case Format.UINT8:
        return this.bytes[this.offset++];
      case Format.UINT16:
        return this.readUint16();
      case Format.UINT32:
        return this.readUint32();
      case Format.INT8:
        return this.bytes[this.offset++] - 256;
      case Format.INT16:
        return this.readInt16();
      case Format.INT32:
        return this.readInt32();
      case Format.FLOAT64:
        return this.readFloat64();
      case Format.STR8:
        return this.readString(this.bytes[this.offset++]);
      case Format.STR16:
        return this.readString(this.readUint16());
      case Format.ARRAY16:
        return this.readArray(this.readUint16());
      case Format.ARRAY32:
        return this.readArray(this.readUint32());
      case Format.MAP16:
        return this.readMap(this.readUint16());
      case Format.MAP32:
        return this.readMap(this.readUint32());
      default:
        throw new Error("Unknown format byte: 0x" + byte.toString(16));
    }
  }

  /**
   * 读取无符号 16 位整数（大端序）。
   * @returns {number}
   */
  readUint16() {
    const high = this.bytes[this.offset++];
    const low = this.bytes[this.offset++];
    return (high << 8) | low;
  }

  /**
   * 读取无符号 32 位整数（大端序）。
   * @returns {number}
   */
  readUint32() {
    const b0 = this.bytes[this.offset++];
    const b1 = this.bytes[this.offset++];
    const b2 = this.bytes[this.offset++];
    const b3 = this.bytes[this.offset++];
    return ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
  }

  /**
   * 读取有符号 16 位整数（大端序）。
   * @returns {number}
   */
  readInt16() {
    const val = this.readUint16();
    return val >= 0x8000 ? val - 0x10000 : val;
  }

  /**
   * 读取有符号 32 位整数（大端序）。
   * @returns {number}
   */
  readInt32() {
    const val = this.readUint32();
    return val >= 0x80000000 ? val - 0x100000000 : val;
  }

  /**
   * 读取 float64（大端序）。
   * @returns {number}
   */
  readFloat64() {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    for (let i = 0; i < 8; i++) {
      view.setUint8(i, this.bytes[this.offset + i]);
    }
    this.offset += 8;
    return view.getFloat64(0, false); // big-endian
  }

  /**
   * 读取字符串。
   * @param {number} length - 字节长度
   * @returns {string}
   */
  readString(length) {
    const strBytes = this.bytes.slice(this.offset, this.offset + length);
    this.offset += length;
    return new TextDecoder().decode(new Uint8Array(strBytes));
  }

  /**
   * 读取数组。
   * @param {number} length - 元素数量
   * @returns {Array}
   */
  readArray(length) {
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(this.decode());
    }
    return arr;
  }

  /**
   * 读取 map。
   * @param {number} length - 键值对数量
   * @returns {Object}
   */
  readMap(length) {
    const obj = {};
    for (let i = 0; i < length; i++) {
      const key = this.decode();
      const value = this.decode();
      obj[key] = value;
    }
    return obj;
  }
}

// ===================== 公共 API =====================

/**
 * 将 JS 值编码为 MessagePack 字节数组。
 * @param {*} value - 要编码的值
 * @returns {number[]} MessagePack 字节数组
 */
function encodeMsgPack(value) {
  const encoder = new MessagePackEncoder();
  encoder.encode(value);
  return encoder.getBytes();
}

/**
 * 将 MessagePack 字节数组解码为 JS 值。
 * @param {number[]} bytes - MessagePack 字节数组
 * @returns {*} 解码后的值
 */
function decodeMsgPack(bytes) {
  const decoder = new MessagePackDecoder(bytes);
  return decoder.decode();
}

/**
 * 将字节数组格式化为十六进制字符串（方便调试）。
 * @param {number[]} bytes - 字节数组
 * @returns {string} 十六进制字符串
 */
function toHexString(bytes) {
  return bytes.map((b) => "0x" + b.toString(16).padStart(2, "0")).join(" ");
}

// ===================== 测试用例 =====================

console.log("===== 基本类型编码 =====");
console.log(
  "nil:",
  toHexString(encodeMsgPack(null)),
  "→",
  decodeMsgPack(encodeMsgPack(null)),
);
console.log(
  "true:",
  toHexString(encodeMsgPack(true)),
  "→",
  decodeMsgPack(encodeMsgPack(true)),
);
console.log(
  "false:",
  toHexString(encodeMsgPack(false)),
  "→",
  decodeMsgPack(encodeMsgPack(false)),
);

console.log("\n===== 整数编码 =====");
console.log(
  "0:",
  toHexString(encodeMsgPack(0)),
  "→",
  decodeMsgPack(encodeMsgPack(0)),
);
console.log(
  "127:",
  toHexString(encodeMsgPack(127)),
  "→",
  decodeMsgPack(encodeMsgPack(127)),
);
console.log(
  "128:",
  toHexString(encodeMsgPack(128)),
  "→",
  decodeMsgPack(encodeMsgPack(128)),
);
console.log(
  "255:",
  toHexString(encodeMsgPack(255)),
  "→",
  decodeMsgPack(encodeMsgPack(255)),
);
console.log(
  "256:",
  toHexString(encodeMsgPack(256)),
  "→",
  decodeMsgPack(encodeMsgPack(256)),
);
console.log(
  "65535:",
  toHexString(encodeMsgPack(65535)),
  "→",
  decodeMsgPack(encodeMsgPack(65535)),
);
console.log(
  "-1:",
  toHexString(encodeMsgPack(-1)),
  "→",
  decodeMsgPack(encodeMsgPack(-1)),
);
console.log(
  "-32:",
  toHexString(encodeMsgPack(-32)),
  "→",
  decodeMsgPack(encodeMsgPack(-32)),
);
console.log(
  "-33:",
  toHexString(encodeMsgPack(-33)),
  "→",
  decodeMsgPack(encodeMsgPack(-33)),
);
console.log(
  "-128:",
  toHexString(encodeMsgPack(-128)),
  "→",
  decodeMsgPack(encodeMsgPack(-128)),
);

console.log("\n===== 浮点数编码 =====");
console.log(
  "3.14:",
  toHexString(encodeMsgPack(3.14)),
  "→",
  decodeMsgPack(encodeMsgPack(3.14)),
);
console.log(
  "-0.5:",
  toHexString(encodeMsgPack(-0.5)),
  "→",
  decodeMsgPack(encodeMsgPack(-0.5)),
);
console.log(
  "1e10:",
  toHexString(encodeMsgPack(1e10)),
  "→",
  decodeMsgPack(encodeMsgPack(1e10)),
);

console.log("\n===== 字符串编码 =====");
console.log(
  '"":',
  toHexString(encodeMsgPack("")),
  "→",
  JSON.stringify(decodeMsgPack(encodeMsgPack(""))),
);
console.log(
  '"hi":',
  toHexString(encodeMsgPack("hi")),
  "→",
  JSON.stringify(decodeMsgPack(encodeMsgPack("hi"))),
);
const longStr = "a".repeat(50);
console.log(
  "50 chars:",
  toHexString(encodeMsgPack(longStr)).substring(0, 20) + "...",
  "→",
  decodeMsgPack(encodeMsgPack(longStr)).length === 50,
);
console.log(
  '"你好":',
  toHexString(encodeMsgPack("你好")),
  "→",
  decodeMsgPack(encodeMsgPack("你好")),
);

console.log("\n===== 数组编码 =====");
console.log(
  "[1,2,3]:",
  toHexString(encodeMsgPack([1, 2, 3])),
  "→",
  JSON.stringify(decodeMsgPack(encodeMsgPack([1, 2, 3]))),
);
console.log(
  "[]:",
  toHexString(encodeMsgPack([])),
  "→",
  JSON.stringify(decodeMsgPack(encodeMsgPack([]))),
);
console.log(
  '["a","b"]:',
  toHexString(encodeMsgPack(["a", "b"])),
  "→",
  JSON.stringify(decodeMsgPack(encodeMsgPack(["a", "b"]))),
);

console.log("\n===== Map(对象)编码 =====");
console.log(
  "{}:",
  toHexString(encodeMsgPack({})),
  "→",
  JSON.stringify(decodeMsgPack(encodeMsgPack({}))),
);
console.log(
  "{a:1}:",
  toHexString(encodeMsgPack({ a: 1 })),
  "→",
  JSON.stringify(decodeMsgPack(encodeMsgPack({ a: 1 }))),
);

console.log("\n===== 复杂嵌套对象往返测试 =====");
const complex = {
  name: "Alice",
  age: 30,
  active: true,
  scores: [95, 88, 92],
  address: {
    city: "Beijing",
    zip: "100000",
  },
  note: null,
  balance: 1234.56,
};
const encoded = encodeMsgPack(complex);
console.log("编码字节:", toHexString(encoded));
console.log("编码长度:", encoded.length, "bytes");
console.log("JSON 长度:", JSON.stringify(complex).length, "bytes");
const decoded = decodeMsgPack(encoded);
console.log("解码结果:", decoded);

console.log("\n===== 往返验证 =====");
console.log("name 正确:", decoded.name === "Alice");
console.log("age 正确:", decoded.age === 30);
console.log("active 正确:", decoded.active === true);
console.log("scores 正确:", JSON.stringify(decoded.scores) === "[95,88,92]");
console.log("address.city 正确:", decoded.address.city === "Beijing");
console.log("note 正确:", decoded.note === null);
console.log("balance 正确:", decoded.balance === 1234.56);

console.log("\n===== 大数组测试 =====");
const bigArray = Array.from({ length: 100 }, (_, i) => i);
const bigEncoded = encodeMsgPack(bigArray);
const bigDecoded = decodeMsgPack(bigEncoded);
console.log("大数组长度:", bigDecoded.length);
console.log(
  "大数组正确:",
  bigDecoded.every((v, i) => v === i),
);
