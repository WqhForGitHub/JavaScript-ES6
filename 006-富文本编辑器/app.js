/**
 * Mini Notion 富文本编辑器
 * 核心：contenteditable + document.execCommand + Selection API + 自动保存
 */
const editor = document.getElementById('editor');
const toolbar = document.getElementById('toolbar');
const saveStatus = document.getElementById('saveStatus');

const STORAGE_KEY = 'mini-notion-content';

// ============ 加载已保存内容 ============
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  editor.innerHTML = saved;
  setSaveStatus('saved', '已自动恢复');
} else {
  // 默认示例内容
  editor.innerHTML = `
    <h1>欢迎使用 Mini Notion</h1>
    <p>这是一个用原生 JS 实现的富文本编辑器。你可以：</p>
    <ul>
      <li><b>加粗</b>、<i>斜体</i>、<u>下划线</u> 文字</li>
      <li>使用快捷键快速格式化</li>
      <li>内容会自动保存到 localStorage</li>
    </ul>
    <blockquote>试试选中这段文字，然后点击工具栏按钮。</blockquote>
    <p>按 <code>Ctrl+S</code> 手动保存，或直接输入——会自动保存。</p>
  `;
}

// ============ 工具栏命令执行 ============
function execCmd(cmd, value = null) {
  editor.focus();
  // 恢复选区（点击工具栏会丢失选区）
  if (savedRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  if (cmd === 'createLink') {
    const url = prompt('请输入链接地址：', 'https://');
    if (!url) return;
    document.execCommand('createLink', false, url);
  } else if (cmd === 'insertCode') {
    // 行内代码：用 Selection API 包裹选区
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const code = document.createElement('code');
      code.appendChild(range.extractContents());
      range.insertNode(code);
      sel.removeAllRanges();
    }
  } else if (cmd === 'formatBlock') {
    document.execCommand('formatBlock', false, value);
  } else {
    document.execCommand(cmd, false, value);
  }

  updateToolbarState();
  triggerSave();
}

// ============ 保存选区（工具栏点击时恢复） ============
let savedRange = null;
editor.addEventListener('mouseup', saveSelection);
editor.addEventListener('keyup', saveSelection);

function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    savedRange = sel.getRangeAt(0).cloneRange();
  }
}

// 工具栏 mousedown 时保存选区（在 focus 转移前）
toolbar.addEventListener('mousedown', (e) => {
  saveSelection();
});

// ============ 工具栏按钮绑定 ============
toolbar.querySelectorAll('button[data-cmd]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const cmd = btn.dataset.cmd;
    const value = btn.dataset.value || null;
    execCmd(cmd, value);
  });
});

// ============ 工具栏状态同步 ============
function updateToolbarState() {
  toolbar.querySelectorAll('button[data-cmd]').forEach((btn) => {
    const cmd = btn.dataset.cmd;
    if (['bold', 'italic', 'underline', 'strikeThrough'].includes(cmd)) {
      try {
        btn.classList.toggle('active', document.queryCommandState(cmd));
      } catch (e) {}
    }
  });
}

editor.addEventListener('keyup', updateToolbarState);
editor.addEventListener('mouseup', updateToolbarState);

// ============ 快捷键 ============
editor.addEventListener('keydown', (e) => {
  const ctrl = e.ctrlKey || e.metaKey;

  // Ctrl+S 手动保存
  if (ctrl && e.key === 's') {
    e.preventDefault();
    saveNow();
    return;
  }

  // Ctrl+Shift+1 → H1, Ctrl+Shift+2 → H2, Ctrl+Shift+3 → H3
  if (ctrl && e.shiftKey && ['1', '2', '3'].includes(e.key)) {
    e.preventDefault();
    execCmd('formatBlock', 'h' + e.key);
    return;
  }

  // Ctrl+Shift+. → blockquote
  if (ctrl && e.shiftKey && e.key === '>') {
    e.preventDefault();
    execCmd('formatBlock', 'blockquote');
    return;
  }

  // Tab → 缩进（列表内）
  if (e.key === 'Tab') {
    e.preventDefault();
    document.execCommand(e.shiftKey ? 'outdent' : 'indent');
  }
});

// ============ 自动保存（防抖） ============
function setSaveStatus(type, text) {
  saveStatus.className = 'save-status ' + type;
  saveStatus.textContent = text;
}

const debouncedSave = debounce(() => {
  const html = editor.innerHTML;
  localStorage.setItem(STORAGE_KEY, html);
  setSaveStatus('saved', '已自动保存 ' + new Date().toLocaleTimeString('zh-CN', { hour12: false }));
}, 800);

function triggerSave() {
  setSaveStatus('saving', '保存中...');
  debouncedSave();
}

function saveNow() {
  localStorage.setItem(STORAGE_KEY, editor.innerHTML);
  debouncedSave.cancel();
  setSaveStatus('saved', '已保存 ' + new Date().toLocaleTimeString('zh-CN', { hour12: false }));
}

// 防抖工具函数（内联，不依赖外部文件）
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 输入时触发自动保存
editor.addEventListener('input', triggerSave);

// 离开页面前保存
window.addEventListener('beforeunload', () => {
  localStorage.setItem(STORAGE_KEY, editor.innerHTML);
});

// 粘贴时清除多余格式（粘贴为纯文本可选）
editor.addEventListener('paste', (e) => {
  // 允许正常粘贴，但可以在这里做清理
  // 如需纯文本粘贴：e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
});
