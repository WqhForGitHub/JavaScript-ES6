/**
 * 手写浏览器本地存储封装（支持过期时间）
 *
 * 封装 localStorage / sessionStorage，支持：
 *   - 设置过期时间
 *   - JSON 自动序列化/反序列化
 *   - 命名空间前缀
 *   - 统一的 API
 *
 * 存储格式：{ value: 数据, expire: 过期时间戳 }
 *
 * 注意：本文件需要在浏览器环境中运行（localStorage）。
 */

/**
 * 本地存储封装类
 * @param {Object} [options]
 * @param {string} [options.prefix=''] - key 前缀
 * @param {Storage} [options.storage=localStorage] - 存储类型
 */
function StorageWrapper(options) {
  options = options || {};
  this.prefix = options.prefix || '';
  this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
}

/**
 * 获取完整 key
 */
StorageWrapper.prototype._getKey = function (key) {
  return this.prefix + key;
};

/**
 * 设置存储
 * @param {string} key - 键名
 * @param {*} value - 值
 * @param {number} [expire] - 过期时间（毫秒），不传则永久
 */
StorageWrapper.prototype.set = function (key, value, expire) {
  if (!this.storage) return false;
  var data = {
    value: value,
    expire: expire ? Date.now() + expire : null,
  };
  try {
    this.storage.setItem(this._getKey(key), JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('存储失败：', e);
    return false;
  }
};

/**
 * 获取存储
 * @param {string} key - 键名
 * @param {*} [defaultValue] - 默认值
 * @returns {*} 存储的值或默认值
 */
StorageWrapper.prototype.get = function (key, defaultValue) {
  if (!this.storage) return defaultValue;
  var raw = this.storage.getItem(this._getKey(key));
  if (!raw) return defaultValue;

  try {
    var data = JSON.parse(raw);
    // 检查是否过期
    if (data.expire && Date.now() > data.expire) {
      this.storage.removeItem(this._getKey(key));
      return defaultValue;
    }
    return data.value;
  } catch (e) {
    // 不是 JSON 格式，直接返回
    return raw;
  }
};

/**
 * 移除指定键
 * @param {string} key
 */
StorageWrapper.prototype.remove = function (key) {
  if (!this.storage) return;
  this.storage.removeItem(this._getKey(key));
};

/**
 * 清除所有（仅清除当前前缀的）
 */
StorageWrapper.prototype.clear = function () {
  if (!this.storage) return;
  if (!this.prefix) {
    this.storage.clear();
    return;
  }
  var keysToRemove = [];
  for (var i = 0; i < this.storage.length; i++) {
    var k = this.storage.key(i);
    if (k && k.indexOf(this.prefix) === 0) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(function (k) { this.storage.removeItem(k); }.bind(this));
};

/**
 * 判断键是否存在且未过期
 * @param {string} key
 * @returns {boolean}
 */
StorageWrapper.prototype.has = function (key) {
  var value = this.get(key, undefined);
  return value !== undefined;
};

/**
 * 获取所有键（当前前缀）
 * @returns {string[]}
 */
StorageWrapper.prototype.keys = function () {
  if (!this.storage) return [];
  var result = [];
  for (var i = 0; i < this.storage.length; i++) {
    var k = this.storage.key(i);
    if (k && k.indexOf(this.prefix) === 0) {
      var shortKey = k.slice(this.prefix.length);
      // 检查是否过期
      if (this.has(shortKey)) {
        result.push(shortKey);
      }
    }
  }
  return result;
};

// ===== 测试用例（需浏览器环境） =====
// var store = new StorageWrapper({ prefix: 'myapp_', storage: localStorage });
// store.set('user', { name: '张三', age: 20 });
// console.log(store.get('user')); // => { name: '张三', age: 20 }
//
// store.set('token', 'abc123', 1000); // 1秒后过期
// console.log(store.get('token')); // => 'abc123'
// setTimeout(function () {
//   console.log(store.get('token')); // => undefined（已过期）
// }, 1100);
//
// store.remove('user');
// console.log(store.has('user')); // => false

// 模拟测试：用内存对象模拟 localStorage
var mockStorage = {
  _data: {},
  getItem: function (k) { return this._data[k] || null; },
  setItem: function (k, v) { this._data[k] = String(v); },
  removeItem: function (k) { delete this._data[k]; },
  key: function (i) { return Object.keys(this._data)[i]; },
  get length() { return Object.keys(this._data).length; },
  clear: function () { this._data = {}; },
};

var store = new StorageWrapper({ prefix: 'test_', storage: mockStorage });
store.set('name', 'hello');
console.log(store.get('name')); // => 'hello'

store.set('temp', 'value', 50);
console.log(store.get('temp')); // => 'value'
// 模拟过期
var data = JSON.parse(mockStorage._data['test_temp']);
data.expire = Date.now() - 1;
mockStorage._data['test_temp'] = JSON.stringify(data);
console.log(store.get('temp', 'default')); // => 'default'（已过期）

store.set('a', 1);
store.set('b', 2);
console.log(store.keys()); // => ['name', 'a', 'b']
store.clear();
console.log(store.keys()); // => []
