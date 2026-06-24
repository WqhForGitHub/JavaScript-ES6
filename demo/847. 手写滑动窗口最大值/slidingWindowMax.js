/**
 * 手写滑动窗口最大值
 * 功能：O(n) 求每个大小为 k 的窗口的最大值
 * 实现：单调递减双端队列
 */
function maxSlidingWindow(nums, k) {
  const deque = []; const result = [];
  for (let i = 0; i < nums.length; i++) {
    while (deque.length && deque[0] <= i - k) deque.shift();
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}
// ===== 测试 =====
console.log(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)); // [3,3,5,5,6,7]
console.log(maxSlidingWindow([1,2,3,4,5], 3)); // [3,4,5]
console.log(maxSlidingWindow([5,4,3,2,1], 3)); // [5,4,3]
