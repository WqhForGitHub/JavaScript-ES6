/**
 * Mini React - 极简版 React 实现
 * 实现：createElement / render / diff / 状态更新（useState）
 *
 * 核心概念：
 * 1. Virtual DOM：用普通 JS 对象描述 UI 结构
 * 2. render：将 vdom 转为真实 DOM
 * 3. diff：对比新旧 vdom，最小化更新真实 DOM
 * 4. hooks：用闭包 + 全局指针实现 useState
 */

// ============ 1. createElement：创建虚拟 DOM ============
// 等价于 React.createElement
// 返回一个 vdom 对象：{ type, props, children }
function createElement(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children
      .flat()
      .filter(c => c !== null && c !== undefined && c !== false)
      .map(c => (typeof c === 'object' ? c : createTextElement(c))),
  };
}

// 文本节点用特殊 type 标记
function createTextElement(text) {
  return { type: 'TEXT_ELEMENT', props: { nodeValue: String(text) }, children: [] };
}

// 便捷别名 h = createElement
const h = createElement;

// ============ 2. render：vdom → 真实 DOM ============
function createDom(vdom) {
  const dom =
    vdom.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(vdom.type);

  // 设置属性
  Object.keys(vdom.props).forEach(key => {
    updateDomProperty(dom, key, {}, vdom.props);
  });

  // 递归创建子节点
  vdom.children.forEach(child => {
    dom.appendChild(createDom(child));
  });

  return dom;
}

// 更新单个 DOM 属性
function updateDomProperty(dom, key, prevProps, nextProps) {
  // 事件属性
  if (key.startsWith('on')) {
    const eventType = key.toLowerCase().substring(2);
    if (prevProps[key]) dom.removeEventListener(eventType, prevProps[key]);
    if (nextProps[key]) dom.addEventListener(eventType, nextProps[key]);
    return;
  }
  // style 对象
  if (key === 'style') {
    const prev = prevProps.style || {};
    const next = nextProps.style || {};
    Object.keys(prev).forEach(k => {
      if (!next[k]) dom.style[k] = '';
    });
    Object.keys(next).forEach(k => {
      dom.style[k] = next[k];
    });
    return;
  }
  // className
  if (key === 'className') {
    dom.className = nextProps[key] || '';
    return;
  }
  // 普通属性
  if (!(key in nextProps)) {
    dom.removeAttribute(key);
  } else {
    dom.setAttribute(key, nextProps[key]);
  }
}

// ============ 3. Component：函数组件支持 ============
let currentFiber = null; // 当前正在渲染的 fiber
let hookIndex = 0;

// 全局状态：当前应用的根
let _container = null;
let _rootVdom = null;

function render(vdom, container) {
  _container = container;
  _rootVdom = vdom;
  const dom = mountVdom(vdom);
  container.innerHTML = '';
  container.appendChild(dom);
}

// 挂载 vdom（处理函数组件）
function mountVdom(vdom) {
  if (typeof vdom.type === 'function') {
    // 函数组件
    currentFiber = vdom;
    hookIndex = 0;
    vdom.hooks = vdom.hooks || [];
    const childVdom = vdom.type(vdom.props);
    vdom.child = childVdom;
    const dom = mountVdom(childVdom);
    vdom.dom = dom;
    return dom;
  }
  const dom = createDom(vdom);
  vdom.dom = dom;
  return dom;
}

// ============ 4. useState Hook ============
function useState(initialValue) {
  const fiber = currentFiber;
  const index = hookIndex;
  hookIndex++;

  // 初始化
  if (fiber.hooks[index] === undefined) {
    fiber.hooks[index] =
      typeof initialValue === 'function' ? initialValue() : initialValue;
  }

  const setState = newValue => {
    const val =
      typeof newValue === 'function' ? newValue(fiber.hooks[index]) : newValue;
    if (Object.is(val, fiber.hooks[index])) return;
    fiber.hooks[index] = val;
    scheduleRerender(fiber);
  };

  return [fiber.hooks[index], setState];
}

// ============ 5. 重新渲染调度 ============
let rerenderScheduled = false;
function scheduleRerender() {
  if (rerenderScheduled) return;
  rerenderScheduled = true;
  // 用 microtask 保证批量更新
  Promise.resolve().then(() => {
    rerenderScheduled = false;
    rerender();
  });
}

function rerender() {
  const oldVdom = _rootVdom;
  const newVdom = oldVdom; // 复用同一函数组件 vdom（hooks 保存在它身上）
  const dom = patchVdom(newVdom, oldVdom, _container.firstChild);
  if (_container.firstChild !== dom) {
    _container.innerHTML = '';
    _container.appendChild(dom);
  }
}

// ============ 6. diff / patch 算法 ============
function patchVdom(newVdom, oldVdom, existingDom) {
  // type 不同 → 直接替换
  if (!newVdom || newVdom.type !== oldVdom.type) {
    if (existingDom && existingDom.parentNode) existingDom.remove();
    return newVdom ? mountVdom(newVdom) : null;
  }

  // 函数组件
  if (typeof newVdom.type === 'function') {
    newVdom.hooks = oldVdom.hooks; // 继承 hooks
    currentFiber = newVdom;
    hookIndex = 0;
    const childVdom = newVdom.type(newVdom.props);
    newVdom.child = childVdom;
    const dom = patchVdom(childVdom, oldVdom.child, oldVdom.dom);
    newVdom.dom = dom;
    return dom;
  }

  // 原生元素：更新属性
  const dom = existingDom;
  Object.keys({ ...oldVdom.props, ...newVdom.props }).forEach(key => {
    if (oldVdom.props[key] !== newVdom.props[key]) {
      updateDomProperty(dom, key, oldVdom.props, newVdom.props);
    }
  });

  // diff 子节点
  patchChildren(dom, oldVdom.children, newVdom.children);
  newVdom.dom = dom;
  return dom;
}

// 子节点 diff（key-based 简化版）
function patchChildren(parentDom, oldChildren, newChildren) {
  const oldKeyMap = {};
  oldChildren.forEach((c, i) => {
    const key = c.props.key !== undefined ? c.props.key : i;
    oldKeyMap[key] = c;
  });

  const usedOld = new Set();

  newChildren.forEach((newChild, i) => {
    const key = newChild.props.key !== undefined ? newChild.props.key : i;
    const oldChild = oldKeyMap[key];
    if (oldChild && oldChild.type === newChild.type) {
      usedOld.add(key);
      // 复用 + 更新
      patchVdom(newChild, oldChild, oldChild.dom);
    } else {
      // 新增
      const newDom = mountVdom(newChild);
      const refChild = parentDom.childNodes[i] || null;
      parentDom.insertBefore(newDom, refChild);
    }
  });

  // 移除多余旧节点
  oldChildren.forEach((c, i) => {
    const key = c.props.key !== undefined ? c.props.key : i;
    if (!usedOld.has(key) && c.dom) {
      c.dom.remove();
    }
  });

  // 确保顺序正确
  newChildren.forEach((child, i) => {
    const ref = parentDom.childNodes[i];
    if (child.dom && child.dom !== ref) {
      parentDom.insertBefore(child.dom, ref || null);
    }
  });
}

// ============ 导出 ============
const MiniReact = { createElement, render, useState, h };
