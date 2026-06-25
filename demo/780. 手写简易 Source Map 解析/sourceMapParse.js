/**
 * 手写简易 Source Map 解析
 *
 * 功能：解析 V3 Source Map 的 mappings 字段
 * 实现思路：
 *   1. 按 ';' 分割行，按 ',' 分割段
 *   2. VLQ Base64 解码每个字段（差值累计）
 *   3. 4 字段：[生成列, 源文件, 源行, 源列]
 *      5 字段：额外 [名称索引]
 */

const BASE64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const B64MAP = {};
for (let i = 0; i < BASE64.length; i++) B64MAP[BASE64[i]] = i;

function decodeVLQ(str, pos) {
  let result = 0,
    shift = 0,
    cont;
  do {
    const digit = B64MAP[str[pos++]];
    cont = digit & 0x20;
    result += (digit & 0x1f) << shift;
    shift += 5;
  } while (cont);
  const neg = result & 1;
  result >>>= 1;
  return { value: neg ? -result : result, pos };
}

function parseSourceMap(raw) {
  const map = typeof raw === "string" ? JSON.parse(raw) : raw;
  const mappings = [];
  const lines = map.mappings.split(";");
  let pCol = 0,
    pSrc = 0,
    pSL = 0,
    pSC = 0,
    pNI = 0;
  for (let li = 0; li < lines.length; li++) {
    pCol = 0;
    if (lines[li] === "") continue;
    const segs = lines[li].split(",");
    for (const seg of segs) {
      if (seg === "") continue;
      let pos = 0;
      const r1 = decodeVLQ(seg, pos);
      pCol += r1.value;
      pos = r1.pos;
      const m = { genLine: li, genCol: pCol };
      if (pos < seg.length) {
        const r2 = decodeVLQ(seg, pos);
        pSrc += r2.value;
        pos = r2.pos;
        m.source = map.sources[pSrc];
        const r3 = decodeVLQ(seg, pos);
        pSL += r3.value;
        pos = r3.pos;
        m.srcLine = pSL;
        const r4 = decodeVLQ(seg, pos);
        pSC += r4.value;
        pos = r4.pos;
        m.srcCol = pSC;
        if (pos < seg.length) {
          const r5 = decodeVLQ(seg, pos);
          pNI += r5.value;
          m.name = map.names[pNI];
        }
      }
      mappings.push(m);
    }
  }
  return { ...map, parsedMappings: mappings };
}

// ===== 测试 =====
const rawMap = {
  version: 3,
  file: "bundle.js",
  sources: ["src.js"],
  names: ["add", "a", "b"],
  mappings: "AAAA,SAASA,CAACC,CAAGC",
};
const parsed = parseSourceMap(rawMap);
console.log("解析后的映射:");
parsed.parsedMappings.forEach((m) =>
  console.log(
    "  生成(" +
      m.genLine +
      ":" +
      m.genCol +
      ") -> 源(" +
      m.srcLine +
      ":" +
      m.srcCol +
      ") " +
      (m.source || "") +
      " " +
      (m.name || ""),
  ),
);
console.log(
  "\nVLQ 解码: A->" +
    decodeVLQ("A", 0).value +
    ", C->" +
    decodeVLQ("C", 0).value +
    ", D->" +
    decodeVLQ("D", 0).value,
);
