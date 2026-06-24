/**
 * 手写简易 CSS 前缀自动添加（PostCSS 插件）
 *
 * 功能：为 CSS 属性自动添加浏览器前缀（-webkit-, -moz-, -ms-）
 * 实现思路：
 *   1. 解析 CSS 规则
 *   2. 查找需要前缀的属性
 *   3. 在原属性前插入带前缀的版本
 */

const prefixMap = {
  'transform': ['-webkit-', '-ms-'],
  'transition': ['-webkit-'],
  'animation': ['-webkit-'],
  'flex': ['-webkit-', '-ms-'],
  'justify-content': ['-webkit-'],
  'align-items': ['-webkit-'],
  'user-select': ['-webkit-', '-moz-', '-ms-'],
  'appearance': ['-webkit-', '-moz-'],
  'backdrop-filter': ['-webkit-'],
  'clip-path': ['-webkit-'],
};

function autoprefix(css) {
  const rules = [];
  const re = /([^{}]+)\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const selector = m[1].trim();
    const decls = m[2].trim().split(';').filter(d => d.trim()).map(d => {
      const idx = d.indexOf(':');
      return { prop: d.substring(0, idx).trim(), value: d.substring(idx + 1).trim().replace(/!important/, '').trim(), important: /!important/.test(d) };
    });
    rules.push({ selector, decls });
  }
  const result = [];
  for (const rule of rules) {
    result.push(rule.selector + ' {');
    for (const d of rule.decls) {
      const prefixes = prefixMap[d.prop];
      if (prefixes && !d.prop.startsWith('-')) {
        for (const p of prefixes) { const imp = d.important ? ' !important' : ''; result.push('  ' + p + d.prop + ': ' + d.value + imp + ';'); }
      }
      const imp = d.important ? ' !important' : '';
      result.push('  ' + d.prop + ': ' + d.value + imp + ';');
    }
    result.push('}');
  }
  return result.join('\n');
}

// ===== 测试 =====
const css = ".box { transform: rotate(45deg); transition: all 0.3s; user-select: none; display: flex; justify-content: center; }";
console.log(autoprefix(css));
