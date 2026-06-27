/**
 * 手写简易推荐系统（协同过滤）
 * ---------------------------------------------------------------
 * 实现基于协同过滤（Collaborative Filtering）的推荐系统：
 * 1. 用户-物品评分矩阵
 * 2. 用户相似度计算（余弦相似度）
 * 3. 找 K 个最近邻
 * 4. 预测用户对未评分物品的评分
 * 5. 推荐 Top-N 物品
 * 6. 支持基于物品的协同过滤（Item-based CF）
 *
 * 演示：给用户推荐电影。
 */

"use strict";

// ============================================================================
// 1. 工具：余弦相似度
// ============================================================================

/**
 * 计算两个向量的余弦相似度
 * cos(a, b) = (a · b) / (||a|| * ||b||)
 * 仅在两个向量共有的维度（即两个用户都评分过的物品）上计算
 */
function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  // vecA / vecB 形如 { itemId: rating }
  const keysA = Object.keys(vecA);
  const keysB = Object.keys(vecB);
  // 计算点积（仅共同维度）
  for (const k of keysA) {
    if (vecB[k] !== undefined) dot += vecA[k] * vecB[k];
  }
  for (const k of keysA) normA += vecA[k] ** 2;
  for (const k of keysB) normB += vecB[k] ** 2;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 皮尔逊相关系数（中心化后的余弦，缓解用户评分尺度差异）
 */
function pearsonSimilarity(vecA, vecB) {
  // 找到共同评分项
  const common = Object.keys(vecA).filter((k) => vecB[k] !== undefined);
  if (common.length === 0) return 0;
  const meanA = common.reduce((s, k) => s + vecA[k], 0) / common.length;
  const meanB = common.reduce((s, k) => s + vecB[k], 0) / common.length;
  let num = 0,
    denA = 0,
    denB = 0;
  for (const k of common) {
    const da = vecA[k] - meanA;
    const db = vecB[k] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  if (denA === 0 || denB === 0) return 0;
  return num / (Math.sqrt(denA) * Math.sqrt(denB));
}

// ============================================================================
// 2. 用户-物品评分矩阵
// ============================================================================

/**
 * RatingMatrix：以稀疏方式存储评分
 * ratings[userId] = { itemId: rating }
 */
class RatingMatrix {
  constructor() {
    this.ratings = new Map(); // userId -> { itemId: rating }
    this.items = new Set(); // 所有出现过的 itemId
    this.users = new Set();
  }

  /** 添加一条评分 */
  addRating(userId, itemId, rating) {
    if (!this.ratings.has(userId)) this.ratings.set(userId, {});
    this.ratings.get(userId)[itemId] = rating;
    this.users.add(userId);
    this.items.add(itemId);
  }

  /** 获取某用户的全部评分 */
  getUserRatings(userId) {
    return this.ratings.get(userId) || {};
  }

  /** 获取所有用户 id */
  getUserIds() {
    return [...this.users];
  }

  /** 获取所有物品 id */
  getItemIds() {
    return [...this.items];
  }

  /** 用户是否已对某物品评分 */
  hasRated(userId, itemId) {
    const u = this.ratings.get(userId);
    return u ? u[itemId] !== undefined : false;
  }

  /** 获取对某物品评过分的所有用户 */
  getUsersWhoRated(itemId) {
    const result = [];
    for (const [userId, ratings] of this.ratings) {
      if (ratings[itemId] !== undefined) result.push(userId);
    }
    return result;
  }

  /** 某物品的平均评分 */
  averageRating(itemId) {
    const users = this.getUsersWhoRated(itemId);
    if (users.length === 0) return 0;
    const sum = users.reduce((s, u) => s + this.ratings.get(u)[itemId], 0);
    return sum / users.length;
  }

  /** 某用户的平均评分 */
  userAverage(userId) {
    const r = this.getUserRatings(userId);
    const vals = Object.values(r);
    if (vals.length === 0) return 0;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  }
}

// ============================================================================
// 3. 基于用户的协同过滤（User-based CF）
// ============================================================================

/**
 * UserBasedCF：基于用户的协同过滤
 */
class UserBasedCF {
  /**
   * @param {RatingMatrix} matrix
   * @param {Object} options
   * @param {number} options.k 最近邻数量
   * @param {Function} options.similarity 相似度函数
   */
  constructor(matrix, options = {}) {
    this.matrix = matrix;
    this.k = options.k ?? 3;
    this.similarity = options.similarity ?? cosineSimilarity;
    // 缓存：userId -> [{ neighbor, sim }]
    this._neighborCache = new Map();
  }

  /** 计算某用户与所有其他用户的相似度，返回按相似度降序的邻居列表 */
  findNeighbors(userId) {
    if (this._neighborCache.has(userId)) {
      return this._neighborCache.get(userId);
    }
    const targetRatings = this.matrix.getUserRatings(userId);
    const neighbors = [];
    for (const otherId of this.matrix.getUserIds()) {
      if (otherId === userId) continue;
      const sim = this.similarity(
        targetRatings,
        this.matrix.getUserRatings(otherId),
      );
      if (sim > 0) neighbors.push({ neighbor: otherId, sim });
    }
    neighbors.sort((a, b) => b.sim - a.sim);
    const topK = neighbors.slice(0, this.k);
    this._neighborCache.set(userId, topK);
    return topK;
  }

  /**
   * 预测用户对某物品的评分
   * 使用邻居评分的加权平均（减去邻居均值，再加上目标用户均值，缓解尺度差异）
   */
  predictRating(userId, itemId) {
    if (this.matrix.hasRated(userId, itemId)) {
      return this.matrix.getUserRatings(userId)[itemId];
    }
    const neighbors = this.findNeighbors(userId);
    if (neighbors.length === 0) return this.matrix.averageRating(itemId);

    const userMean = this.matrix.userAverage(userId);
    let num = 0;
    let den = 0;
    for (const { neighbor, sim } of neighbors) {
      const neighborRatings = this.matrix.getUserRatings(neighbor);
      if (neighborRatings[itemId] === undefined) continue;
      const neighborMean = this.matrix.userAverage(neighbor);
      num += sim * (neighborRatings[itemId] - neighborMean);
      den += Math.abs(sim);
    }
    if (den === 0) return this.matrix.averageRating(itemId);
    return userMean + num / den;
  }

  /**
   * 为用户推荐 Top-N 物品（只推荐用户未评分过的）
   */
  recommend(userId, n = 5) {
    const candidates = [];
    for (const itemId of this.matrix.getItemIds()) {
      if (this.matrix.hasRated(userId, itemId)) continue;
      const predicted = this.predictRating(userId, itemId);
      candidates.push({ itemId, predictedScore: predicted });
    }
    candidates.sort((a, b) => b.predictedScore - a.predictedScore);
    return candidates.slice(0, n);
  }

  /** 清空邻居缓存（评分矩阵变化后调用） */
  invalidateCache() {
    this._neighborCache.clear();
  }
}

// ============================================================================
// 4. 基于物品的协同过滤（Item-based CF）
// ============================================================================

/**
 * ItemBasedCF：基于物品的协同过滤
 * 思路：先计算物品之间的相似度，预测时用用户已评分过的相似物品加权
 */
class ItemBasedCF {
  constructor(matrix, options = {}) {
    this.matrix = matrix;
    this.k = options.k ?? 3;
    this.similarity = options.similarity ?? cosineSimilarity;
    // 物品相似度缓存：itemId -> [{ item, sim }]
    this._itemSimCache = new Map();
  }

  /**
   * 计算两个物品的相似度：
   * 把"对物品评分过的用户"作为向量维度
   */
  _itemVector(itemId) {
    const vec = {};
    for (const userId of this.matrix.getUsersWhoRated(itemId)) {
      vec[userId] = this.matrix.getUserRatings(userId)[itemId];
    }
    return vec;
  }

  /** 找出与某物品最相似的 K 个物品 */
  findSimilarItems(itemId) {
    if (this._itemSimCache.has(itemId)) return this._itemSimCache.get(itemId);
    const vecA = this._itemVector(itemId);
    const similar = [];
    for (const otherId of this.matrix.getItemIds()) {
      if (otherId === itemId) continue;
      const sim = this.similarity(vecA, this._itemVector(otherId));
      if (sim > 0) similar.push({ item: otherId, sim });
    }
    similar.sort((a, b) => b.sim - a.sim);
    const topK = similar.slice(0, this.k);
    this._itemSimCache.set(itemId, topK);
    return topK;
  }

  /** 预测用户对某物品的评分：用用户已评分的相似物品加权平均 */
  predictRating(userId, itemId) {
    if (this.matrix.hasRated(userId, itemId)) {
      return this.matrix.getUserRatings(userId)[itemId];
    }
    const userRatings = this.matrix.getUserRatings(userId);
    const similarItems = this.findSimilarItems(itemId);
    if (similarItems.length === 0) return this.matrix.averageRating(itemId);

    let num = 0;
    let den = 0;
    for (const { item, sim } of similarItems) {
      if (userRatings[item] === undefined) continue;
      num += sim * userRatings[item];
      den += Math.abs(sim);
    }
    if (den === 0) return this.matrix.averageRating(itemId);
    return num / den;
  }

  /** 推荐 Top-N */
  recommend(userId, n = 5) {
    const candidates = [];
    for (const itemId of this.matrix.getItemIds()) {
      if (this.matrix.hasRated(userId, itemId)) continue;
      candidates.push({
        itemId,
        predictedScore: this.predictRating(userId, itemId),
      });
    }
    candidates.sort((a, b) => b.predictedScore - a.predictedScore);
    return candidates.slice(0, n);
  }

  invalidateCache() {
    this._itemSimCache.clear();
  }
}

// ============================================================================
// 5. 测试用例：电影推荐
// ============================================================================

function runTests() {
  console.log("================ 1. 构建评分矩阵 ================");
  const matrix = new RatingMatrix();
  // 电影评分数据（1-5 分，0/未出现表示未评分）
  // 用户：Alice, Bob, Carol, Dave, Eve
  const ratings = [
    // [user, item, rating]
    ["Alice", "Titanic", 5],
    ["Alice", "Avatar", 4],
    ["Alice", "Inception", 5],
    ["Alice", "Interstellar", 4],
    ["Alice", "Notebook", 5],

    ["Bob", "Titanic", 4],
    ["Bob", "Avatar", 5],
    ["Bob", "Inception", 3],
    ["Bob", "Notebook", 4],

    ["Carol", "Titanic", 5],
    ["Carol", "Notebook", 5],
    ["Carol", "Interstellar", 2],

    ["Dave", "Avatar", 5],
    ["Dave", "Inception", 5],
    ["Dave", "Interstellar", 5],
    ["Dave", "Matrix", 4],

    ["Eve", "Inception", 4],
    ["Eve", "Interstellar", 5],
    ["Eve", "Matrix", 5],
    ["Eve", "Avatar", 3],
  ];
  for (const [u, i, r] of ratings) matrix.addRating(u, i, r);

  console.log("用户数:", matrix.getUserIds().length);
  console.log("物品数:", matrix.getItemIds().length);
  console.log("全部电影:", matrix.getItemIds().join(", "));

  console.log(
    "\n================ 2. 用户相似度（User-based CF） ================",
  );
  const userCF = new UserBasedCF(matrix, {
    k: 3,
    similarity: cosineSimilarity,
  });
  console.log("Alice 的邻居:", userCF.findNeighbors("Alice"));
  console.log("Dave 的邻居:", userCF.findNeighbors("Dave"));

  console.log(
    "\n================ 3. 预测评分（User-based CF） ================",
  );
  console.log(
    "预测 Alice 对 Matrix 的评分:",
    userCF.predictRating("Alice", "Matrix").toFixed(3),
  );
  console.log(
    "预测 Carol 对 Avatar 的评分:",
    userCF.predictRating("Carol", "Avatar").toFixed(3),
  );
  console.log(
    "预测 Carol 对 Matrix 的评分:",
    userCF.predictRating("Carol", "Matrix").toFixed(3),
  );

  console.log(
    "\n================ 4. 推荐 Top-3（User-based CF） ================",
  );
  console.log("给 Alice 推荐:");
  userCF.recommend("Alice", 3).forEach((r) => {
    console.log(`  ${r.itemId}: 预测评分 ${r.predictedScore.toFixed(3)}`);
  });
  console.log("给 Carol 推荐:");
  userCF.recommend("Carol", 3).forEach((r) => {
    console.log(`  ${r.itemId}: 预测评分 ${r.predictedScore.toFixed(3)}`);
  });
  console.log("给 Eve 推荐:");
  userCF.recommend("Eve", 3).forEach((r) => {
    console.log(`  ${r.itemId}: 预测评分 ${r.predictedScore.toFixed(3)}`);
  });

  console.log("\n================ 5. 使用皮尔逊相似度 ================");
  const userCFPearson = new UserBasedCF(matrix, {
    k: 3,
    similarity: pearsonSimilarity,
  });
  console.log("Alice 的邻居 (Pearson):", userCFPearson.findNeighbors("Alice"));
  console.log(
    "预测 Alice 对 Matrix 的评分 (Pearson):",
    userCFPearson.predictRating("Alice", "Matrix").toFixed(3),
  );
  console.log("给 Alice 推荐 (Pearson):");
  userCFPearson.recommend("Alice", 3).forEach((r) => {
    console.log(`  ${r.itemId}: 预测评分 ${r.predictedScore.toFixed(3)}`);
  });

  console.log("\n================ 6. Item-based CF ================");
  const itemCF = new ItemBasedCF(matrix, {
    k: 3,
    similarity: cosineSimilarity,
  });
  console.log(
    "与 Inception 最相似的电影:",
    itemCF.findSimilarItems("Inception"),
  );
  console.log("与 Titanic 最相似的电影:", itemCF.findSimilarItems("Titanic"));

  console.log("\n================ 7. Item-based CF 推荐 ================");
  console.log(
    "预测 Alice 对 Matrix 的评分 (Item-based):",
    itemCF.predictRating("Alice", "Matrix").toFixed(3),
  );
  console.log("给 Alice 推荐 (Item-based):");
  itemCF.recommend("Alice", 3).forEach((r) => {
    console.log(`  ${r.itemId}: 预测评分 ${r.predictedScore.toFixed(3)}`);
  });

  console.log("\n================ 8. 推荐结果解释（透明化） ================");
  // 展示 Alice 对 Matrix 的预测是怎么来的（基于用户CF）
  const neighbors = userCF.findNeighbors("Alice");
  console.log("Alice 对 Matrix 的预测依据（邻居评分）:");
  const aliceMean = matrix.userAverage("Alice");
  let num = 0,
    den = 0;
  for (const { neighbor, sim } of neighbors) {
    const r = matrix.getUserRatings(neighbor)["Matrix"];
    if (r === undefined) {
      console.log(`  邻居 ${neighbor} (sim=${sim.toFixed(3)}): 未评分 Matrix`);
      continue;
    }
    const nMean = matrix.userAverage(neighbor);
    const contribution = sim * (r - nMean);
    num += contribution;
    den += Math.abs(sim);
    console.log(
      `  邻居 ${neighbor} (sim=${sim.toFixed(3)}): 评分 ${r}, 均值 ${nMean.toFixed(2)}, 贡献 ${contribution.toFixed(3)}`,
    );
  }
  console.log(
    `  Alice 均值: ${aliceMean.toFixed(2)}, 加权贡献和: ${num.toFixed(3)}, 权重和: ${den.toFixed(3)}`,
  );
  console.log(
    `  最终预测: ${aliceMean.toFixed(2)} + ${num.toFixed(3)}/${den.toFixed(3)} = ${(aliceMean + num / den).toFixed(3)}`,
  );

  console.log("\n================ 9. 评分矩阵变化后刷新缓存 ================");
  matrix.addRating("Alice", "Matrix", 5); // Alice 现在看了 Matrix
  userCF.invalidateCache();
  itemCF.invalidateCache();
  console.log("Alice 已评分 Matrix 后，新的推荐 (User-based):");
  userCF.recommend("Alice", 3).forEach((r) => {
    console.log(`  ${r.itemId}: 预测评分 ${r.predictedScore.toFixed(3)}`);
  });
}

runTests();
