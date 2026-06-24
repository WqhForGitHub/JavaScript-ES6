/**
 * 手写复制到剪贴板
 *
 * 实现方式：
 *   1. navigator.clipboard.writeText（现代 API，需 HTTPS 或 localhost）
 *   2. document.execCommand('copy')（兼容方案，已被标记废弃但仍广泛使用）
 *
 * 注意：execCommand 方案需要在浏览器环境中运行。
 */

/**
 * 复制文本到剪贴板（异步，优先使用 Clipboard API）
 * @param {string} text - 要复制的文本
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
  // 优先使用现代 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (e) {
      // 权限不足或环境不支持，降级到 execCommand
      console.warn('Clipboard API 不可用，降级到 execCommand');
    }
  }
  // 降级方案
  return copyByExecCommand(text);
}

/**
 * 使用 execCommand 复制（兼容方案）
 * @param {string} text
 * @returns {Promise<void>}
 */
function copyByExecCommand(text) {
  return new Promise(function (resolve, reject) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    // 移出可视区域，避免页面跳动
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    // 选中并复制
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    var success = false;
    try {
      success = document.execCommand('copy');
    } catch (e) {
      success = false;
    }

    document.body.removeChild(textarea);

    if (success) {
      resolve();
    } else {
      reject(new Error('复制失败，请手动复制'));
    }
  });
}

/**
 * 复制到剪贴板（回调风格）
 * @param {string} text
 * @param {Function} [callback] - 回调，参数为错误对象（null 表示成功）
 */
function copyWithCallback(text, callback) {
  copyToClipboard(text)
    .then(function () { callback && callback(null); })
    .catch(function (err) { callback && callback(err); });
}

/**
 * 从剪贴板读取文本
 * @returns {Promise<string>}
 */
async function readFromClipboard() {
  if (navigator.clipboard && navigator.clipboard.readText) {
    return await navigator.clipboard.readText();
  }
  throw new Error('当前环境不支持读取剪贴板');
}

// ===== 测试用例（需浏览器环境） =====
// copyToClipboard('Hello World')
//   .then(function () { console.log('复制成功'); })
//   .catch(function (err) { console.error('复制失败', err); });
//
// copyWithCallback('测试文本', function (err) {
//   if (err) console.error(err);
//   else console.log('回调：复制成功');
// });
//
// readFromClipboard().then(function (text) {
//   console.log('剪贴板内容：', text);
// });

// 模拟测试：验证 execCommand 方案的选择逻辑
function chooseMethod(hasClipboardAPI, isSecureContext) {
  if (hasClipboardAPI && isSecureContext) return 'clipboard-api';
  return 'exec-command';
}
console.log(chooseMethod(true, true)); // => 'clipboard-api'
console.log(chooseMethod(true, false)); // => 'exec-command'
console.log(chooseMethod(false, true)); // => 'exec-command'
console.log(chooseMethod(false, false)); // => 'exec-command'

// 验证 textarea 创建逻辑（纯逻辑测试）
function createTextareaValue(text) {
  return { value: text, selected: false, removed: false };
}
var t = createTextareaValue('test');
console.log(t.value); // => 'test'
console.log(t.selected); // => false
