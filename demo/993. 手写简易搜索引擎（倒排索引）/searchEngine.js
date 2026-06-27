/**
 * 手写简易搜索引擎（倒排索引）
 * ---------------------------------------------------------------
 * 实现一个基于倒排索引的简易搜索引擎：
 * 1. 文档分词：拆分、转小写、去停用词、词干化（简化版）
 * 2. 构建倒排索引：term -> [{ docId, frequency, positions }]
 * 3. 布尔查询：AND / OR / NOT
 * 4. TF-IDF 排序
 * 5. 短语查询：利用 positions 判断词项是否连续出现
 *
 * 演示：索引一组文档，执行多种查询。
 */

"use strict";

// ============================================================================
// 1. 分词器
// ============================================================================

/**
 * 简易英文停用词表
 */
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "not",
  "but",
  "if",
  "then",
  "else",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "from",
  "up",
  "down",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "should",
  "could",
  "can",
  "may",
  "might",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
]);

/**
 * 简易词干提取器（Porter 算法的极简版本）
 * 仅处理常见的复数与过去式后缀，足以演示概念。
 */
function stem(word) {
  if (word.length <= 3) return word;
  // 复数
  if (word.endsWith("sses")) return word.slice(0, -2);
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ss")) return word;
  if (word.endsWith("s")) return word.slice(0, -1);
  // 过去式 / 进行时
  if (word.endsWith("eed") && word.length > 4) return word.slice(0, -1);
  if (word.endsWith("ed") && word.length > 3) return word.slice(0, -2);
  if (word.endsWith("ing") && word.length > 4) return word.slice(0, -3);
  return word;
}

/**
 * Tokenizer：把一段文本切分为 token 列表
 * 步骤：小写化 -> 按非字母数字拆分 -> 去停用词 -> 词干化
 */
class Tokenizer {
  constructor(options = {}) {
    this.stopWords = options.stopWords || STOP_WORDS;
    this.enableStemming = options.enableStemming !== false;
  }

  tokenize(text) {
    if (!text) return [];
    const lower = text.toLowerCase();
    // 匹配英文单词或数字串；同时保留中文连续字符（演示用）
    const raw = lower.match(/[a-z0-9]+|[\u4e00-\u9fa5]+/g) || [];
    const tokens = [];
    for (const w of raw) {
      if (this.stopWords.has(w)) continue;
      tokens.push(this.enableStemming ? stem(w) : w);
    }
    return tokens;
  }
}

// ============================================================================
// 2. 倒排索引
// ============================================================================

/**
 * 倒排索引中的一条记录：term 在某个文档中的统计信息
 */
class Posting {
  constructor(docId) {
    this.docId = docId;
    this.frequency = 0; // 词频
    this.positions = []; // 在文档中出现的位置（token 索引）
  }
}

/**
 * InvertedIndex：倒排索引
 * term -> Posting[]
 */
class InvertedIndex {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.index = new Map(); // term -> Map<docId, Posting>
    this.documents = new Map(); // docId -> { id, text, length(词数) }
  }

  /** 添加一个文档 */
  addDocument(doc) {
    const { id, text } = doc;
    if (this.documents.has(id)) {
      // 已存在则先移除旧的
      this.removeDocument(id);
    }
    const tokens = this.tokenizer.tokenize(text);
    this.documents.set(id, { id, text, length: tokens.length });

    // 记录每个 token 的位置
    const termPositions = new Map();
    for (let i = 0; i < tokens.length; i++) {
      const term = tokens[i];
      if (!termPositions.has(term)) termPositions.set(term, []);
      termPositions.get(term).push(i);
    }

    // 写入倒排索引
    for (const [term, positions] of termPositions) {
      if (!this.index.has(term)) this.index.set(term, new Map());
      const posting = new Posting(id);
      posting.frequency = positions.length;
      posting.positions = positions;
      this.index.get(term).set(id, posting);
    }
  }

  /** 移除文档 */
  removeDocument(docId) {
    if (!this.documents.has(docId)) return false;
    for (const [term, postings] of this.index) {
      if (postings.has(docId)) {
        postings.delete(docId);
        if (postings.size === 0) this.index.delete(term);
      }
    }
    this.documents.delete(docId);
    return true;
  }

  /** 获取某个 term 的全部 Posting（按 docId 排序） */
  getPostings(term) {
    const stemmed = this.tokenizer.enableStemming
      ? stem(term.toLowerCase())
      : term.toLowerCase();
    const postings = this.index.get(stemmed);
    if (!postings) return [];
    return [...postings.values()].sort((a, b) => a.docId - b.docId);
  }

  /** 文档总数 */
  get docCount() {
    return this.documents.size;
  }

  /** 包含某 term 的文档数（df） */
  documentFrequency(term) {
    return this.getPostings(term).length;
  }

  /** 平均文档长度 */
  get avgDocLength() {
    if (this.documents.size === 0) return 0;
    let total = 0;
    for (const d of this.documents.values()) total += d.length;
    return total / this.documents.size;
  }
}

// ============================================================================
// 3. TF-IDF 打分
// ============================================================================

/**
 * 计算 TF-IDF 分数
 * TF = 词频 / 文档总词数
 * IDF = log( (N + 1) / (df + 1) ) + 1  （平滑）
 */
class TfIdfScorer {
  constructor(index) {
    this.index = index;
  }

  /** 单个 term 在单个文档中的 tf-idf */
  scoreTerm(term, docId) {
    const postings = this.index.getPostings(term);
    const posting = postings.find((p) => p.docId === docId);
    if (!posting) return 0;
    const doc = this.index.documents.get(docId);
    const tf = posting.frequency / (doc.length || 1);
    const N = this.index.docCount;
    const df = postings.length;
    const idf = Math.log((N + 1) / (df + 1)) + 1;
    return tf * idf;
  }

  /** 多个 term 在一个文档中的累计分数 */
  scoreDocument(terms, docId) {
    let score = 0;
    for (const term of terms) {
      score += this.scoreTerm(term, docId);
    }
    return score;
  }
}

// ============================================================================
// 4. 查询解析与执行：支持 AND / OR / NOT
// ============================================================================

/**
 * 查询节点：表示布尔查询的 AST
 * 类型：'term' | 'and' | 'or' | 'not' | 'phrase'
 */
class QueryNode {
  constructor(type, children = [], value = null) {
    this.type = type;
    this.children = children;
    this.value = value;
  }
}

/**
 * 查询解析器：把查询字符串解析为 AST
 * 支持的语法（简化）：
 *   - 单个词：apple
 *   - 短语："machine learning"
 *   - AND：apple AND orange
 *   - OR：apple OR orange
 *   - NOT：apple NOT orange
 *   - 括号：(apple OR orange) AND juice
 * 优先级：NOT > AND > OR
 */
class QueryParser {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
  }

  parse(queryStr) {
    this.tokens = this._lex(queryStr);
    this.pos = 0;
    const node = this._parseOr();
    if (this.pos < this.tokens.length) {
      throw new Error(
        `查询语法错误，未消费 token: ${this.tokens.slice(this.pos).join(" ")}`,
      );
    }
    return node;
  }

  /** 词法分析：把查询字符串切成 token */
  _lex(s) {
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (/\s/.test(ch)) {
        i++;
        continue;
      }
      if (ch === "(" || ch === ")") {
        tokens.push(ch);
        i++;
        continue;
      }
      if (ch === '"') {
        const end = s.indexOf('"', i + 1);
        const phrase = s.slice(i + 1, end === -1 ? s.length : end);
        tokens.push(`"${phrase}"`);
        i = end === -1 ? s.length : end + 1;
        continue;
      }
      // 读一个词
      let j = i;
      while (j < s.length && !/[\s()"]/.test(s[j])) j++;
      tokens.push(s.slice(i, j));
      i = j;
    }
    return tokens;
  }

  _peek() {
    return this.tokens[this.pos];
  }
  _next() {
    return this.tokens[this.pos++];
  }

  _parseOr() {
    let left = this._parseAnd();
    while (this._peek() === "OR") {
      this._next();
      const right = this._parseAnd();
      left = new QueryNode("or", [left, right]);
    }
    return left;
  }

  _parseAnd() {
    let left = this._parseNot();
    while (this._peek() && this._peek() !== "OR" && this._peek() !== ")") {
      if (this._peek() === "AND") {
        this._next();
      }
      // 隐式 AND：连续两个操作数
      const right = this._parseNot();
      left = new QueryNode("and", [left, right]);
    }
    return left;
  }

  _parseNot() {
    if (this._peek() === "NOT") {
      this._next();
      const child = this._parseAtom();
      return new QueryNode("not", [child]);
    }
    return this._parseAtom();
  }

  _parseAtom() {
    const tok = this._peek();
    if (tok === "(") {
      this._next();
      const node = this._parseOr();
      if (this._peek() === ")") this._next();
      return node;
    }
    if (tok && tok.startsWith('"')) {
      this._next();
      const phrase = tok.slice(1, -1);
      return new QueryNode("phrase", [], phrase);
    }
    this._next();
    return new QueryNode("term", [], tok);
  }
}

// ============================================================================
// 5. 搜索引擎：SearchEngine
// ============================================================================

/**
 * SearchEngine：对外暴露的搜索引擎
 * 组合倒排索引、查询解析器、TF-IDF 打分
 */
class SearchEngine {
  constructor(options = {}) {
    this.tokenizer = new Tokenizer(options);
    this.index = new InvertedIndex(this.tokenizer);
    this.scorer = new TfIdfScorer(this.index);
    this.parser = new QueryParser(this.tokenizer);
  }

  /** 添加文档（可批量） */
  addDocuments(docs) {
    for (const d of docs) this.index.addDocument(d);
  }

  /** 移除文档 */
  removeDocument(docId) {
    return this.index.removeDocument(docId);
  }

  /**
   * 执行查询，返回排序后的结果列表
   * @param {string} queryStr 查询字符串
   * @param {number} limit 最多返回数量
   * @returns {Array<{docId, score, text}>}
   */
  search(queryStr, limit = 10) {
    const ast = this.parser.parse(queryStr);
    const candidateSet = this._evaluate(ast);
    // 收集查询中的所有正向 term，用于打分
    const terms = [];
    this._collectTerms(ast, terms, true);

    // 对候选文档打分并排序
    const results = [];
    for (const docId of candidateSet) {
      const score = this.scorer.scoreDocument(terms, docId);
      const doc = this.index.documents.get(docId);
      results.push({ docId, score, text: doc.text, length: doc.length });
    }
    results.sort((a, b) => b.score - a.score || a.docId - b.docId);
    return results.slice(0, limit);
  }

  /**
   * 递归求值 AST，返回满足条件的文档 id 集合（Set）
   */
  _evaluate(node) {
    switch (node.type) {
      case "term": {
        const term = this.tokenizer.enableStemming
          ? stem(node.value.toLowerCase())
          : node.value.toLowerCase();
        return new Set(this.index.getPostings(term).map((p) => p.docId));
      }
      case "phrase": {
        return this._evaluatePhrase(node.value);
      }
      case "and": {
        const left = this._evaluate(node.children[0]);
        const right = this._evaluate(node.children[1]);
        // 交集
        const result = new Set();
        for (const id of left) if (right.has(id)) result.add(id);
        return result;
      }
      case "or": {
        const left = this._evaluate(node.children[0]);
        const right = this._evaluate(node.children[1]);
        return new Set([...left, ...right]);
      }
      case "not": {
        // NOT x = 所有文档 - x
        const child = this._evaluate(node.children[0]);
        const all = new Set(this.index.documents.keys());
        for (const id of child) all.delete(id);
        return all;
      }
      default:
        return new Set();
    }
  }

  /**
   * 短语查询：利用 positions 判断词项是否连续出现
   */
  _evaluatePhrase(phrase) {
    const terms = this.tokenizer.tokenize(phrase);
    if (terms.length === 0) return new Set();
    if (terms.length === 1) {
      return new Set(this.index.getPostings(terms[0]).map((p) => p.docId));
    }
    // 取第一个 term 的 posting，逐个文档检查后续 term 是否在相邻位置
    const firstPostings = this.index.getPostings(terms[0]);
    const result = new Set();
    for (const posting of firstPostings) {
      // 对该文档，检查每个起始位置是否能匹配完整短语
      for (const startPos of posting.positions) {
        let matched = true;
        for (let k = 1; k < terms.length; k++) {
          const nextPostings = this.index.getPostings(terms[k]);
          const np = nextPostings.find((p) => p.docId === posting.docId);
          if (!np || !np.positions.includes(startPos + k)) {
            matched = false;
            break;
          }
        }
        if (matched) {
          result.add(posting.docId);
          break;
        }
      }
    }
    return result;
  }

  /** 收集 AST 中的正向 term（用于打分） */
  _collectTerms(node, out, positive) {
    if (node.type === "term") {
      if (positive) {
        const t = this.tokenizer.enableStemming
          ? stem(node.value.toLowerCase())
          : node.value.toLowerCase();
        out.push(t);
      }
    } else if (node.type === "phrase") {
      if (positive) out.push(...this.tokenizer.tokenize(node.value));
    } else if (node.type === "not") {
      // NOT 的子节点是负向的，不计入打分
      this._collectTerms(node.children[0], out, false);
    } else {
      for (const c of node.children) this._collectTerms(c, out, positive);
    }
  }

  /** 调试用：导出整个倒排索引 */
  dumpIndex() {
    const obj = {};
    for (const [term, postings] of this.index.index) {
      obj[term] = [...postings.values()].map((p) => ({
        docId: p.docId,
        freq: p.frequency,
        pos: p.positions,
      }));
    }
    return obj;
  }
}

// ============================================================================
// 6. 测试用例
// ============================================================================

function runTests() {
  console.log("================ 1. 构建索引 ================");
  const engine = new SearchEngine();
  const docs = [
    { id: 1, text: "The quick brown fox jumps over the lazy dog" },
    { id: 2, text: "Machine learning is a subset of artificial intelligence" },
    { id: 3, text: "Deep learning is a branch of machine learning" },
    {
      id: 4,
      text: "Natural language processing uses machine learning techniques",
    },
    { id: 5, text: "The lazy dog sleeps all day while the fox runs" },
    {
      id: 6,
      text: "Artificial intelligence and machine learning are trending topics",
    },
  ];
  engine.addDocuments(docs);
  console.log("文档总数:", engine.index.docCount);
  console.log("平均文档长度:", engine.index.avgDocLength.toFixed(2));

  console.log(
    "\n================ 2. 倒排索引片段（machine / learning） ================",
  );
  console.log(
    "machine ->",
    JSON.stringify(
      engine.index
        .getPostings("machine")
        .map((p) => ({ docId: p.docId, freq: p.frequency, pos: p.positions })),
    ),
  );
  console.log(
    "learning ->",
    JSON.stringify(
      engine.index
        .getPostings("learning")
        .map((p) => ({ docId: p.docId, freq: p.frequency, pos: p.positions })),
    ),
  );

  console.log("\n================ 3. 单词查询 ================");
  console.log('查询 "fox":');
  console.log(engine.search("fox"));

  console.log('\n查询 "learning":');
  console.log(
    engine
      .search("learning")
      .map((r) => ({ docId: r.docId, score: r.score.toFixed(3) })),
  );

  console.log("\n================ 4. AND 查询 ================");
  console.log('查询 "machine AND learning":');
  console.log(
    engine
      .search("machine AND learning")
      .map((r) => ({ docId: r.docId, score: r.score.toFixed(3) })),
  );

  console.log("\n================ 5. OR 查询 ================");
  console.log('查询 "fox OR dog":');
  console.log(
    engine
      .search("fox OR dog")
      .map((r) => ({ docId: r.docId, score: r.score.toFixed(3) })),
  );

  console.log("\n================ 6. NOT 查询 ================");
  console.log('查询 "learning NOT machine":');
  console.log(
    engine
      .search("learning NOT machine")
      .map((r) => ({ docId: r.docId, score: r.score.toFixed(3) })),
  );

  console.log("\n================ 7. 复合查询（带括号） ================");
  console.log('查询 "(fox OR dog) AND lazy":');
  console.log(
    engine
      .search("(fox OR dog) AND lazy")
      .map((r) => ({ docId: r.docId, score: r.score.toFixed(3) })),
  );

  console.log("\n================ 8. 短语查询 ================");
  console.log('查询 "machine learning"（短语）:');
  const phraseResults = engine.search('"machine learning"');
  console.log(phraseResults.map((r) => ({ docId: r.docId, text: r.text })));

  console.log('\n查询 "artificial intelligence"（短语）:');
  console.log(
    engine.search('"artificial intelligence"').map((r) => ({ docId: r.docId })),
  );

  console.log("\n================ 9. TF-IDF 排序验证 ================");
  console.log('查询 "machine learning"（普通 AND，按 TF-IDF 排序）:');
  const ranked = engine.search("machine AND learning");
  ranked.forEach((r) => {
    console.log(`  doc ${r.docId}: score=${r.score.toFixed(3)}  | ${r.text}`);
  });

  console.log("\n================ 10. 文档更新 ================");
  engine.removeDocument(3);
  console.log('移除 doc 3 后再查 "learning":');
  console.log(engine.search("learning").map((r) => r.docId));
  engine.addDocuments([
    { id: 3, text: "Deep learning is a branch of machine learning" },
  ]);
  console.log('重新添加 doc 3 后再查 "learning":');
  console.log(engine.search("learning").map((r) => r.docId));

  console.log("\n================ 11. 完整倒排索引 dump ================");
  console.log(JSON.stringify(engine.dumpIndex(), null, 2));
}

runTests();
