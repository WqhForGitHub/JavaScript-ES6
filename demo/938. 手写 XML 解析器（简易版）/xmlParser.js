/**
 * 手写 XML 解析器（简易版）
 *
 * 不使用 DOMParser，从零实现 XML 解析器。
 * 支持：
 * - 嵌套元素
 * - 属性（解析为 @ 前缀属性）
 * - 文本内容（解析为 #text 属性）
 * - 自闭合标签
 * - CDATA 区段（基本支持）
 * - XML 声明跳过
 * - 注释跳过
 *
 * 解析结果结构约定（与 xmlGenerator.js 对应）：
 * - 属性 → { "@attrName": "value" }
 * - 文本 → { "#text": "text content" }
 * - 同名子元素 → 数组
 * - 特殊字符反转义
 */

// ===================== XML 实体反转义 =====================

/**
 * XML 实体反转义映射表。
 */
const xmlEntities = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&apos;": "'",
};

/**
 * 反转义 XML 实体。
 * @param {string} str - 包含实体的字符串
 * @returns {string} 反转义后的字符串
 */
function unescapeXML(str) {
  if (!str) return "";
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&amp;/g, "&"); // &amp; 最后处理，避免二次替换
}

// ===================== 词法分析 =====================

/**
 * XML 词法分析器，将 XML 字符串分解为 token 流。
 */
class XMLLexer {
  /**
   * @param {string} text - XML 文本
   */
  constructor(text) {
    this.text = text;
    this.pos = 0;
    this.len = text.length;
  }

  /**
   * 跳过空白字符。
   */
  skipWhitespace() {
    while (this.pos < this.len) {
      const ch = this.text[this.pos];
      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        this.pos++;
      } else {
        break;
      }
    }
  }

  /**
   * 获取下一个 token。
   * @returns {{type: string, value: string}} token
   */
  next() {
    this.skipWhitespace();

    if (this.pos >= this.len) return { type: "EOF", value: "" };

    // 处理 CDATA 区段: <![CDATA[ ... ]]>
    if (this.text.startsWith("<![CDATA[", this.pos)) {
      return this.readCDATA();
    }

    // 处理注释: <!-- ... -->
    if (this.text.startsWith("<!--", this.pos)) {
      return this.readComment();
    }

    // 处理处理指令 / 声明: <? ... ?>
    if (this.text.startsWith("<?", this.pos)) {
      return this.readProcessingInstruction();
    }

    // 处理结束标签: </tag>
    if (this.text.startsWith("</", this.pos)) {
      return this.readClosingTag();
    }

    // 处理开始标签: <tag ...>
    if (this.text[this.pos] === "<") {
      return this.readOpeningTag();
    }

    // 处理文本内容
    return this.readText();
  }

  /**
   * 读取 CDATA 区段。
   * @returns {{type: string, value: string}}
   */
  readCDATA() {
    this.pos += 9; // 跳过 <![CDATA[
    const start = this.pos;
    const endIdx = this.text.indexOf("]]>", this.pos);
    if (endIdx === -1) throw new SyntaxError("Unterminated CDATA section");
    const content = this.text.substring(start, endIdx);
    this.pos = endIdx + 3; // 跳过 ]]>
    return { type: "TEXT", value: content };
  }

  /**
   * 读取注释并跳过。
   * @returns {{type: string, value: string}}
   */
  readComment() {
    this.pos += 4; // 跳过 <!--
    const endIdx = this.text.indexOf("-->", this.pos);
    if (endIdx === -1) throw new SyntaxError("Unterminated comment");
    this.pos = endIdx + 3;
    return { type: "COMMENT", value: "" };
  }

  /**
   * 读取处理指令并跳过。
   * @returns {{type: string, value: string}}
   */
  readProcessingInstruction() {
    this.pos += 2; // 跳过 <?
    const endIdx = this.text.indexOf("?>", this.pos);
    if (endIdx === -1)
      throw new SyntaxError("Unterminated processing instruction");
    this.pos = endIdx + 2;
    return { type: "PI", value: "" };
  }

  /**
   * 读取开始标签。
   * @returns {{type: string, value: Object}} 包含 tagName, attributes, selfClosing
   */
  readOpeningTag() {
    this.pos++; // 跳过 <
    // 读取标签名
    const nameStart = this.pos;
    while (this.pos < this.len) {
      const ch = this.text[this.pos];
      if (
        ch === " " ||
        ch === "\t" ||
        ch === "\n" ||
        ch === "\r" ||
        ch === ">" ||
        ch === "/"
      ) {
        break;
      }
      this.pos++;
    }
    const tagName = this.text.substring(nameStart, this.pos);

    // 读取属性
    const attributes = {};
    while (this.pos < this.len) {
      this.skipWhitespace();
      if (this.text[this.pos] === ">") {
        this.pos++;
        return {
          type: "OPEN",
          value: { tagName, attributes, selfClosing: false },
        };
      }
      if (this.text[this.pos] === "/") {
        this.pos++; // 跳过 /
        if (this.text[this.pos] === ">") {
          this.pos++;
          return {
            type: "OPEN",
            value: { tagName, attributes, selfClosing: true },
          };
        }
      }
      // 读取属性名
      const attrNameStart = this.pos;
      while (
        this.pos < this.len &&
        this.text[this.pos] !== "=" &&
        this.text[this.pos] !== " " &&
        this.text[this.pos] !== ">" &&
        this.text[this.pos] !== "/"
      ) {
        this.pos++;
      }
      const attrName = this.text.substring(attrNameStart, this.pos);
      if (this.text[this.pos] !== "=") {
        // 无值的属性
        if (attrName) attributes[attrName] = "";
        continue;
      }
      this.pos++; // 跳过 =
      // 读取属性值（带引号）
      const quote = this.text[this.pos];
      if (quote !== '"' && quote !== "'")
        throw new SyntaxError("Expected quote in attribute value");
      this.pos++;
      const valStart = this.pos;
      while (this.pos < this.len && this.text[this.pos] !== quote) {
        this.pos++;
      }
      const attrValue = this.text.substring(valStart, this.pos);
      this.pos++; // 跳过结束引号
      attributes[attrName] = unescapeXML(attrValue);
    }
    throw new SyntaxError("Unterminated opening tag");
  }

  /**
   * 读取结束标签。
   * @returns {{type: string, value: string}}
   */
  readClosingTag() {
    this.pos += 2; // 跳过 </
    const nameStart = this.pos;
    while (this.pos < this.len && this.text[this.pos] !== ">") {
      this.pos++;
    }
    const tagName = this.text.substring(nameStart, this.pos).trim();
    this.pos++; // 跳过 >
    return { type: "CLOSE", value: tagName };
  }

  /**
   * 读取文本内容。
   * @returns {{type: string, value: string}}
   */
  readText() {
    const start = this.pos;
    while (this.pos < this.len && this.text[this.pos] !== "<") {
      this.pos++;
    }
    const raw = this.text.substring(start, this.pos);
    return { type: "TEXT", value: unescapeXML(raw.trim()) };
  }
}

// ===================== 解析器 =====================

/**
 * XML 递归下降解析器。
 */
class XMLParser {
  /**
   * @param {string} text - XML 文本
   */
  constructor(text) {
    this.lexer = new XMLLexer(text);
    this.current = this.lexer.next();
  }

  /**
   * 获取下一个 token。
   */
  advance() {
    const token = this.current;
    this.current = this.lexer.next();
    return token;
  }

  /**
   * 跳过非内容 token（注释、处理指令）。
   */
  skipNonContent() {
    while (this.current.type === "COMMENT" || this.current.type === "PI") {
      this.current = this.lexer.next();
    }
  }

  /**
   * 解析 XML 文档，返回根对象。
   * @returns {Object}
   */
  parse() {
    this.skipNonContent();
    if (this.current.type === "EOF") return {};

    const result = {};
    // 可能有多个根元素
    while (this.current.type === "OPEN") {
      const element = this.parseElement();
      const tagName = element._tagName;
      delete element._tagName;

      if (result[tagName] !== undefined) {
        // 同名根元素转为数组
        if (!Array.isArray(result[tagName])) {
          result[tagName] = [result[tagName]];
        }
        result[tagName].push(element);
      } else {
        result[tagName] = element;
      }
      this.skipNonContent();
    }
    return result;
  }

  /**
   * 解析单个元素。
   * @returns {Object} 元素对象（包含 _tagName 内部标记）
   */
  parseElement() {
    if (this.current.type !== "OPEN") {
      throw new SyntaxError("Expected opening tag, got " + this.current.type);
    }

    const openToken = this.advance();
    const { tagName, attributes, selfClosing } = openToken.value;

    const element = { _tagName: tagName };

    // 添加属性（@ 前缀）
    for (const [attrName, attrValue] of Object.entries(attributes)) {
      element["@" + attrName] = attrValue;
    }

    // 自闭合标签，无子内容
    if (selfClosing) {
      return element;
    }

    // 收集子元素和文本
    const childTexts = [];
    let hasChildElements = false;

    while (true) {
      this.skipNonContent();

      if (this.current.type === "CLOSE") {
        const closeToken = this.advance();
        if (closeToken.value !== tagName) {
          throw new SyntaxError(
            "Mismatched closing tag: expected " +
              tagName +
              " but got " +
              closeToken.value,
          );
        }
        break;
      }

      if (this.current.type === "EOF") {
        throw new SyntaxError(
          "Unexpected EOF, expected closing tag for " + tagName,
        );
      }

      if (this.current.type === "TEXT") {
        const textToken = this.advance();
        if (textToken.value) {
          childTexts.push(textToken.value);
        }
      } else if (this.current.type === "OPEN") {
        hasChildElements = true;
        const child = this.parseElement();
        const childTagName = child._tagName;
        delete child._tagName;

        if (element[childTagName] !== undefined) {
          if (!Array.isArray(element[childTagName])) {
            element[childTagName] = [element[childTagName]];
          }
          element[childTagName].push(child);
        } else {
          element[childTagName] = child;
        }
      }
    }

    // 处理文本内容
    if (childTexts.length > 0) {
      const text = childTexts.join("\n").trim();
      if (text) {
        if (!hasChildElements && Object.keys(attributes).length === 0) {
          // 纯文本元素：直接返回字符串
          return { _tagName: tagName, "#text": text };
        } else {
          element["#text"] = text;
        }
      }
    }

    return element;
  }
}

// ===================== 主函数 =====================

/**
 * 解析 XML 字符串为 JS 对象。
 * @param {string} xmlText - XML 字符串
 * @returns {Object} JS 对象树
 */
function parseXML(xmlText) {
  const parser = new XMLParser(xmlText);
  return parser.parse();
}

// ===================== 内联 XML 生成器（用于往返测试） =====================

function escapeXML(str, isAttribute = false) {
  if (str === null || str === undefined) return "";
  let result = String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  if (isAttribute) {
    result = result.replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  return result;
}

function nodeToXML(tagName, nodeValue, level, indentStr) {
  const indent = indentStr.repeat(level);
  if (nodeValue === null || nodeValue === undefined) {
    return indent + "<" + tagName + " />";
  }
  if (
    typeof nodeValue === "string" ||
    typeof nodeValue === "number" ||
    typeof nodeValue === "boolean"
  ) {
    return (
      indent + "<" + tagName + ">" + escapeXML(nodeValue) + "</" + tagName + ">"
    );
  }
  if (Array.isArray(nodeValue)) {
    return nodeValue
      .map((item) => nodeToXML(tagName, item, level, indentStr))
      .join("\n");
  }
  if (typeof nodeValue === "object") {
    const attributes = [];
    const children = [];
    let textContent = null;
    for (const key of Object.keys(nodeValue)) {
      if (key.startsWith("@")) {
        attributes.push(
          key.substring(1) + '="' + escapeXML(nodeValue[key], true) + '"',
        );
      } else if (key === "#text") {
        textContent = nodeValue[key];
      } else {
        children.push({ tagName: key, value: nodeValue[key] });
      }
    }
    const attrStr = attributes.length > 0 ? " " + attributes.join(" ") : "";
    if (textContent !== null && children.length === 0) {
      return (
        indent +
        "<" +
        tagName +
        attrStr +
        ">" +
        escapeXML(textContent) +
        "</" +
        tagName +
        ">"
      );
    }
    if (children.length === 0 && textContent === null) {
      return indent + "<" + tagName + attrStr + " />";
    }
    let xml = indent + "<" + tagName + attrStr + ">\n";
    if (textContent !== null) {
      xml += indent + indentStr + escapeXML(textContent) + "\n";
    }
    for (const child of children) {
      xml += nodeToXML(child.tagName, child.value, level + 1, indentStr) + "\n";
    }
    xml += indent + "</" + tagName + ">";
    return xml;
  }
  return (
    indent +
    "<" +
    tagName +
    ">" +
    escapeXML(String(nodeValue)) +
    "</" +
    tagName +
    ">"
  );
}

function generateXML(obj, options = {}) {
  const { indent = "  ", declaration = false } = options;
  let xml = "";
  if (declaration) xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
  if (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    !Array.isArray(obj)
  ) {
    xml += Object.keys(obj)
      .map((key) => nodeToXML(key, obj[key], 0, indent))
      .join("\n");
  }
  return xml;
}

// ===================== 测试用例 =====================

console.log("===== 简单元素 =====");
const xml1 = "<message>Hello World</message>";
console.log("XML:", xml1);
console.log("解析:", JSON.stringify(parseXML(xml1), null, 2));

console.log("\n===== 带属性的元素 =====");
const xml2 =
  '<person id="1" type="user"><name>Alice</name><age>30</age></person>';
console.log("XML:", xml2);
console.log("解析:", JSON.stringify(parseXML(xml2), null, 2));

console.log("\n===== 嵌套元素 =====");
const xml3 =
  '<library name="City Library"><book isbn="978-1"><title>JS Guide</title><author>John</author></book><book isbn="978-2"><title>Python</title><author>Jane</author></book></library>';
console.log("XML:", xml3);
console.log("解析:", JSON.stringify(parseXML(xml3), null, 2));

console.log("\n===== 自闭合标签 =====");
const xml4 = "<data><empty /><value>present</value></data>";
console.log("XML:", xml4);
console.log("解析:", JSON.stringify(parseXML(xml4), null, 2));

console.log("\n===== 特殊字符反转义 =====");
const xml5 = "<content><title>A &lt; B &amp; C &gt; D</title></content>";
console.log("XML:", xml5);
console.log("解析:", JSON.stringify(parseXML(xml5), null, 2));
console.log(
  "title 反转义正确:",
  parseXML(xml5).content.title === "A < B & C > D",
);

console.log("\n===== CDATA 区段 =====");
const xml6 = "<data><![CDATA[<html><body>Raw content</body></html>]]></data>";
console.log("XML:", xml6);
console.log("解析:", JSON.stringify(parseXML(xml6), null, 2));
console.log("CDATA 内容正确:", parseXML(xml6).data["#text"].includes("<html>"));

console.log("\n===== XML 声明跳过 =====");
const xml7 =
  '<?xml version="1.0" encoding="UTF-8"?><root><item>value</item></root>';
console.log("XML:", xml7);
console.log("解析:", JSON.stringify(parseXML(xml7), null, 2));

console.log("\n===== 注释跳过 =====");
const xml8 =
  "<root><!-- this is a comment --><item>value</item><!-- end --></root>";
console.log("XML:", xml8);
console.log("解析:", JSON.stringify(parseXML(xml8), null, 2));

console.log("\n===== 属性中的特殊字符 =====");
const xml9 = '<link url="https://example.com/?a=1&amp;b=2">Click</link>';
console.log("XML:", xml9);
console.log("解析:", JSON.stringify(parseXML(xml9), null, 2));
console.log(
  "url 正确:",
  parseXML(xml9).link["@url"] === "https://example.com/?a=1&b=2",
);

console.log("\n===== 多个根元素 =====");
const xml10 = "<item>a</item><item>b</item>";
console.log("XML:", xml10);
console.log("解析:", JSON.stringify(parseXML(xml10), null, 2));

console.log("\n===== 往返测试（生成 → 解析 → 生成）=====");
const original = {
  library: {
    "@name": "City Library",
    book: [
      { "@isbn": "978-1", title: "JS Guide", author: "John", year: "2020" },
      { "@isbn": "978-2", title: "Python", author: "Jane", year: "2021" },
    ],
  },
};
const generatedXML = generateXML(original, { declaration: true });
console.log("生成的 XML:");
console.log(generatedXML);
const parsed = parseXML(generatedXML);
console.log("\n解析结果:");
console.log(JSON.stringify(parsed, null, 2));
const regenerated = generateXML(parsed, { declaration: true });
console.log("\n再次生成的 XML:");
console.log(regenerated);
console.log("\n往返一致:", generatedXML === regenerated);

console.log("\n===== 空元素和空白处理 =====");
const xml11 = "<root>  <child>text</child>  </root>";
console.log("XML:", JSON.stringify(xml11));
console.log("解析:", JSON.stringify(parseXML(xml11), null, 2));
