# 016 - 字符串中不重复字符的最长子串长度

> LeetCode 第 3 题。示例：`"abcabcbb"` -> 3（`abc`）；`"bbbbb"` -> 1（`b`）；`"pwwkew"` -> 3（`wke`）。

## 方式一：滑动窗口 + Set

```js
function lengthOfLongestSubstring(s) {
  const set = new Set();
  let max = 0;
  let left = 0; // 窗口左边界

  for (let right = 0; right < s.length; right++) {
    // 出现重复字符时，不断收缩左边界
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    max = Math.max(max, right - left + 1);
  }
  return max;
}

console.log(lengthOfLongestSubstring('abcabcbb')); // 3
console.log(lengthOfLongestSubstring('bbbbb')); // 1
console.log(lengthOfLongestSubstring('pwwkew')); // 3
console.log(lengthOfLongestSubstring('')); // 0
```

时间复杂度 O(n)，空间复杂度 O(charset)。

## 方式二：滑动窗口 + Map（记录字符下标，左边界直接跳跃）

```js
function lengthOfLongestSubstring(s) {
  const map = new Map(); // 字符 -> 最近一次出现的下标
  let max = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    // 如果字符出现过且在当前窗口内，左边界直接跳到重复字符的下一位
    if (map.has(ch) && map.get(ch) >= left) {
      left = map.get(ch) + 1;
    }
    map.set(ch, right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}

console.log(lengthOfLongestSubstring('abba')); // 2
```

> 注意 `abba` 这个用例：第二个 `a` 的下标虽然记录过，但已经不在窗口内，
> 因此必须判断 `map.get(ch) >= left` 才能移动左边界。

## 扩展：返回最长不重复子串本身

```js
function longestSubstring(s) {
  const map = new Map();
  let left = 0;
  let start = 0;
  let max = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (map.has(ch) && map.get(ch) >= left) {
      left = map.get(ch) + 1;
    }
    map.set(ch, right);
    if (right - left + 1 > max) {
      max = right - left + 1;
      start = left;
    }
  }
  return s.slice(start, start + max);
}

console.log(longestSubstring('abcabcbb')); // 'abc'
console.log(longestSubstring('pwwkew')); // 'wke'
```
