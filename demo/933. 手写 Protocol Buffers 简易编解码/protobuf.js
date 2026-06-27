/**
 * 手写 Protocol Buffers 简易编解码
 *
 * 实现一个类似 Protobuf 的简易编解码器。
 *
 * Wire Types（线型）：
 * - 0: Varint          — 变长整数（int32, int64, bool, enum 等）
 * - 1: 64-bit          — 固定 8 字节（fixed64, double 等）
 * - 2: Length-delimited — 长度前缀（string, bytes, 嵌套消息, packed 数组等）
 * - 5: 32-bit          — 固定 4 字节（fixed32, float 等）
 *
 * 字段键编码: key = (field_number << 3) | wire_type
 *
 * Schema 定义示例（Person 消息）：
 *   field 1, name  (string, wire type 2)
 *   field 2, age   (int32,  wire type 0)
 *   field 3, email (string, wire type 2)
 *   field 4, score (double, wire type 1)
 *   field 5, id    (fixed32, wire type 5)
 */

// ===================== Wire Type 常量 =====================

const WireType = {
  VARINT: 0, // 变长整数
  FIXED64: 1, // 64 位固定长度
  LENGTH_DELIMITED: 2, // 长度前缀
  FIXED32: 5, // 32 位固定长度
};

// ===================== 工具函数 =====================

/**
 * 将 tag（field_number + wire_type）编码为 varint。
 * @param {number} fieldNumber - 字段号
 * @param {number} wireType - 线型
 * @returns {number[]} 字节数组
 */
function encodeTag(fieldNumber, wireType) {
  const key = (fieldNumber << 3) | wireType;
  return encodeVarint(key);
}

/**
 * 编码 varint（可变长度整数）。
 * 每个字节的最高位（MSB）为 1 表示后续还有字节，低 7 位为数据。
 * @param {number} value - 要编码的非负整数
 * @returns {number[]} 字节数组
 */
function encodeVarint(value) {
  const bytes = [];
  // 使用无符号 32 位整数处理
  value = value >>> 0;
  while (value >= 0x80) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value & 0x7f);
  return bytes;
}

/**
 * 编码有符号整数为 varint（使用 ZigZag 编码）。
 * ZigZag: (n << 1) ^ (n >> 31)，将有符号数映射为无符号数。
 * @param {number} value - 有符号整数
 * @returns {number[]} 字节数组
 */
function encodeVarintZigZag(value) {
  // ZigZag 编码
  const zigzag = (value << 1) ^ (value >> 31);
  return encodeVarint(zigzag >>> 0);
}

/**
 * 编码 32 位固定长度（小端序）。
 * @param {number} value - 32 位整数
 * @returns {number[]} 4 字节数组
 */
function encodeFixed32(value) {
  const bytes = [];
  for (let i = 0; i < 4; i++) {
    bytes.push(value & 0xff);
    value >>>= 8;
  }
  return bytes;
}

/**
 * 编码 64 位固定长度（小端序，用两个 32 位表示）。
 * @param {number} valueLow - 低 32 位
 * @param {number} valueHigh - 高 32 位
 * @returns {number[]} 8 字节数组
 */
function encodeFixed64(valueLow, valueHigh) {
  const bytes = [];
  for (let i = 0; i < 4; i++) {
    bytes.push(valueLow & 0xff);
    valueLow >>>= 8;
  }
  for (let i = 0; i < 4; i++) {
    bytes.push(valueHigh & 0xff);
    valueHigh >>>= 8;
  }
  return bytes;
}

/**
 * 编码 double 为 8 字节小端序。
 * 使用 DataView 进行浮点数转换。
 * @param {number} value - 浮点数
 * @returns {number[]} 8 字节数组
 */
function encodeDouble(value) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value, true); // little-endian
  return Array.from(new Uint8Array(buffer));
}

/**
 * 编码字符串为 UTF-8 字节数组。
 * @param {string} str - 字符串
 * @returns {number[]} UTF-8 字节数组
 */
function encodeString(str) {
  return Array.from(new TextEncoder().encode(str));
}

// ===================== 解码函数 =====================

/**
 * 从字节缓冲区中解码 varint。
 * @param {number[]} bytes - 字节数组
 * @param {number} offset - 起始偏移
 * @returns {{value: number, nextOffset: number}} 解码值和下一个偏移
 */
function decodeVarint(bytes, offset) {
  let result = 0;
  let shift = 0;
  let byte;
  do {
    byte = bytes[offset++];
    result |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte & 0x80);
  return { value: result >>> 0, nextOffset: offset };
}

/**
 * 从 varint 值解码出 tag（field_number 和 wire_type）。
 * @param {number} tag - varint 值
 * @returns {{fieldNumber: number, wireType: number}}
 */
function decodeTag(tag) {
  return {
    fieldNumber: tag >>> 3,
    wireType: tag & 0x07,
  };
}

/**
 * 解码 32 位固定长度（小端序）。
 * @param {number[]} bytes - 字节数组
 * @param {number} offset - 起始偏移
 * @returns {{value: number, nextOffset: number}}
 */
function decodeFixed32(bytes, offset) {
  let value = 0;
  for (let i = 0; i < 4; i++) {
    value |= bytes[offset + i] << (i * 8);
  }
  return { value: value >>> 0, nextOffset: offset + 4 };
}

/**
 * 解码 64 位固定长度（小端序）。
 * @param {number[]} bytes - 字节数组
 * @param {number} offset - 起始偏移
 * @returns {{low: number, high: number, nextOffset: number}}
 */
function decodeFixed64(bytes, offset) {
  let low = 0,
    high = 0;
  for (let i = 0; i < 4; i++) {
    low |= bytes[offset + i] << (i * 8);
  }
  for (let i = 0; i < 4; i++) {
    high |= bytes[offset + 4 + i] << (i * 8);
  }
  return { low: low >>> 0, high: high >>> 0, nextOffset: offset + 8 };
}

/**
 * 解码 8 字节小端序为 double。
 * @param {number[]} bytes - 字节数组
 * @param {number} offset - 起始偏移
 * @returns {{value: number, nextOffset: number}}
 */
function decodeDouble(bytes, offset) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, bytes[offset + i]);
  }
  return { value: view.getFloat64(0, true), nextOffset: offset + 8 };
}

/**
 * 解码长度前缀数据。
 * @param {number[]} bytes - 字节数组
 * @param {number} offset - 起始偏移
 * @returns {{data: number[], nextOffset: number}}
 */
function decodeLengthDelimited(bytes, offset) {
  const { value: length, nextOffset } = decodeVarint(bytes, offset);
  const data = bytes.slice(nextOffset, nextOffset + length);
  return { data, nextOffset: nextOffset + length };
}

/**
 * 将字节数组解码为 UTF-8 字符串。
 * @param {number[]} bytes - 字节数组
 * @returns {string}
 */
function decodeString(bytes) {
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// ===================== 编码器 =====================

/**
 * 编码一个完整的消息。
 * @param {Object} message - 消息对象
 * @param {Object} schema - schema 定义，格式: { fieldName: { fieldNumber, type } }
 * @returns {number[]} 编码后的字节数组
 */
function encodeMessage(message, schema) {
  const bytes = [];

  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    const value = message[fieldName];
    if (value === undefined || value === null) continue; // 跳过未设置的字段

    const { fieldNumber, type } = fieldDef;

    switch (type) {
      case "int32":
      case "uint32":
      case "bool":
      case "enum": {
        const intVal = type === "bool" ? (value ? 1 : 0) : value;
        bytes.push(...encodeTag(fieldNumber, WireType.VARINT));
        bytes.push(...encodeVarint(intVal));
        break;
      }
      case "sint32": {
        bytes.push(...encodeTag(fieldNumber, WireType.VARINT));
        bytes.push(...encodeVarintZigZag(value));
        break;
      }
      case "string":
      case "bytes": {
        const encoded = type === "string" ? encodeString(value) : value;
        bytes.push(...encodeTag(fieldNumber, WireType.LENGTH_DELIMITED));
        bytes.push(...encodeVarint(encoded.length));
        bytes.push(...encoded);
        break;
      }
      case "double": {
        bytes.push(...encodeTag(fieldNumber, WireType.FIXED64));
        bytes.push(...encodeDouble(value));
        break;
      }
      case "fixed32": {
        bytes.push(...encodeTag(fieldNumber, WireType.FIXED32));
        bytes.push(...encodeFixed32(value));
        break;
      }
      case "fixed64": {
        bytes.push(...encodeTag(fieldNumber, WireType.FIXED64));
        bytes.push(...encodeFixed64(value >>> 0, 0));
        break;
      }
      default:
        throw new Error("Unsupported type: " + type);
    }
  }

  return bytes;
}

// ===================== 解码器 =====================

/**
 * 解码一个完整的消息。
 * @param {number[]} bytes - 字节数组
 * @param {Object} schema - schema 定义
 * @returns {Object} 解码后的消息对象
 */
function decodeMessage(bytes, schema) {
  // 构建 fieldNumber -> fieldDef 的反向映射
  const fieldMap = {};
  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    fieldMap[fieldDef.fieldNumber] = { ...fieldDef, name: fieldName };
  }

  const result = {};
  let offset = 0;

  while (offset < bytes.length) {
    // 读取 tag
    const { value: tag, nextOffset: tagOffset } = decodeVarint(bytes, offset);
    offset = tagOffset;

    const { fieldNumber, wireType } = decodeTag(tag);
    const fieldDef = fieldMap[fieldNumber];
    if (!fieldDef) {
      // 未知字段，跳过
      offset = skipField(bytes, offset, wireType);
      continue;
    }

    switch (fieldDef.type) {
      case "int32":
      case "uint32":
      case "enum": {
        const { value, nextOffset } = decodeVarint(bytes, offset);
        result[fieldDef.name] = value;
        offset = nextOffset;
        break;
      }
      case "bool": {
        const { value, nextOffset } = decodeVarint(bytes, offset);
        result[fieldDef.name] = value !== 0;
        offset = nextOffset;
        break;
      }
      case "sint32": {
        const { value, nextOffset } = decodeVarint(bytes, offset);
        // ZigZag 解码: (n >>> 1) ^ -(n & 1)
        result[fieldDef.name] = (value >>> 1) ^ -(value & 1);
        offset = nextOffset;
        break;
      }
      case "string": {
        const { data, nextOffset } = decodeLengthDelimited(bytes, offset);
        result[fieldDef.name] = decodeString(data);
        offset = nextOffset;
        break;
      }
      case "bytes": {
        const { data, nextOffset } = decodeLengthDelimited(bytes, offset);
        result[fieldDef.name] = data;
        offset = nextOffset;
        break;
      }
      case "double": {
        const { value, nextOffset } = decodeDouble(bytes, offset);
        result[fieldDef.name] = value;
        offset = nextOffset;
        break;
      }
      case "fixed32": {
        const { value, nextOffset } = decodeFixed32(bytes, offset);
        result[fieldDef.name] = value;
        offset = nextOffset;
        break;
      }
      case "fixed64": {
        const { low, high, nextOffset } = decodeFixed64(bytes, offset);
        result[fieldDef.name] = { low, high };
        offset = nextOffset;
        break;
      }
      default:
        offset = skipField(bytes, offset, wireType);
    }
  }

  return result;
}

/**
 * 跳过未知字段。
 * @param {number[]} bytes - 字节数组
 * @param {number} offset - 当前偏移
 * @param {number} wireType - 线型
 * @returns {number} 下一个偏移
 */
function skipField(bytes, offset, wireType) {
  switch (wireType) {
    case WireType.VARINT: {
      const { nextOffset } = decodeVarint(bytes, offset);
      return nextOffset;
    }
    case WireType.FIXED64:
      return offset + 8;
    case WireType.LENGTH_DELIMITED: {
      const { value: length, nextOffset } = decodeVarint(bytes, offset);
      return nextOffset + length;
    }
    case WireType.FIXED32:
      return offset + 4;
    default:
      throw new Error("Unknown wire type: " + wireType);
  }
}

// ===================== 测试用例 =====================

// 定义 Person 消息的 schema
const personSchema = {
  name: { fieldNumber: 1, type: "string" },
  age: { fieldNumber: 2, type: "int32" },
  email: { fieldNumber: 3, type: "string" },
  score: { fieldNumber: 4, type: "double" },
  id: { fieldNumber: 5, type: "fixed32" },
  active: { fieldNumber: 6, type: "bool" },
};

console.log("===== Varint 编码测试 =====");
console.log("encodeVarint(0):", encodeVarint(0)); // [0]
console.log("encodeVarint(1):", encodeVarint(1)); // [1]
console.log("encodeVarint(127):", encodeVarint(127)); // [127]
console.log("encodeVarint(128):", encodeVarint(128)); // [128, 1]
console.log("encodeVarint(300):", encodeVarint(300)); // [172, 2]

console.log("\n===== Varint 解码测试 =====");
console.log("decodeVarint([172, 2]):", decodeVarint([172, 2], 0)); // 300

console.log("\n===== ZigZag 编码测试 =====");
console.log("encodeVarintZigZag(0):", encodeVarintZigZag(0)); // [0]
console.log("encodeVarintZigZag(-1):", encodeVarintZigZag(-1)); // [1]
console.log("encodeVarintZigZag(1):", encodeVarintZigZag(1)); // [2]
console.log("encodeVarintZigZag(-2):", encodeVarintZigZag(-2)); // [3]

console.log("\n===== Person 消息编解码 =====");
const person = {
  name: "Alice Zhang",
  age: 30,
  email: "alice@example.com",
  score: 95.5,
  id: 123456,
  active: true,
};
console.log("原始消息:", person);

const encoded = encodeMessage(person, personSchema);
console.log("编码后字节数:", encoded.length);
console.log("编码后字节:", encoded);

const decoded = decodeMessage(encoded, personSchema);
console.log("解码后消息:", decoded);

console.log("\n===== 往返验证 =====");
console.log("name 正确:", decoded.name === person.name);
console.log("age 正确:", decoded.age === person.age);
console.log("email 正确:", decoded.email === person.email);
console.log("score 正确:", decoded.score === person.score);
console.log("id 正确:", decoded.id === person.id);
console.log("active 正确:", decoded.active === person.active);

console.log("\n===== 部分字段测试（跳过未设置字段）=====");
const partial = { name: "Bob", age: 25 };
const partialEncoded = encodeMessage(partial, personSchema);
console.log("部分编码字节:", partialEncoded);
const partialDecoded = decodeMessage(partialEncoded, personSchema);
console.log("部分解码:", partialDecoded);

console.log("\n===== 中文 UTF-8 测试 =====");
const chinesePerson = {
  name: "张三",
  age: 28,
  email: "zhangsan@中文.测试",
  score: 88.8,
  id: 999,
  active: false,
};
const cnEncoded = encodeMessage(chinesePerson, personSchema);
const cnDecoded = decodeMessage(cnEncoded, personSchema);
console.log("中文解码:", cnDecoded);
console.log("中文 name 正确:", cnDecoded.name === "张三");
console.log("中文 email 正确:", cnDecoded.email === "zhangsan@中文.测试");

console.log("\n===== 大整数测试 =====");
const bigNum = {
  name: "Test",
  age: 2000000000,
  email: "",
  score: 0,
  id: 4294967295,
  active: true,
};
const bigEncoded = encodeMessage(bigNum, personSchema);
const bigDecoded = decodeMessage(bigEncoded, personSchema);
console.log("大数解码:", bigDecoded);
console.log("age 正确:", bigDecoded.age === 2000000000);
console.log("id 正确:", bigDecoded.id === 4294967295);
