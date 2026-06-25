/**
 * 手写驼峰与短横线互转
 *
 * 功能：在 camelCase（驼峰）与 kebab-case（短横线）之间双向转换
 * 实现思路：
 *   1. camelToKebab：在大写字母前插入短横线，再统一转小写
 *      - 处理连续大写（如 XMLParser -> xml-parser 或保留为 xml-parser）
 *      - 处理数字边界
 *   2. kebabToCamel：按短横线分割，首段保持原样，后续段首字母大写
 *   3. 同时支持下划线（snake_case）作为兼容输入
 */

/**
 * 驼峰转短横线（kebab-case）
 * @param {string} str 驼峰字符串
 * @returns {string} 短横线字符串
 */
function camelToKebab(str) {
  if (typeof str !== "string" || str.length === 0) return "";

  // 在大写字母前插入短横线；同时处理下划线转短横线
  let result = str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // 小写/数字 后跟大写
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2") // 连续大写后跟小写：XMLHttp -> XML-Http
    .replace(/_/g, "-"); // 下划线统一为短横线

  return result.toLowerCase();
}

/**
 * 短横线转驼峰（camelCase）
 * @param {string} str 短横线字符串
 * @returns {string} 驼峰字符串
 */
function kebabToCamel(str) {
  if (typeof str !== "string" || str.length === 0) return "";

  // 按短横线或下划线分割
  const parts = str.split(/[-_]/);

  return parts
    .map((part, index) => {
      if (index === 0) return part.toLowerCase();
      if (part.length === 0) return "";
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");
}

/**
 * 自动识别并互转：传入驼峰则转短横线，传入短横线/下划线则转驼峰
 * @param {string} str
 * @returns {string}
 */
function autoConvert(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  if (/[-_]/.test(str)) return kebabToCamel(str);
  if (/[A-Z]/.test(str)) return camelToKebab(str);
  return str;
}

// ===== 测试用例 =====
console.log("=== 驼峰与短横线互转 ===");

// 1. 驼峰转短横线
console.log(camelToKebab("getElementById"));
// 期望输出: get-element-by-id

// 2. 含数字
console.log(camelToKebab("userId42"));
// 期望输出: user-id42

// 3. 连续大写
console.log(camelToKebab("XMLHttpRequest"));
// 期望输出: xml-http-request

// 4. 下划线输入转短横线
console.log(camelToKebab("user_name"));
// 期望输出: user-name

// 5. 短横线转驼峰
console.log(kebabToCamel("get-element-by-id"));
// 期望输出: getElementById

// 6. 下划线转驼峰
console.log(kebabToCamel("get_element_by_id"));
// 期望输出: getElementById

// 7. 含数字
console.log(kebabToCamel("user-id-42"));
// 期望输出: userId42

// 8. 已是驼峰（无分隔符）
console.log(kebabToCamel("alreadyCamel"));
// 期望输出: alreadycamel (首段小写)

// 9. 自动识别互转
console.log(autoConvert("getElementById"));
// 期望输出: get-element-by-id
console.log(autoConvert("get-element-by-id"));
// 期望输出: getElementById

// 10. 空字符串
console.log(camelToKebab(""));
// 期望输出: (空字符串)
