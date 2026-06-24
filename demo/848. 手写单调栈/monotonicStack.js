/**
 * 手写单调栈
 * 功能：找每个元素左右第一个比它大/小的元素
 * 应用：每日温度、柱状图最大矩形
 */
// 找每个元素右边第一个比它大的元素
function nextGreaterElement(arr) {
  const stack = []; const result = new Array(arr.length).fill(-1);
  for (let i = 0; i < arr.length; i++) {
    while (stack.length && arr[stack[stack.length - 1]] < arr[i]) { result[stack.pop()] = arr[i]; }
    stack.push(i);
  }
  return result;
}
// 找每个元素右边第一个比它小的元素
function nextSmallerElement(arr) {
  const stack = []; const result = new Array(arr.length).fill(-1);
  for (let i = 0; i < arr.length; i++) {
    while (stack.length && arr[stack[stack.length - 1]] > arr[i]) { result[stack.pop()] = arr[i]; }
    stack.push(i);
  }
  return result;
}
// 柱状图最大矩形
function largestRectangleArea(heights) {
  const stack = []; let maxArea = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] > h) {
      const height = heights[stack.pop()]; const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }
  return maxArea;
}
// ===== 测试 =====
console.log('下一个更大元素:', nextGreaterElement([2,1,2,4,3])); // [4,2,4,-1,-1]
console.log('下一个更小元素:', nextSmallerElement([2,1,2,4,3])); // [1,-1,-1,3,-1]
console.log('最大矩形:', largestRectangleArea([2,1,5,6,2,3])); // 10
