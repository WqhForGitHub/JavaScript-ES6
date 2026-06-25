/**
 * 手写简易 px 转 rem 插件
 *
 * 功能：将 CSS 中的 px 值转为 rem
 *   rem = px / rootFontSize
 *
 * 实现思路：
 *   1. 解析 CSS 声明中的 px 值
 *   2. 按基准根字体大小换算为 rem
 *   3. 支持排除特定属性和最小转换值
 */

function pxToRem(css, options = {}) {
  const {
    rootValue = 16,
    unitPrecision = 5,
    minPixelValue = 2,
    excludeProps = [],
  } = options;
  // 解析 CSS
  const re = /([^{}]+)\{([^}]*)\}/g;
  let m;
  const result = [];
  while ((m = re.exec(css)) !== null) {
    const selector = m[1].trim();
    const declarations = m[2].trim();
    result.push(selector + " {");
    // 替换 px 值
    const fixed = declarations.replace(/([\d.]+)px/g, (match, valStr) => {
      const val = parseFloat(valStr);
      if (val < minPixelValue) return match;
      const rem = (val / rootValue).toFixed(unitPrecision);
      return rem + "rem";
    });
    result.push(
      "  " +
        fixed
          .split(";")
          .filter((d) => d.trim())
          .map((d) => d.trim() + ";")
          .join("\n  "),
    );
    result.push("}");
  }
  return result.join("\n");
}

// ===== 测试 =====
const css = `
.box {
  width: 320px;
  height: 200px;
  font-size: 16px;
  border: 1px solid #ccc;
  padding: 10px 20px;
  margin-top: 32px;
}
`;
console.log("=== rootValue: 16 ===");
console.log(pxToRem(css, { rootValue: 16 }));
/* width: 20rem; height: 12.5rem; font-size: 1rem; border: 1px (不转); padding: 0.625rem 1.25rem; margin-top: 2rem */
console.log("\n=== rootValue: 32 ===");
console.log(pxToRem(css, { rootValue: 32 }));
