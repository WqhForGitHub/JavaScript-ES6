/**
 * Todo Pro - 状态驱动版
 * 核心：集中式状态管理 + 不可变更新 + 简化 DOM diff + undo/redo + localStorage
 */

// ============ 状态管理层 ============
const STORAGE_KEY = 'todo-pro-state';

// 历史栈，用于 undo/redo
const history = {
  past: [],
  future: [],
};

function createInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    todos: [],
    filter: 'all', // all | active | completed
    category: 'all', // all | default | work | life | study
    nextId: 1,
  };
}

let state = createInitialState();

// 持久化到 localStorage
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * commit: 执行一次状态更新
 * 将当前 state 推入 past 栈，清空 future，然后用 updater 产生新 state
 */
function commit(updater) {
  history.past.push(JSON.parse(JSON.stringify(state)));
  if (history.past.length > 50) history.past.shift(); // 限制历史栈大小
  history.future = [];
  state = updater(state);
  persist();
  render();
}

// ============ Actions（不可变更新） ============
const actions = {
  add(text, category, tags) {
    if (!text.trim()) return;
    commit((s) => ({
      ...s,
      nextId: s.nextId + 1,
      todos: [
        ...s.todos,
        {
          id: s.nextId,
          text: text.trim(),
          category: category || 'default',
          tags: tags || [],
          completed: false,
          createdAt: Date.now(),
        },
      ],
    }));
  },

  toggle(id) {
    commit((s) => ({
      ...s,
      todos: s.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  },

  remove(id) {
    commit((s) => ({
      ...s,
      todos: s.todos.filter((t) => t.id !== id),
    }));
  },

  update(id, text) {
    commit((s) => ({
      ...s,
      todos: s.todos.map((t) => (t.id === id ? { ...t, text: text.trim() } : t)),
    }));
  },

  setFilter(filter) {
    commit((s) => ({ ...s, filter }));
  },

  setCategory(category) {
    commit((s) => ({ ...s, category }));
  },

  undo() {
    if (history.past.length === 0) return;
    history.future.push(JSON.parse(JSON.stringify(state)));
    state = history.past.pop();
    persist();
    render();
  },

  redo() {
    if (history.future.length === 0) return;
    history.past.push(JSON.parse(JSON.stringify(state)));
    state = history.future.pop();
    persist();
    render();
  },
};

// ============ 派生数据（selector） ============
function getVisibleTodos() {
  return state.todos.filter((t) => {
    if (state.filter === 'active' && t.completed) return false;
    if (state.filter === 'completed' && !t.completed) return false;
    if (state.category !== 'all' && t.category !== state.category) return false;
    return true;
  });
}

// ============ 简化 DOM diff 渲染 ============
const listEl = document.getElementById('todoList');
let renderedIds = []; // 记录上次渲染的 id 列表，用于 diff

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', () => actions.toggle(todo.id));

  const content = document.createElement('div');
  content.className = 'todo-content';

  const textSpan = document.createElement('span');
  textSpan.className = 'todo-text';
  textSpan.textContent = todo.text;
  textSpan.addEventListener('dblclick', () => startEdit(textSpan, todo));

  const meta = document.createElement('div');
  meta.className = 'todo-meta';

  const catBadge = document.createElement('span');
  catBadge.className = 'category-badge ' + todo.category;
  catBadge.textContent = todo.category;
  meta.appendChild(catBadge);

  todo.tags.forEach((tag) => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag';
    tagEl.textContent = '#' + tag;
    meta.appendChild(tagEl);
  });

  content.appendChild(textSpan);
  content.appendChild(meta);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'todo-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-edit';
  editBtn.textContent = '编辑';
  editBtn.addEventListener('click', () => startEdit(textSpan, todo));

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-delete';
  delBtn.textContent = '删除';
  delBtn.addEventListener('click', () => actions.remove(todo.id));

  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(delBtn);

  li.appendChild(checkbox);
  li.appendChild(content);
  li.appendChild(actionsDiv);
  return li;
}

function startEdit(span, todo) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = todo.text;
  input.className = 'todo-text editing';
  input.style.fontSize = '15px';
  input.style.border = 'none';
  input.style.width = '100%';
  span.replaceWith(input);
  input.focus();
  input.select();

  const finish = () => {
    if (input.value.trim()) {
      actions.update(todo.id, input.value);
    } else {
      render();
    }
  };

  input.addEventListener('blur', finish);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish();
    if (e.key === 'Escape') render();
  });
}

/**
 * 简化 DOM diff：对比新旧 id 列表
 * - 复用已存在的 DOM 节点（更新内容）
 * - 增删差异节点
 * 减少 innerHTML 全量重绘带来的事件监听器丢失
 */
function render() {
  const visible = getVisibleTodos();
  const newIds = visible.map((t) => t.id);

  // 移除被删除的节点
  const existing = new Map();
  listEl.querySelectorAll('.todo-item').forEach((el) => {
    const id = Number(el.dataset.id);
    if (newIds.includes(id)) {
      existing.set(id, el);
    } else {
      el.remove();
    }
  });

  // 按新顺序重新排列/创建
  visible.forEach((todo, index) => {
    let el = existing.get(todo.id);
    if (el) {
      // 更新已有节点
      el.className = 'todo-item' + (todo.completed ? ' completed' : '');
      const cb = el.querySelector('.todo-checkbox');
      if (cb) cb.checked = todo.completed;
      const text = el.querySelector('.todo-text');
      if (text && text.textContent !== todo.text) text.textContent = todo.text;
    } else {
      // 创建新节点
      el = createTodoElement(todo);
    }
    // 确保顺序正确
    const refChild = listEl.children[index] || null;
    if (el !== refChild) {
      listEl.insertBefore(el, refChild);
    }
  });

  renderedIds = newIds;

  // 空状态
  const existingEmpty = listEl.querySelector('.empty');
  if (visible.length === 0) {
    if (!existingEmpty) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = '暂无待办事项';
      listEl.appendChild(empty);
    }
  } else if (existingEmpty) {
    existingEmpty.remove();
  }

  // 更新计数
  const total = state.todos.length;
  const done = state.todos.filter((t) => t.completed).length;
  document.getElementById('counter').textContent = `${done} / ${total} 已完成`;

  // 更新 undo/redo 按钮状态
  document.getElementById('undoBtn').disabled = history.past.length === 0;
  document.getElementById('redoBtn').disabled = history.future.length === 0;

  // 更新筛选按钮
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === state.filter);
  });
}

// ============ 事件绑定 ============
document.getElementById('addBtn').addEventListener('click', () => {
  const text = document.getElementById('todoInput').value;
  const category = document.getElementById('categorySelect').value;
  const tagsStr = document.getElementById('tagInput').value;
  const tags = tagsStr
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  actions.add(text, category, tags);
  document.getElementById('todoInput').value = '';
  document.getElementById('tagInput').value = '';
  document.getElementById('todoInput').focus();
});

document.getElementById('todoInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('addBtn').click();
});

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => actions.setFilter(btn.dataset.filter));
});

document.getElementById('filterCategory').addEventListener('change', (e) => {
  actions.setCategory(e.target.value);
});

document.getElementById('undoBtn').addEventListener('click', () => actions.undo());
document.getElementById('redoBtn').addEventListener('click', () => actions.redo());

// 快捷键
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    actions.undo();
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
    e.preventDefault();
    actions.redo();
  }
});

// 初始化渲染
render();
