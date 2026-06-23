/**
 * EventBus - 发布订阅模式事件总线
 * 实现：on / emit / off / once
 *
 * 扩展能力：
 * - 通配符订阅 '*'
 * - 命名空间事件 'user:login'
 * - 异步 emit
 */
class EventBus {
  constructor() {
    // events: Map<string, Set<{ fn, once }>>
    this.events = new Map();
  }

  /**
   * 订阅事件
   * @param {string} event 事件名
   * @param {function} fn 回调函数
   * @returns {function} 取消订阅函数
   */
  on(event, fn) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    const handler = { fn, once: false };
    this.events.get(event).add(handler);

    // 返回取消订阅函数（方便链式调用 / 组件卸载时清理）
    return () => this.off(event, fn);
  }

  /**
   * 只订阅一次
   */
  once(event, fn) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    const handler = { fn, once: true };
    this.events.get(event).add(handler);
    return () => this.off(event, fn);
  }

  /**
   * 触发事件
   * @param {string} event 事件名
   * @param {...any} args 参数
   */
  emit(event, ...args) {
    // 精确匹配
    const handlers = this.events.get(event);
    if (handlers) {
      // 拷贝一份，避免 once 删除时遍历问题
      [...handlers].forEach(h => {
        h.fn(...args);
        if (h.once) handlers.delete(h);
      });
    }
    // 通配符 '*' 订阅所有事件
    const wildcard = this.events.get('*');
    if (wildcard) {
      [...wildcard].forEach(h => {
        h.fn(event, ...args);
        if (h.once) wildcard.delete(h);
      });
    }
  }

  /**
   * 取消订阅
   * @param {string} event 事件名
   * @param {function} [fn] 指定回调；不传则移除该事件全部订阅
   */
  off(event, fn) {
    if (!fn) {
      this.events.delete(event);
      return;
    }
    const handlers = this.events.get(event);
    if (handlers) {
      [...handlers].forEach(h => {
        if (h.fn === fn) handlers.delete(h);
      });
      if (handlers.size === 0) this.events.delete(event);
    }
  }

  /**
   * 清空所有事件
   */
  clear() {
    this.events.clear();
  }
}

// 导出单例 + 类
const bus = new EventBus();
