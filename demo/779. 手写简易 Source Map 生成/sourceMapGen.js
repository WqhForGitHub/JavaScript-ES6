/**
 * 手写简易 Source Map 生成
 *
 * Source Map V3 格式：
 *   mappings 用 VLQ Base64 编码，每段 5 字段差值
 *   [生成列, 源文件索引, 源行, 源列, 名称索引]
 *
 * 实现思路：
 *   1. 记录每个生成位置对应的源码位置
 *   2. 用 VLQ Base64 编码 mappings
 */

const BASE64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function encodeVLQ(value) {
  let vlq = value < 0 ? (-value << 1) | 1 : value << 1;
  let encoded = "";
  do {
    let digit = vlq & 0x1f;
    vlq >>>= 5;
    if (vlq > 0) digit |= 0x20;
    encoded += BASE64[digit];
  } while (vlq > 0);
  return encoded;
}

class SourceMapGenerator {
  constructor(file) {
    this.file = file;
    this.sources = [];
    this.names = [];
    this.mappings = [];
  }

  addMapping(genLine, genCol, source, srcLine, srcCol, name) {
    let si = this.sources.indexOf(source);
    if (si === -1) {
      si = this.sources.length;
      this.sources.push(source);
    }
    let ni;
    if (name) {
      ni = this.names.indexOf(name);
      if (ni === -1) {
        ni = this.names.length;
        this.names.push(name);
      }
    }
    this.mappings.push({
      genLine,
      genCol,
      srcIdx: si,
      srcLine,
      srcCol,
      nameIdx: ni,
    });
  }

  generate() {
    this.mappings.sort((a, b) => a.genLine - b.genLine || a.genCol - b.genCol);
    const parts = [];
    let curLine = 0,
      pCol = 0,
      pSrc = 0,
      pSL = 0,
      pSC = 0,
      pNI = 0;
    for (const m of this.mappings) {
      while (curLine < m.genLine) {
        parts.push(";");
        curLine++;
        pCol = 0;
      }
      if (parts.length && parts[parts.length - 1] !== ";") parts.push(",");
      parts.push(
        encodeVLQ(m.genCol - pCol) +
          encodeVLQ(m.srcIdx - pSrc) +
          encodeVLQ(m.srcLine - pSL) +
          encodeVLQ(m.srcCol - pSC) +
          (m.nameIdx !== undefined ? encodeVLQ(m.nameIdx - pNI) : ""),
      );
      pCol = m.genCol;
      pSrc = m.srcIdx;
      pSL = m.srcLine;
      pSC = m.srcCol;
      if (m.nameIdx !== undefined) pNI = m.nameIdx;
    }
    return {
      version: 3,
      file: this.file,
      sources: this.sources,
      names: this.names,
      mappings: parts.join(""),
    };
  }
}

// ===== 测试 =====
const gen = new SourceMapGenerator("bundle.js");
gen.addMapping(0, 0, "src.js", 0, 0, "add");
gen.addMapping(0, 10, "src.js", 0, 9, "a");
gen.addMapping(1, 2, "src.js", 1, 4);
const map = gen.generate();
console.log("Source Map:", JSON.stringify(map, null, 2));
console.log(
  "\nVLQ 编码: 0->" +
    encodeVLQ(0) +
    ", 1->" +
    encodeVLQ(1) +
    ", -1->" +
    encodeVLQ(-1) +
    ", 16->" +
    encodeVLQ(16),
);
