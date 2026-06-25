/**
 * 手写简易协议缓冲区编解码（Protobuf Codec）
 *
 * 实现 Protocol Buffers 简化版的编码与解码。
 * 采用基于 tag 的二进制编码：
 *   - 每个 field 前缀一个 varint tag：(field_number << 3) | wire_type
 *   - wire_type 0: Varint（int32/int64/bool）
 *   - wire_type 2: Length-delimited（string/bytes/嵌套 message）
 *
 * 实现思路：
 * 1. encodeVarint / decodeVarint：变长整数编解码（每字节 7 位有效位）。
 * 2. encodeMessage：遍历字段定义，根据类型分别编码。
 * 3. decodeMessage：读 tag -> 解析 field_number 和 wire_type -> 按类型解码。
 *
 * 约定字段定义格式：
 *   { fieldNumber: { type: 'varint' | 'string' | 'message', name, nested?: {...} } }
 *
 * @param {Object} fields - 字段定义
 * @param {Object} data - 待编码数据
 * @returns {Uint8Array} 编码后的字节
 */
function encodeVarint(value) {
  const bytes = [];
  value = value >>> 0; // 当作无符号处理（简化版）
  while (value > 0x7f) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value & 0x7f);
  return bytes;
}

function decodeVarint(bytes, offset) {
  let result = 0;
  let shift = 0;
  let pos = offset;
  while (true) {
    const byte = bytes[pos++];
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return { value: result >>> 0, nextOffset: pos };
}

function makeTag(fieldNumber, wireType) {
  return (fieldNumber << 3) | wireType;
}

function parseTag(tag) {
  return { fieldNumber: tag >>> 3, wireType: tag & 0x07 };
}

function encodeMessage(fields, data) {
  const bytes = [];
  for (const [fieldNumStr, def] of Object.entries(fields)) {
    const fieldNum = parseInt(fieldNumStr, 10);
    const value = data[def.name];
    if (value === undefined || value === null) continue;

    if (def.type === "varint") {
      bytes.push(...encodeVarint(makeTag(fieldNum, 0)));
      // 支持有符号数转无符号（zigzag 简化：负数用 32 位补码）
      const uv = value < 0 ? value >>> 0 : value;
      bytes.push(...encodeVarint(uv));
    } else if (def.type === "string") {
      bytes.push(...encodeVarint(makeTag(fieldNum, 2)));
      const strBytes = [...new TextEncoder().encode(value)];
      bytes.push(...encodeVarint(strBytes.length));
      bytes.push(...strBytes);
    } else if (def.type === "message") {
      const subBytes = encodeMessage(def.nested, value);
      bytes.push(...encodeVarint(makeTag(fieldNum, 2)));
      bytes.push(...encodeVarint(subBytes.length));
      bytes.push(...subBytes);
    }
  }
  return bytes;
}

function decodeMessage(fields, bytes, offset = 0, end) {
  end = end !== undefined ? end : bytes.length;
  const result = {};
  while (offset < end) {
    const { value: tag, nextOffset } = decodeVarint(bytes, offset);
    offset = nextOffset;
    const { fieldNumber, wireType } = parseTag(tag);

    const def = fields[fieldNumber];
    if (!def) {
      // 未知字段：跳过
      if (wireType === 0) {
        const r = decodeVarint(bytes, offset);
        offset = r.nextOffset;
      } else if (wireType === 2) {
        const r = decodeVarint(bytes, offset);
        const len = r.value;
        offset = r.nextOffset + len;
      }
      continue;
    }

    if (def.type === "varint") {
      const r = decodeVarint(bytes, offset);
      offset = r.nextOffset;
      result[def.name] = r.value;
    } else if (def.type === "string") {
      const lenR = decodeVarint(bytes, offset);
      offset = lenR.nextOffset;
      result[def.name] = new TextDecoder().decode(
        new Uint8Array(bytes.slice(offset, offset + lenR.value)),
      );
      offset += lenR.value;
    } else if (def.type === "message") {
      const lenR = decodeVarint(bytes, offset);
      offset = lenR.nextOffset;
      result[def.name] = decodeMessage(
        def.nested,
        bytes,
        offset,
        offset + lenR.value,
      );
      offset += lenR.value;
    }
  }
  return result;
}

function protobufCodec(fields, data) {
  return {
    encode: () => new Uint8Array(encodeMessage(fields, data)),
    decode: (bytes) => decodeMessage(fields, Array.from(bytes)),
  };
}

// ===== 测试用例 =====
const personFields = {
  1: { type: "string", name: "name" },
  2: { type: "varint", name: "age" },
  3: { type: "string", name: "email" },
  4: {
    type: "message",
    name: "address",
    nested: {
      1: { type: "string", name: "city" },
      2: { type: "string", name: "street" },
    },
  },
};

const data = {
  name: "张三",
  age: 30,
  email: "zhangsan@example.com",
  address: { city: "北京", street: "长安街1号" },
};

const codec = protobufCodec(personFields, data);
const encoded = codec.encode();
console.log("编码字节数:", encoded.length);
console.log("编码内容:", Array.from(encoded).join(", "));

const decoded = codec.decode(encoded);
console.log(JSON.stringify(decoded, null, 2));
// 期望输出:
// {
//   "name": "张三",
//   "age": 30,
//   "email": "zhangsan@example.com",
//   "address": { "city": "北京", "street": "长安街1号" }
// }

console.log(decoded.name); // 期望输出: 张三
console.log(decoded.address.city); // 期望输出: 北京
