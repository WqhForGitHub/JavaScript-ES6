/**
 * 手写 XML 生成器
 *
 * 将 JS 对象树转换为 XML 字符串。
 *
 * 对象结构约定：
 * - 普通属性 → 子元素或文本内容
 * - 以 "@" 开头的属性 → XML 属性（如 { "@id": "1" } → id="1"）
 * - "#text" 属性 → 元素的文本内容
 * - 数组 → 同名子元素重复
 * - null/undefined → 自闭合标签
 * - 特殊字符自动转义：< → &lt;, > → &gt;, & → &amp;, " → &quot;
 *
 * 示例：
 *   {
 *     person: {
 *       "@id": "1",
 *       name: { "#text": "Alice" },
 *       hobbies: ["reading", "coding"],
 *     }
 *   }
 *   →
 *   <person id="1">
 *     <name>Alice</name>
 *     <hobbies>reading</hobbies>
 *     <hobbies>coding</hobbies>
 *   </person>
 */

/**
 * XML 特殊字符转义。
 * @param {string} str - 原始字符串
 * @param {boolean} [isAttribute=false] - 是否用于属性值（需转义引号）
 * @returns {string} 转义后的字符串
 */
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

/**
 * 生成缩进字符串。
 * @param {number} level - 缩进层级
 * @param {string} indentStr - 单层缩进字符串
 * @returns {string}
 */
function getIndent(level, indentStr) {
  return indentStr.repeat(level);
}

/**
 * 判断值是否为"简单值"（字符串、数字、布尔）。
 * @param {*} value
 * @returns {boolean}
 */
function isSimpleValue(value) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

/**
 * 将单个节点（对象）转换为 XML 字符串。
 *
 * @param {string} tagName - 标签名
 * @param {*} nodeValue - 节点值（对象/数组/简单值/null）
 * @param {number} level - 当前缩进层级
 * @param {string} indentStr - 单层缩进字符串
 * @returns {string} XML 片段
 */
function nodeToXML(tagName, nodeValue, level, indentStr) {
  const indent = getIndent(level, indentStr);

  // ---------- null / undefined → 自闭合标签 ----------
  if (nodeValue === null || nodeValue === undefined) {
    return indent + "<" + tagName + " />";
  }

  // ---------- 简单值 → <tag>value</tag> ----------
  if (isSimpleValue(nodeValue)) {
    return (
      indent + "<" + tagName + ">" + escapeXML(nodeValue) + "</" + tagName + ">"
    );
  }

  // ---------- 数组 → 同名标签重复 ----------
  if (Array.isArray(nodeValue)) {
    return nodeValue
      .map((item) => nodeToXML(tagName, item, level, indentStr))
      .join("\n");
  }

  // ---------- 对象 → 提取属性和子元素 ----------
  if (typeof nodeValue === "object") {
    const attributes = [];
    const children = [];
    let textContent = null;

    for (const key of Object.keys(nodeValue)) {
      if (key.startsWith("@")) {
        // 属性
        const attrName = key.substring(1);
        attributes.push(
          attrName + '="' + escapeXML(nodeValue[key], true) + '"',
        );
      } else if (key === "#text") {
        // 文本内容
        textContent = nodeValue[key];
      } else {
        // 子元素
        children.push({ tagName: key, value: nodeValue[key] });
      }
    }

    // 构建属性字符串
    const attrStr = attributes.length > 0 ? " " + attributes.join(" ") : "";

    // 如果只有文本内容没有子元素
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

    // 如果没有子元素也没有文本内容
    if (children.length === 0 && textContent === null) {
      // 检查是否有属性，如果只有属性且无内容，用自闭合或空标签
      return indent + "<" + tagName + attrStr + " />" + "";
    }

    // 有子元素
    let xml = indent + "<" + tagName + attrStr + ">\n";

    // 添加文本内容（如果有子元素也有文本，文本在前）
    if (textContent !== null) {
      xml += indent + indentStr + escapeXML(textContent) + "\n";
    }

    // 添加子元素
    for (const child of children) {
      xml += nodeToXML(child.tagName, child.value, level + 1, indentStr) + "\n";
    }

    xml += indent + "</" + tagName + ">";
    return xml;
  }

  // 其他类型转为字符串
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

/**
 * 将 JS 对象树转换为 XML 字符串。
 *
 * @param {Object} obj - 根对象（可以有多个根元素）
 * @param {Object} [options] - 配置选项
 * @param {string} [options.indent='  '] - 缩进字符串
 * @param {boolean} [options.declaration=false] - 是否添加 XML 声明
 * @returns {string} XML 字符串
 */
function generateXML(obj, options = {}) {
  const { indent = "  ", declaration = false } = options;

  let xml = "";

  // XML 声明
  if (declaration) {
    xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
  }

  if (obj === null || obj === undefined) {
    return xml;
  }

  // 根对象可以有多个 key（多个根元素）
  if (typeof obj === "object" && !Array.isArray(obj)) {
    const rootKeys = Object.keys(obj);
    const parts = rootKeys.map((key, index) => {
      const result = nodeToXML(key, obj[key], 0, indent);
      return result;
    });
    xml += parts.join("\n");
  } else {
    // 非对象根
    xml += String(obj);
  }

  return xml;
}

// ===================== 测试用例 =====================

console.log("===== 简单元素 =====");
const simple = {
  message: "Hello World",
};
console.log(generateXML(simple));

console.log("\n===== 带属性的元素 =====");
const withAttr = {
  person: {
    "@id": "1",
    "@type": "user",
    name: "Alice",
    age: 30,
  },
};
console.log(generateXML(withAttr));

console.log("\n===== 嵌套元素 =====");
const nested = {
  library: {
    "@name": "City Library",
    book: [
      {
        "@isbn": "978-1",
        title: "JavaScript Guide",
        author: "John Doe",
        year: 2020,
      },
      {
        "@isbn": "978-2",
        title: "Python Basics",
        author: "Jane Smith",
        year: 2021,
      },
    ],
  },
};
console.log(generateXML(nested));

console.log("\n===== 自闭合标签（null/undefined）=====");
const selfClosing = {
  data: {
    "@version": "1.0",
    empty: null,
    missing: undefined,
    value: "present",
  },
};
console.log(generateXML(selfClosing));

console.log("\n===== 文本内容 =====");
const textContent = {
  note: {
    "@priority": "high",
    "#text": "Important message here",
  },
};
console.log(generateXML(textContent));

console.log("\n===== 特殊字符转义 =====");
const specialChars = {
  content: {
    title: "A < B & C > D",
    description: "She said \"hello\" & 'goodbye'",
  },
};
console.log(generateXML(specialChars));

console.log("\n===== XML 声明 =====");
const withDeclaration = {
  root: {
    item: "value",
  },
};
console.log(generateXML(withDeclaration, { declaration: true }));

console.log("\n===== 自定义缩进（4 空格）=====");
const customIndent = {
  root: {
    child: {
      grandchild: "deep",
    },
  },
};
console.log(generateXML(customIndent, { indent: "    " }));

console.log("\n===== 复杂嵌套示例（完整 RSS 风格）=====");
const rssLike = {
  feed: {
    "@xmlns": "http://www.w3.org/2005/Atom",
    title: "My Blog",
    entry: [
      {
        title: "First Post",
        link: { "@href": "https://example.com/1" },
        summary: "This is the <first> post & it's great",
        published: "2024-01-01",
      },
      {
        title: "Second Post",
        link: { "@href": "https://example.com/2" },
        summary: "Another post",
        published: "2024-01-02",
      },
    ],
  },
};
console.log(generateXML(rssLike, { declaration: true }));

console.log("\n===== 数字和布尔值 =====");
const types = {
  data: {
    count: 42,
    active: true,
    ratio: 3.14,
    flag: false,
  },
};
console.log(generateXML(types));

console.log("\n===== 深层嵌套 =====");
const deep = {
  a: {
    b: {
      c: {
        d: {
          e: {
            "#text": "Deep value",
          },
        },
      },
    },
  },
};
console.log(generateXML(deep));
