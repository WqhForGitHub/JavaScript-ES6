/**
 * 手写简易在线代码编辑器（Monaco-like）
 * ---------------------------------------------------------------
 * 实现一个简易的代码编辑器模型，包含：
 * 1. 文本缓冲区（按行存储），跟踪行号
 * 2. 光标位置（行、列）与选区
 * 3. 编辑操作：插入文本、删除文本、移动光标
 * 4. 撤销/重做：使用命令模式 + 历史栈
 * 5. 简易语法分词：基于正则识别关键字、字符串、数字、注释
 * 6. 导出分词后的行
 */

"use strict";

// ============================================================================
// 1. 光标 Position 与选区 Range
// ============================================================================

/**
 * 表示一个文档位置（从 0 开始的行号和列号）
 */
class Position {
  constructor(line, column) {
    this.line = line;
    this.column = column;
  }

  /** 克隆 */
  clone() {
    return new Position(this.line, this.column);
  }

  /** 判断两个位置是否相等 */
  equals(other) {
    return this.line === other.line && this.column === other.column;
  }

  /** 比较两个位置：返回 -1 / 0 / 1 */
  compareTo(other) {
    if (this.line !== other.line) return this.line < other.line ? -1 : 1;
    if (this.column !== other.column)
      return this.column < other.column ? -1 : 1;
    return 0;
  }

  toString() {
    return `(${this.line}:${this.column})`;
  }
}

/**
 * 表示一个选区：由 start 与 end 两个位置组成
 * 始终保证 start <= end（按位置比较）
 */
class Range {
  constructor(start, end) {
    if (start.compareTo(end) <= 0) {
      this.start = start.clone();
      this.end = end.clone();
    } else {
      this.start = end.clone();
      this.end = start.clone();
    }
  }

  /** 是否为空选区（光标位置） */
  isEmpty() {
    return this.start.equals(this.end);
  }

  clone() {
    return new Range(this.start, this.end);
  }

  toString() {
    return `[${this.start} -> ${this.end}]`;
  }
}

// ============================================================================
// 2. 文本缓冲区：按行存储
// ============================================================================

/**
 * TextBuffer：以数组形式存储每一行文本（不含换行符）
 * 提供按 Range 插入 / 删除文本的能力，并返回受影响的行范围。
 */
class TextBuffer {
  constructor(initialText = "") {
    // 将初始文本按 \n 拆分为行
    this.lines = initialText.length === 0 ? [""] : initialText.split("\n");
  }

  /** 获取全部文本 */
  getText() {
    return this.lines.join("\n");
  }

  /** 获取总行数 */
  getLineCount() {
    return this.lines.length;
  }

  /** 获取指定行的文本 */
  getLine(line) {
    if (line < 0 || line >= this.lines.length) return "";
    return this.lines[line];
  }

  /**
   * 在指定位置插入文本（可包含多行）
   * @param {Position} pos 插入位置
   * @param {string} text 待插入文本
   * @returns {Range} 插入后产生的新文本范围
   */
  insert(pos, text) {
    if (text.length === 0) return new Range(pos, pos);
    const line = this.lines[pos.line] ?? "";
    const before = line.slice(0, pos.column);
    const after = line.slice(pos.column);

    const insertedLines = text.split("\n");
    if (insertedLines.length === 1) {
      // 单行插入
      this.lines[pos.line] = before + insertedLines[0] + after;
      const endCol = pos.column + insertedLines[0].length;
      return new Range(pos, new Position(pos.line, endCol));
    } else {
      // 多行插入
      const firstLine = before + insertedLines[0];
      const lastLine = insertedLines[insertedLines.length - 1] + after;
      const middle = insertedLines.slice(1, -1);
      const newLines = [firstLine, ...middle, lastLine];
      this.lines.splice(pos.line, 1, ...newLines);
      const endLine = pos.line + insertedLines.length - 1;
      const endCol = insertedLines[insertedLines.length - 1].length;
      return new Range(pos, new Position(endLine, endCol));
    }
  }

  /**
   * 删除一个范围内的文本
   * @param {Range} range 待删除范围
   * @returns {string} 被删除的文本
   */
  delete(range) {
    if (range.isEmpty()) return "";
    const { start, end } = range;
    const startLine = this.lines[start.line] ?? "";
    const endLine = this.lines[end.line] ?? "";
    // 计算被删除的文本：单行与多行需分别处理
    let deleted;
    if (start.line === end.line) {
      // 单行：从 start.column 到 end.column
      deleted = startLine.slice(start.column, end.column);
    } else {
      // 多行：start 行的尾部 + 中间整行 + end 行的头部
      deleted =
        startLine.slice(start.column) +
        "\n" +
        this.lines.slice(start.line + 1, end.line).join("\n") +
        (end.line > start.line + 1 ? "\n" : "") +
        endLine.slice(0, end.column);
    }
    // 合并：start 之前 + end 之后
    const merged = startLine.slice(0, start.column) + endLine.slice(end.column);
    this.lines.splice(start.line, end.line - start.line + 1, merged);
    return deleted;
  }

  /** 克隆整个缓冲区 */
  clone() {
    const buf = new TextBuffer();
    buf.lines = this.lines.slice();
    return buf;
  }
}

// ============================================================================
// 3. 命令模式：把每一次编辑封装为一个可逆命令
// ============================================================================

/**
 * EditCommand：封装一次编辑操作，支持 execute / undo
 * 保存操作前后的光标位置，便于撤销时恢复。
 */
class EditCommand {
  /**
   * @param {'insert'|'delete'} type 操作类型
   * @param {Object} payload 操作数据
   * @param {Function} applyFn 应用函数（buffer, payload） => { range, inverse }
   */
  constructor(type, payload, applyFn) {
    this.type = type;
    this.payload = payload;
    this.applyFn = applyFn;
    // 执行后填充 inverse 信息，用于撤销
    this.inverse = null;
    // 执行后产生的选区
    this.resultRange = null;
  }

  execute(buffer) {
    const result = this.applyFn(buffer, this.payload);
    this.resultRange = result.range;
    this.inverse = result.inverse;
    return result;
  }

  undo(buffer) {
    if (!this.inverse) return null;
    // inverse 也是一个 apply 描述：{ type, payload }
    const inverseApply = this.inverse.applyFn;
    return inverseApply(buffer, this.inverse.payload);
  }
}

// ============================================================================
// 4. 编辑器主体：Editor
// ============================================================================

/**
 * CodeEditor：简易代码编辑器模型
 * 维护：文本缓冲区、光标位置、选区、撤销/重做历史栈
 */
class CodeEditor {
  constructor(initialText = "") {
    this.buffer = new TextBuffer(initialText);
    this.position = new Position(0, 0);
    this.selection = new Range(this.position.clone(), this.position.clone());

    // 历史栈
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 100;
  }

  /** 获取全部文本 */
  getValue() {
    return this.buffer.getText();
  }

  /** 获取当前光标位置 */
  getPosition() {
    return this.position.clone();
  }

  /** 设置光标位置（同时清空选区） */
  setPosition(line, column) {
    line = Math.max(0, Math.min(line, this.buffer.getLineCount() - 1));
    const lineText = this.buffer.getLine(line);
    column = Math.max(0, Math.min(column, lineText.length));
    this.position = new Position(line, column);
    this.selection = new Range(this.position.clone(), this.position.clone());
  }

  /** 设置选区 */
  setSelection(startLine, startCol, endLine, endCol) {
    const start = new Position(startLine, startCol);
    const end = new Position(endLine, endCol);
    this.selection = new Range(start, end);
    // 光标落在选区末尾
    this.position = end.clone();
  }

  /**
   * 插入文本（在当前光标处，或替换当前选区）
   * 使用单个自包含命令，同时处理"删除选区 + 插入文本"，
   * 其逆操作为"删除插入内容 + 恢复被删除文本"，保证撤销/重做一致。
   * @param {string} text
   */
  insert(text) {
    const hasSelection = !this.selection.isEmpty();
    const sel = hasSelection ? this.selection.clone() : null;
    // 插入点：有选区时为选区起点，否则为当前光标
    const insertPos = hasSelection ? sel.start.clone() : this.position.clone();

    const cmd = new EditCommand(
      hasSelection ? "replace" : "insert",
      { sel, insertPos: insertPos.clone(), text },
      (buffer, payload) => {
        // 正向：先删除选区（若有），再在插入点插入文本
        let deletedText = "";
        if (payload.sel) {
          deletedText = buffer.delete(payload.sel.clone());
        }
        const range = buffer.insert(payload.insertPos.clone(), payload.text);
        // 逆向：删除刚插入的范围，再恢复被删除的文本（若有）
        const inverse = {
          applyFn: (buf, p) => {
            buf.delete(p.insertedRange.clone());
            if (p.deletedText.length > 0) {
              buf.insert(p.insertPos.clone(), p.deletedText);
            }
            return { range: payload.insertPos.clone() };
          },
          payload: {
            insertedRange: range.clone(),
            deletedText,
            insertPos: payload.insertPos.clone(),
          },
        };
        return { range, inverse };
      },
    );

    cmd.execute(this.buffer);
    this._pushHistory(cmd);
    // 光标移到插入文本末尾
    this.position = cmd.resultRange.end.clone();
    this.selection = new Range(this.position.clone(), this.position.clone());
  }

  /**
   * 删除：如果有选区则删除选区；否则删除光标前 n 个字符
   * @param {number} count 删除字符数（默认 1）
   */
  deleteBack(count = 1) {
    if (!this.selection.isEmpty()) {
      const cmd = this._createDeleteCommand(this.selection.clone());
      cmd.execute(this.buffer);
      this._pushHistory(cmd);
      this.position = this.selection.start.clone();
      this.selection = new Range(this.position.clone(), this.position.clone());
      return;
    }
    // 从光标向前删除 count 个字符
    const target = this._moveBack(this.position.clone(), count);
    if (target.equals(this.position)) return; // 已到文档起点
    const range = new Range(target, this.position.clone());
    const cmd = this._createDeleteCommand(range);
    cmd.execute(this.buffer);
    this._pushHistory(cmd);
    this.position = target.clone();
    this.selection = new Range(this.position.clone(), this.position.clone());
  }

  /**
   * 移动光标
   * @param {'left'|'right'|'up'|'down'|'home'|'end'} direction
   * @param {boolean} select 是否同时扩展选区
   */
  moveCursor(direction, select = false) {
    const oldPos = this.position.clone();
    const selStart = select ? this.selection.start.clone() : oldPos.clone();
    let newPos = oldPos.clone();
    switch (direction) {
      case "left":
        newPos = this._moveBack(oldPos, 1);
        break;
      case "right":
        newPos = this._moveForward(oldPos, 1);
        break;
      case "up":
        if (oldPos.line > 0) {
          newPos = new Position(
            oldPos.line - 1,
            Math.min(
              oldPos.column,
              this.buffer.getLine(oldPos.line - 1).length,
            ),
          );
        }
        break;
      case "down":
        if (oldPos.line < this.buffer.getLineCount() - 1) {
          newPos = new Position(
            oldPos.line + 1,
            Math.min(
              oldPos.column,
              this.buffer.getLine(oldPos.line + 1).length,
            ),
          );
        }
        break;
      case "home":
        newPos = new Position(oldPos.line, 0);
        break;
      case "end":
        newPos = new Position(
          oldPos.line,
          this.buffer.getLine(oldPos.line).length,
        );
        break;
    }
    this.position = newPos;
    this.selection = select
      ? new Range(selStart, newPos)
      : new Range(newPos.clone(), newPos.clone());
  }

  /** 撤销 */
  undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return false;
    cmd.undo(this.buffer);
    this.redoStack.push(cmd);
    // 光标恢复到命令执行前的位置
    if (cmd.beforePosition) {
      this.position = cmd.beforePosition.clone();
      this.selection = new Range(this.position.clone(), this.position.clone());
    }
    return true;
  }

  /** 重做 */
  redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) return false;
    cmd.execute(this.buffer);
    this.undoStack.push(cmd);
    if (cmd.resultRange) {
      this.position = cmd.resultRange.end.clone();
      this.selection = new Range(this.position.clone(), this.position.clone());
    }
    return true;
  }

  // ----------------------------------------------------------------------
  // 内部辅助方法
  // ----------------------------------------------------------------------

  _pushHistory(cmd) {
    // 记录执行前的光标位置，便于撤销恢复
    cmd.beforePosition = this.selection.start.clone();
    this.undoStack.push(cmd);
    if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
    this.redoStack.length = 0; // 新操作清空 redo 栈
  }

  _createInsertCommand(pos, text) {
    return new EditCommand(
      "insert",
      { pos: pos.clone(), text },
      (buffer, payload) => {
        const range = buffer.insert(payload.pos, payload.text);
        // 逆操作：删除刚插入的范围
        const inverse = {
          applyFn: (buf, p) => {
            buf.delete(p.range.clone());
            return { range: p.range.start.clone() };
          },
          payload: { range: range.clone() },
        };
        return { range, inverse };
      },
    );
  }

  _createDeleteCommand(range) {
    return new EditCommand(
      "delete",
      { range: range.clone() },
      (buffer, payload) => {
        const deletedText = buffer.delete(payload.range.clone());
        const resultRange = new Range(
          payload.range.start.clone(),
          payload.range.start.clone(),
        );
        // 逆操作：在起点重新插入被删除文本
        const inverse = {
          applyFn: (buf, p) => {
            const r = buf.insert(p.pos.clone(), p.text);
            return { range: r };
          },
          payload: { pos: payload.range.start.clone(), text: deletedText },
        };
        return { range: resultRange, inverse };
      },
    );
  }

  /** 向前移动 n 个字符（跨行） */
  _moveForward(pos, n) {
    let remaining = n;
    let line = pos.line;
    let col = pos.column;
    while (remaining > 0 && line < this.buffer.getLineCount()) {
      const lineText = this.buffer.getLine(line);
      const available = lineText.length - col;
      if (remaining <= available) {
        col += remaining;
        remaining = 0;
      } else {
        remaining -= available + 1; // +1 for newline
        line++;
        col = 0;
      }
    }
    return new Position(line, col);
  }

  /** 向后移动 n 个字符（跨行） */
  _moveBack(pos, n) {
    let remaining = n;
    let line = pos.line;
    let col = pos.column;
    while (remaining > 0 && line >= 0) {
      if (col >= remaining) {
        col -= remaining;
        remaining = 0;
      } else {
        remaining -= col + 1; // +1 for newline
        line--;
        if (line >= 0) col = this.buffer.getLine(line).length;
      }
    }
    if (line < 0) return new Position(0, 0);
    return new Position(line, col);
  }
}

// ============================================================================
// 5. 简易语法分词器（基于正则）
// ============================================================================

/**
 * 简易分词器：识别 JavaScript 常见 token 类型
 * 支持识别：关键字、字符串、数字、注释、标识符、运算符、空白
 */
class SimpleTokenizer {
  constructor(options = {}) {
    // JS 关键字列表（简化版）
    this.keywords = new Set([
      "var",
      "let",
      "const",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "new",
      "class",
      "extends",
      "super",
      "this",
      "typeof",
      "instanceof",
      "in",
      "of",
      "try",
      "catch",
      "finally",
      "throw",
      "import",
      "export",
      "default",
      "async",
      "await",
      "yield",
      "delete",
      "void",
      "null",
      "undefined",
      "true",
      "false",
    ]);
    this.options = options;
  }

  /**
   * 对单行文本进行分词
   * @param {string} line
   * @returns {Array<{type: string, value: string, start: number, end: number}>}
   */
  tokenizeLine(line) {
    const tokens = [];
    let i = 0;
    while (i < line.length) {
      const ch = line[i];

      // 空白
      if (/\s/.test(ch)) {
        let j = i;
        while (j < line.length && /\s/.test(line[j])) j++;
        tokens.push({
          type: "whitespace",
          value: line.slice(i, j),
          start: i,
          end: j,
        });
        i = j;
        continue;
      }

      // 行注释 //
      if (ch === "/" && line[i + 1] === "/") {
        tokens.push({
          type: "comment",
          value: line.slice(i),
          start: i,
          end: line.length,
        });
        i = line.length;
        continue;
      }

      // 块注释开始 /* （单行内处理）
      if (ch === "/" && line[i + 1] === "*") {
        const end = line.indexOf("*/", i + 2);
        const j = end === -1 ? line.length : end + 2;
        tokens.push({
          type: "comment",
          value: line.slice(i, j),
          start: i,
          end: j,
        });
        i = j;
        continue;
      }

      // 字符串：单引号、双引号、反引号
      if (ch === '"' || ch === "'" || ch === "`") {
        const quote = ch;
        let j = i + 1;
        while (j < line.length) {
          if (line[j] === "\\") {
            j += 2;
            continue;
          }
          if (line[j] === quote) {
            j++;
            break;
          }
          j++;
        }
        tokens.push({
          type: "string",
          value: line.slice(i, j),
          start: i,
          end: j,
        });
        i = j;
        continue;
      }

      // 数字
      if (/\d/.test(ch) || (ch === "." && /\d/.test(line[i + 1]))) {
        const match = line
          .slice(i)
          .match(/^\d+\.?\d*(?:[eE][+-]?\d+)?|0[xX][0-9a-fA-F]+/);
        if (match) {
          tokens.push({
            type: "number",
            value: match[0],
            start: i,
            end: i + match[0].length,
          });
          i += match[0].length;
          continue;
        }
      }

      // 标识符 / 关键字
      if (/[A-Za-z_$]/.test(ch)) {
        let j = i;
        while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
        const word = line.slice(i, j);
        const type = this.keywords.has(word) ? "keyword" : "identifier";
        tokens.push({ type, value: word, start: i, end: j });
        i = j;
        continue;
      }

      // 运算符与标点
      const punctMatch = line
        .slice(i)
        .match(/^[+\-*/%=<>!&|^~?:]+|^[\[\]{}().,;]/);
      if (punctMatch) {
        tokens.push({
          type: "operator",
          value: punctMatch[0],
          start: i,
          end: i + punctMatch[0].length,
        });
        i += punctMatch[0].length;
        continue;
      }

      // 其他字符
      tokens.push({ type: "unknown", value: ch, start: i, end: i + 1 });
      i++;
    }
    return tokens;
  }
}

// ============================================================================
// 6. 语法高亮视图：导出分词后的行
// ============================================================================

/**
 * SyntaxHighlighter：将编辑器内容按行导出为带 token 类型标注的结构
 */
class SyntaxHighlighter {
  constructor(editor, tokenizer) {
    this.editor = editor;
    this.tokenizer = tokenizer;
  }

  /**
   * 导出全部行的 token 列表
   * @returns {Array<Array<{type, value, start, end}>>}
   */
  exportTokenizedLines() {
    const result = [];
    const count = this.editor.buffer.getLineCount();
    for (let i = 0; i < count; i++) {
      result.push(this.tokenizer.tokenizeLine(this.editor.buffer.getLine(i)));
    }
    return result;
  }

  /** 以可读字符串形式打印带类型标注的 token（用于调试） */
  prettyPrint() {
    const lines = this.exportTokenizedLines();
    return lines
      .map((tokens, idx) => {
        const parts = tokens
          .filter((t) => t.type !== "whitespace")
          .map((t) => `[${t.type}:${t.value}]`)
          .join(" ");
        return `L${idx + 1}: ${parts}`;
      })
      .join("\n");
  }
}

// ============================================================================
// 7. 测试用例
// ============================================================================

function runTests() {
  console.log("================ 1. 基本编辑：插入文本 ================");
  const editor = new CodeEditor("");
  editor.insert("hello");
  editor.insert(" world");
  console.log("文本:", JSON.stringify(editor.getValue())); // "hello world"
  console.log("光标:", editor.getPosition().toString()); // (0:11)

  console.log("\n================ 2. 多行插入 ================");
  editor.setPosition(0, 11);
  editor.insert("\nsecond line\nthird line");
  console.log("文本:\n" + editor.getValue());
  console.log("总行数:", editor.buffer.getLineCount()); // 3

  console.log("\n================ 3. 移动光标 ================");
  editor.setPosition(0, 0);
  editor.moveCursor("right", false);
  editor.moveCursor("right", false);
  console.log("右移两次后光标:", editor.getPosition().toString()); // (0:2)
  editor.moveCursor("down", false);
  console.log("下移后光标:", editor.getPosition().toString()); // (1:2)
  editor.moveCursor("end", false);
  console.log("行末:", editor.getPosition().toString()); // (1:11)

  console.log("\n================ 4. 选区删除 ================");
  editor.setSelection(0, 0, 0, 5); // 选中 "hello"
  editor.insert("HELLO"); // 替换选区
  console.log("替换后第1行:", editor.buffer.getLine(0)); // "HELLO world"

  console.log("\n================ 5. 撤销 / 重做 ================");
  editor.undo();
  console.log("撤销后第1行:", editor.buffer.getLine(0)); // "hello world" (撤销 HELLO 替换)
  editor.undo();
  console.log("再撤销(取消多行插入):", JSON.stringify(editor.getValue())); // "hello world"
  editor.redo();
  console.log("重做后第1行(恢复多行):", editor.buffer.getLine(0)); // "hello world"

  console.log("\n================ 6. 退格删除 ================");
  editor.setPosition(0, 5);
  editor.deleteBack(1);
  console.log("退格后第1行:", editor.buffer.getLine(0)); // "hell world" (在 col 5 退格删除 'o')

  console.log("\n================ 7. 语法分词 ================");
  const codeEditor = new CodeEditor(
    "const x = 42;\n// a comment\nfunction add(a, b) {\n  return a + b;\n}\n",
  );
  const tokenizer = new SimpleTokenizer();
  const highlighter = new SyntaxHighlighter(codeEditor, tokenizer);
  console.log("分词结果:");
  console.log(highlighter.prettyPrint());

  console.log("\n================ 8. 导出 token 化的行结构 ================");
  const tokenizedLines = highlighter.exportTokenizedLines();
  console.log("第1行 tokens:", JSON.stringify(tokenizedLines[0]));
  console.log("第3行 tokens 数量:", tokenizedLines[2].length);
}

runTests();
