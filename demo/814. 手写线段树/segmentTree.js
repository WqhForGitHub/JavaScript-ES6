/**
 * 手写线段树
 * 功能：区间查询（求和）+ 单点更新 + 区间更新（懒标记），O(logN)
 */
class SegmentTree {
  constructor(arr) { this.n = arr.length; this.data = [...arr]; this.tree = new Array(4 * arr.length); this.lazy = new Array(4 * arr.length).fill(0); this.build(1, 0, this.n - 1); }
  build(node, start, end) {
    if (start === end) { this.tree[node] = this.data[start]; return; }
    const mid = (start + end) >> 1;
    this.build(node * 2, start, mid); this.build(node * 2 + 1, mid + 1, end);
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }
  pushDown(node, start, end) {
    if (this.lazy[node]) {
      const mid = (start + end) >> 1;
      this.tree[node*2] += this.lazy[node] * (mid - start + 1);
      this.lazy[node*2] += this.lazy[node];
      this.tree[node*2+1] += this.lazy[node] * (end - mid);
      this.lazy[node*2+1] += this.lazy[node];
      this.lazy[node] = 0;
    }
  }
  update(node, start, end, idx, val) {
    if (start === end) { this.data[idx] = val; this.tree[node] = val; return; }
    this.pushDown(node, start, end);
    const mid = (start + end) >> 1;
    if (idx <= mid) this.update(node * 2, start, mid, idx, val);
    else this.update(node * 2 + 1, mid + 1, end, idx, val);
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }
  updateRange(node, start, end, l, r, val) {
    if (r < start || l > end) return;
    if (l <= start && end <= r) { this.tree[node] += (end - start + 1) * val; this.lazy[node] += val; return; }
    this.pushDown(node, start, end);
    const mid = (start + end) >> 1;
    this.updateRange(node*2, start, mid, l, r, val); this.updateRange(node*2+1, mid+1, end, l, r, val);
    this.tree[node] = this.tree[node*2] + this.tree[node*2+1];
  }
  query(node, start, end, l, r) {
    if (r < start || l > end) return 0;
    if (l <= start && end <= r) return this.tree[node];
    this.pushDown(node, start, end);
    const mid = (start + end) >> 1;
    return this.query(node * 2, start, mid, l, r) + this.query(node * 2 + 1, mid + 1, end, l, r);
  }
}
// ===== 测试 =====
const st = new SegmentTree([1, 3, 5, 7, 9, 11]);
console.log('区间和 [1,3]:', st.query(1, 0, st.n - 1, 1, 3)); // 15
st.update(1, 0, st.n - 1, 1, 10);
console.log('更新后 [1,3]:', st.query(1, 0, st.n - 1, 1, 3)); // 22
st.updateRange(1, 0, st.n - 1, 0, 2, 10);
console.log('区间更新后 [0,5]:', st.query(1, 0, st.n - 1, 0, 5)); // 70
