/**
 * VirtualList - 虚拟列表实现
 * 核心思想：只渲染可视区域内的元素 + 上下缓冲区
 * 用一个高 spacer 撑开滚动条，根据 scrollTop 计算应该显示哪些项
 */
class VirtualList {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container 滚动容器
   * @param {number} options.itemHeight 每项高度
   * @param {number} options.bufferSize 上下缓冲项数
   * @param {function} options.renderItem 渲染单项的函数 (item, index) => HTMLElement
   */
  constructor(options) {
    this.container = options.container;
    this.itemHeight = options.itemHeight || 80;
    this.bufferSize = options.bufferSize || 5;
    this.renderItem = options.renderItem;
    this.items = [];
    this.enabled = false;

    // 内部内容容器
    this.content = document.createElement('div');
    this.content.style.position = 'relative';
    this.content.style.width = '100%';
  }

  setItems(items) {
    this.items = items;
    if (this.enabled) this.update();
  }

  enable() {
    this.enabled = true;
    // 替换容器内容为虚拟列表结构
    this.container.innerHTML = '';
    this.container.appendChild(this.content);
    this._onScroll = () => this.update();
    this.container.addEventListener('scroll', this._onScroll, { passive: true });
    this.update();
  }

  disable() {
    this.enabled = false;
    if (this._onScroll) {
      this.container.removeEventListener('scroll', this._onScroll);
    }
    this.content.innerHTML = '';
    this.content.style.height = '';
  }

  update() {
    if (!this.enabled || this.items.length === 0) return;

    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight;

    // 计算可视范围
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
    const visibleCount = Math.ceil(viewportHeight / this.itemHeight) + this.bufferSize * 2;
    const endIndex = Math.min(this.items.length, startIndex + visibleCount);

    // 设置总高度撑出滚动条
    const totalHeight = this.items.length * this.itemHeight;
    this.content.style.height = totalHeight + 'px';

    // 渲染可视项
    this.content.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
      const el = this.renderItem(this.items[i], i);
      el.style.position = 'absolute';
      el.style.top = (i * this.itemHeight) + 'px';
      el.style.width = '100%';
      el.style.height = this.itemHeight + 'px';
      el.style.boxSizing = 'border-box';
      this.content.appendChild(el);
    }

    // 回调通知
    if (this.onUpdate) {
      this.onUpdate({ startIndex, endIndex, renderedCount: endIndex - startIndex });
    }
  }

  scrollToIndex(index) {
    this.container.scrollTop = index * this.itemHeight;
  }
}
