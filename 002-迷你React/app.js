/**
 * Mini React 示例应用
 * 用 MiniReact 的 API 编写组件，验证 createElement / render / diff / useState
 */
const { createElement: h, render, useState } = MiniReact;

// ============ 计数器组件 ============
function Counter() {
  const [count, setCount] = useState(0);

  return h(
    'div',
    { className: 'counter-box' },
    h('div', { className: 'counter-value' }, count),
    h(
      'div',
      { className: 'buttons' },
      h(
        'button',
        {
          className: 'btn btn-dec',
          onClick: () => setCount((c) => c - 1),
        },
        '-'
      ),
      h(
        'button',
        {
          className: 'btn btn-inc',
          onClick: () => setCount((c) => c + 1),
        },
        '+'
      )
    )
  );
}

// ============ Todo 组件 ============
function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 Mini React', done: true },
    { id: 2, text: '理解 diff 算法', done: false },
  ]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos((t) => [...t, { id: Date.now(), text: input.trim(), done: false }]);
    setInput('');
  };

  const toggle = (id) => {
    setTodos((t) => t.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  };

  const remove = (id) => {
    setTodos((t) => t.filter((todo) => todo.id !== id));
  };

  const todoElements = todos.map((todo) =>
    h(
      'div',
      {
        key: todo.id,
        className: 'todo-item' + (todo.done ? ' done' : ''),
      },
      h('input', {
        type: 'checkbox',
        checked: todo.done,
        onChange: () => toggle(todo.id),
      }),
      h('span', {}, todo.text),
      h('button', { onClick: () => remove(todo.id) }, '删除')
    )
  );

  return h(
    'div',
    { className: 'todo-section' },
    h('h2', {}, 'Mini React Todo'),
    h(
      'div',
      { className: 'todo-input-row' },
      h('input', {
        type: 'text',
        value: input,
        placeholder: '输入待办...',
        onInput: (e) => setInput(e.target.value),
        onKeyDown: (e) => {
          if (e.key === 'Enter') addTodo();
        },
      }),
      h('button', { className: 'btn-add', onClick: addTodo }, '添加')
    ),
    ...todoElements
  );
}

// ============ 根组件 ============
function App() {
  return h('div', {}, h(Counter), h(TodoApp));
}

// ============ 首次渲染 ============
render(h(App), document.getElementById('root'));
