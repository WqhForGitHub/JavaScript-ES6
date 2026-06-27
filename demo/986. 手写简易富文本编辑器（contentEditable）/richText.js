/**
 * 手写简易富文本编辑器模型 (Rich Text Editor Model)
 * =================================================
 *
 * 概念说明:
 * 浏览器中富文本编辑器通常基于 contentEditable, 但其数据模型可以脱离 DOM 独立实现.
 * 本实现用纯 JS 模拟富文本文档模型 (类似 Slate / ProseMirror 的思路),
 * 不依赖 DOM, 便于测试与序列化.
 *
 * 文档模型:
 * Document
 *   └── Block (段落)
 *         └── InlineNode (文本节点, 携带 marks: bold / italic / link)
 *
 * 数据结构:
 * - Document: { blocks: Block[] }
 * - Block:    { id, type: 'paragraph', children: InlineNode[] }
 * - InlineNode: { text, marks: { bold?, italic?, link? } }
 *
 * 选区 (Selection):
 * - 锚点 (anchor): { blockIndex, offset }
 * - 焦点 (focus): { blockIndex, offset }
 * - 折叠选区: anchor === focus (光标)
 *
 * 支持命令:
 * - insertText(text): 在选区处插入文本, 替换选区内容
 * - bold() / italic(): 对选区文本切换加粗 / 斜体标记
 * - addLink(url): 给选区文本添加链接
 * - formatRange(start, end, mark): 通用范围格式化
 * - toHtml(): 导出 HTML 字符串
 *
 * Inline 节点合并策略:
 * 相邻且 marks 相同的文本节点会合并, 保持模型紧凑.
 */

"use strict";

let _idCounter = 0;
function genId() {
  return `n${++_idCounter}`;
}

/**
 * 创建一个内联文本节点
 */
function makeInline(text, marks = {}) {
  return { id: genId(), text, marks: { ...marks } };
}

/**
 * 创建一个段落块
 */
function makeParagraph(children = []) {
  return { id: genId(), type: "paragraph", children };
}

/**
 * 创建空文档
 */
function makeDocument() {
  return { blocks: [makeParagraph([makeInline("")])] };
}

/**
 * marks 是否等价
 */
function sameMarks(a, b) {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length) return false;
  return ka.every((k, i) => k === kb[i] && a[k] === b[k]);
}

/**
 * 富文本编辑器
 */
class RichTextEditor {
  constructor(doc) {
    this.doc = doc || makeDocument();
    // 选区: 用 anchor / focus 表示
    this.selection = {
      anchor: { blockIndex: 0, offset: 0 },
      focus: { blockIndex: 0, offset: 0 },
    };
  }

  /**
   * 规范化选区: 保证 anchor 在 focus 之前 (返回正序范围)
   * @returns {{start: Point, end: Point}}
   */
  getOrderedSelection() {
    const { anchor, focus } = this.selection;
    const cmp = comparePoints(anchor, focus);
    return cmp <= 0
      ? { start: anchor, end: focus }
      : { start: focus, end: anchor };
  }

  /**
   * 设置选区
   */
  setSelection(anchor, focus) {
    this.selection = {
      anchor: { ...anchor },
      focus: focus ? { ...focus } : { ...anchor },
    };
  }

  /**
   * 折叠选区为光标
   */
  collapse(point) {
    this.setSelection(point, point);
  }

  /**
   * 在当前选区处插入文本 (替换选区内容)
   * 插入后选区折叠到插入文本末尾
   */
  insertText(text) {
    const { start, end } = this.getOrderedSelection();
    this.deleteRange(start, end);
    // 现在 start === end (光标)
    const block = this.doc.blocks[start.blockIndex];
    const insertPoint = start.offset;

    // 取插入点处的 marks (继承光标前一个字符的格式)
    const marks = getMarksAtOffset(block, insertPoint);

    const newInline = makeInline(text, marks);
    // 拆分插入点处的节点
    this.splitInlineAt(block, insertPoint);
    // 找到插入位置 (拆分后 insertPoint 处是一个空隙)
    const insertIndex = findInlineIndexForOffset(block, insertPoint);
    block.children.splice(insertIndex, 0, newInline);

    // 合并相邻同 marks 节点
    mergeInlines(block);

    // 选区折叠到插入文本末尾
    const newOffset = insertPoint + text.length;
    this.collapse({ blockIndex: start.blockIndex, offset: newOffset });
  }

  /**
   * 删除 [start, end) 范围内的内容
   */
  deleteRange(start, end) {
    if (comparePoints(start, end) === 0) return;
    // 简化: 只支持同一块内删除 (跨块删除可扩展)
    if (start.blockIndex !== end.blockIndex) {
      throw new Error("暂不支持跨块删除");
    }
    const block = this.doc.blocks[start.blockIndex];
    // 把 start / end 处的节点拆开
    this.splitInlineAt(block, start.offset);
    this.splitInlineAt(block, end.offset);
    // 删除 [start.offset, end.offset) 的字符
    removeRangeInBlock(block, start.offset, end.offset);
    mergeInlines(block);
  }

  /**
   * 在指定偏移处拆分内联节点, 使该偏移落在节点边界
   */
  splitInlineAt(block, offset) {
    let acc = 0;
    for (let i = 0; i < block.children.length; i++) {
      const node = block.children[i];
      const nodeStart = acc;
      const nodeEnd = acc + node.text.length;
      if (offset > nodeStart && offset < nodeEnd) {
        // 需要拆分
        const left = makeInline(
          node.text.slice(0, offset - nodeStart),
          node.marks,
        );
        const right = makeInline(
          node.text.slice(offset - nodeStart),
          node.marks,
        );
        block.children.splice(i, 1, left, right);
        return;
      }
      acc = nodeEnd;
      if (offset === acc) return; // 已在边界
    }
  }

  /**
   * 对当前选区切换某个 mark (bold / italic)
   */
  toggleMark(mark) {
    const { start, end } = this.getOrderedSelection();
    if (comparePoints(start, end) === 0) {
      // 光标: 切换 "待应用 mark" 状态 (此处简化为无操作, 真实编辑器会记录 pending marks)
      console.log(`(光标处切换 ${mark}, 影响后续输入)`);
      return;
    }
    this.formatRange(start, end, mark, "toggle");
  }

  /**
   * 对选区添加链接
   */
  addLink(url) {
    const { start, end } = this.getOrderedSelection();
    this.formatRange(start, end, "link", "set", url);
  }

  /**
   * 通用范围格式化
   * @param {Point} start
   * @param {Point} end
   * @param {string} mark - 'bold' | 'italic' | 'link'
   * @param {string} mode - 'toggle' | 'set'
   * @param {*} [value] - set 模式下的值
   */
  formatRange(start, end, mark, mode, value) {
    if (start.blockIndex !== end.blockIndex) {
      throw new Error("暂不支持跨块格式化");
    }
    const block = this.doc.blocks[start.blockIndex];
    // 拆分边界
    this.splitInlineAt(block, start.offset);
    this.splitInlineAt(block, end.offset);
    // 判断当前范围内该 mark 是否全部已应用 -> toggle 时据此决定 add/remove
    let allMarked = true;
    let acc = 0;
    for (const node of block.children) {
      const ns = acc;
      const ne = acc + node.text.length;
      if (ne > start.offset && ns < end.offset && node.text.length > 0) {
        if (!node.marks[mark]) allMarked = false;
      }
      acc = ne;
    }
    const shouldAdd = mode === "set" ? true : !allMarked;

    // 应用 mark
    acc = 0;
    for (const node of block.children) {
      const ns = acc;
      const ne = acc + node.text.length;
      if (ne > start.offset && ns < end.offset && node.text.length > 0) {
        if (shouldAdd) {
          node.marks[mark] = value !== undefined ? value : true;
        } else {
          delete node.marks[mark];
        }
      }
      acc = ne;
    }
    mergeInlines(block);
    // 保持选区
    this.setSelection(start, end);
  }

  /**
   * 获取纯文本 (所有块拼接)
   */
  toPlainText() {
    return this.doc.blocks
      .map((b) => b.children.map((n) => n.text).join(""))
      .join("\n");
  }

  /**
   * 导出 HTML 字符串
   */
  toHtml() {
    return this.doc.blocks.map((block) => this.blockToHtml(block)).join("\n");
  }

  blockToHtml(block) {
    const inner = block.children.map((n) => this.inlineToHtml(n)).join("");
    return `<p>${inner}</p>`;
  }

  inlineToHtml(node) {
    if (!node.text) return "";
    let html = escapeHtml(node.text);
    if (node.marks.link) {
      html = `<a href="${escapeAttr(node.marks.link)}">${html}</a>`;
    }
    if (node.marks.bold) {
      html = `<strong>${html}</strong>`;
    }
    if (node.marks.italic) {
      html = `<em>${html}</em>`;
    }
    return html;
  }

  /**
   * 导出 JSON (便于持久化)
   */
  toJSON() {
    return JSON.stringify(this.doc, null, 2);
  }
}

// ------------------------------------------------------------
// 辅助函数
// ------------------------------------------------------------

/** 比较两个点位置, 返回 -1/0/1 */
function comparePoints(a, b) {
  if (a.blockIndex !== b.blockIndex)
    return a.blockIndex < b.blockIndex ? -1 : 1;
  if (a.offset !== b.offset) return a.offset < b.offset ? -1 : 1;
  return 0;
}

/** 获取块内某偏移处的 marks (继承前一字符) */
function getMarksAtOffset(block, offset) {
  let acc = 0;
  for (let i = 0; i < block.children.length; i++) {
    const node = block.children[i];
    const nodeEnd = acc + node.text.length;
    if (offset <= nodeEnd) {
      // 偏移在该节点内或边界, 继承该节点 marks
      // 若 offset === 0 取第一个节点
      return { ...node.marks };
    }
    acc = nodeEnd;
  }
  // 取最后一个非空节点的 marks
  for (let i = block.children.length - 1; i >= 0; i--) {
    if (block.children[i].text.length) return { ...block.children[i].marks };
  }
  return {};
}

/** 找到某偏移对应的内联节点索引 (拆分后该偏移位于节点边界) */
function findInlineIndexForOffset(block, offset) {
  let acc = 0;
  for (let i = 0; i < block.children.length; i++) {
    if (acc === offset) return i;
    acc += block.children[i].text.length;
  }
  return block.children.length;
}

/** 删除块内 [start, end) 范围字符 */
function removeRangeInBlock(block, start, end) {
  let acc = 0;
  const newChildren = [];
  for (const node of block.children) {
    const ns = acc;
    const ne = acc + node.text.length;
    if (ne <= start || ns >= end) {
      // 不在删除范围, 保留
      if (node.text.length) newChildren.push(node);
    } else {
      // 部分在删除范围, 切割保留剩余
      const before = node.text.slice(0, Math.max(0, start - ns));
      const after = node.text.slice(Math.min(node.text.length, end - ns));
      const remaining = before + after;
      if (remaining.length) {
        newChildren.push(makeInline(remaining, node.marks));
      }
    }
    acc = ne;
  }
  // 保证块至少有一个空节点
  if (!newChildren.length) newChildren.push(makeInline(""));
  block.children = newChildren;
}

/** 合并相邻同 marks 的内联节点 */
function mergeInlines(block) {
  const merged = [];
  for (const node of block.children) {
    const last = merged[merged.length - 1];
    if (last && sameMarks(last.marks, node.marks)) {
      last.text += node.text;
    } else {
      merged.push({ ...node, marks: { ...node.marks } });
    }
  }
  // 过滤空节点 (保留至少一个)
  const filtered = merged.filter((n) => n.text.length > 0);
  block.children = filtered.length ? filtered : [makeInline("")];
}

/** HTML 转义 */
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}

// ============================================================
// 测试与演示
// ============================================================

console.log("========== 富文本编辑器演示 ==========\n");

// 创建编辑器, 初始为空段落
const editor = new RichTextEditor();

console.log("--- 1. 插入文本 ---");
editor.collapse({ blockIndex: 0, offset: 0 });
editor.insertText("Hello World");
console.log("纯文本:", JSON.stringify(editor.toPlainText()));
console.log("HTML:", editor.toHtml());

console.log('\n--- 2. 选中 "World" 并加粗 ---');
// "Hello World" 中 World 起始 6, 结束 11
editor.setSelection(
  { blockIndex: 0, offset: 6 },
  { blockIndex: 0, offset: 11 },
);
editor.toggleMark("bold");
console.log("HTML:", editor.toHtml());
console.log("文档结构:", editor.toJSON());

console.log('\n--- 3. 选中 "Hello" 并斜体 ---');
editor.setSelection({ blockIndex: 0, offset: 0 }, { blockIndex: 0, offset: 5 });
editor.toggleMark("italic");
console.log("HTML:", editor.toHtml());

console.log('\n--- 4. 给 "Hello" 添加链接 ---');
editor.setSelection({ blockIndex: 0, offset: 0 }, { blockIndex: 0, offset: 5 });
editor.addLink("https://example.com");
console.log("HTML:", editor.toHtml());

console.log("\n--- 5. 在末尾插入更多文本 (继承前一字符格式) ---");
// 当前 "Hello World", 末尾偏移 11
editor.collapse({ blockIndex: 0, offset: 11 });
editor.insertText("!");
console.log("HTML:", editor.toHtml());
console.log("纯文本:", JSON.stringify(editor.toPlainText()));

console.log('\n--- 6. 取消 "World" 的加粗 ---');
// 重新定位 World 偏移: "Hello" 长度 5, 但有链接包裹不影响字符偏移
// 字符: H e l l o (space) W o r l d !  -> World 是 6..11
editor.setSelection(
  { blockIndex: 0, offset: 6 },
  { blockIndex: 0, offset: 11 },
);
editor.toggleMark("bold");
console.log("HTML:", editor.toHtml());

console.log('\n--- 7. 选中 "World" 再加粗 (演示 toggle 切换) ---');
editor.toggleMark("bold");
console.log("HTML:", editor.toHtml());

console.log('\n--- 8. 删除选区内容 (删除 "Hello") ---');
editor.setSelection({ blockIndex: 0, offset: 0 }, { blockIndex: 0, offset: 5 });
editor.deleteRange({ blockIndex: 0, offset: 0 }, { blockIndex: 0, offset: 5 });
// 删除后还需移除多余空格
console.log("HTML:", editor.toHtml());
console.log("纯文本:", JSON.stringify(editor.toPlainText()));

console.log("\n--- 9. 最终文档 JSON ---");
console.log(editor.toJSON());

console.log("\n--- 10. 多段萋试验 (手动构造) ---");
const editor2 = new RichTextEditor({
  blocks: [
    makeParagraph([makeInline("第一段", { bold: true })]),
    makeParagraph([
      makeInline("第二段 "),
      makeInline("链接文字", { link: "https://test.com" }),
    ]),
    makeParagraph([makeInline("")]),
  ],
});
console.log("多段落 HTML:");
console.log(editor2.toHtml());

console.log("\n[富文本编辑器演示完成]");
