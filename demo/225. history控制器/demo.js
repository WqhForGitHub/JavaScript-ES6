// 225. history控制器

const historyController = {
  push(path, state = {}) {
    if (typeof history !== 'undefined') history.pushState(state, '', path);
  },
  replace(path, state = {}) {
    if (typeof history !== 'undefined') history.replaceState(state, '', path);
  },
};
console.log('history controller ready');
