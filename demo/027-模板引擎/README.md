# 027 - 实现一个简单的模板引擎

> 模板引擎的核心：把模板字符串中的占位符（如 `{{ name }}`）替换为数据。

## 方式一：简单字符串替换

```js
function render(tpl, data) {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => data[key] ?? '');
}

const tpl = '你好，我是 {{ name }}，今年 {{ age }} 岁';
console.log(render(tpl, { name: '张三', age: 18 }));
// 你好，我是 张三，今年 18 岁
```

## 方式二：支持嵌套属性（{{ user.name }}）

```js
function render(tpl, data) {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    // 按点号逐层取值
    return (
      path
        .split('.')
        .reduce((obj, key) => (obj == null ? '' : obj[key]), data) ?? ''
    );
  });
}

const tpl2 = '<div>{{ user.name }} - {{ user.address.city }}</div>';
console.log(render(tpl2, { user: { name: '张三', address: { city: '北京' } } }));
// <div>张三 - 北京</div>
```

## 方式三：with + Function 编译版（类 vue/underscore 原理）

```js
function compile(tpl) {
  // 把 {{ expr }} 转成字符串拼接，再交给 Function 执行
  const code = tpl
    .replace(/<%=([\s\S]+?)%>/g, (_, expr) => `');\n__out__ += (${expr});\n__out__ +=('`)
    .replace(/\{\{([\s\S]+?)\}\}/g, (_, expr) => `');\n__out__ += String((${expr}));\n__out__ +=('`);

  const fn = new Function(
    'data',
    `
    with (data) {
      let __out__ = '';
      __out__ += ('${code}');
      return __out__;
    }
  `
  );

  return fn;
}

// 使用：支持任意 JS 表达式
const tpl3 = `
  <ul>
    <% users %>
  </ul>
`;
const tpl4 = '你好 {{ user.name.toUpperCase() }}，共有 {{ users.length }} 个用户';
const renderFn = compile(tpl4);

console.log(
  renderFn({ user: { name: 'zhangsan' }, users: [1, 2, 3] })
);
// 你好 ZHANGSAN，共有 3 个用户
```

> 原理：`with(data)` 把对象属性暴露为局部作用域变量，
> `new Function` 动态生成拼接函数。实际模板引擎（如 underscore.template）
> 还会处理循环 `<% %>`、条件、HTML 转义、缓存等。

## 扩展：HTML 转义防 XSS

```js
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
}

function renderSafe(tpl, data) {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    const value = path.split('.').reduce((o, k) => (o == null ? '' : o[k]), data);
    return escapeHtml(value ?? '');
  });
}

console.log(renderSafe('{{ content }}', { content: '<script>alert(1)</script>' }));
// &lt;script&gt;alert(1)&lt;/script&gt;
```
