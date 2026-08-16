# 015 - 查找文章中出现频率最高的单词

## 实现思路

1. 将文章统一转为小写；
2. 用正则提取所有单词（去除标点）；
3. 用 `Map` 统计每个单词出现的次数；
4. 遍历 `Map` 找出次数最多的单词。

## 代码实现

```js
function findMostFrequentWord(article) {
  // 1. 转小写并提取单词（支持英文字母，可按需扩展正则）
  const words = article.toLowerCase().match(/[a-z]+/g) || [];

  // 2. 统计词频
  const wordCount = new Map();
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  // 3. 找出频率最高的单词
  let maxWord = '';
  let maxCount = 0;
  for (const [word, count] of wordCount) {
    if (count > maxCount) {
      maxWord = word;
      maxCount = count;
    }
  }

  return { word: maxWord, count: maxCount };
}

// 测试
const article = `
  The quick brown fox jumps over the lazy dog.
  The dog barks, and the fox runs away. The end.
`;

console.log(findMostFrequentWord(article)); // { word: 'the', count: 5 }
```

## 变体：返回 Top N 高频单词

```js
function findTopNWords(article, n = 3) {
  const words = article.toLowerCase().match(/[a-z]+/g) || [];
  const wordCount = new Map();
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }
  return [...wordCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

console.log(findTopNWords(article, 3));
// [['the', 5], ['fox', 2], ['dog', 2]]（次数相同的顺序不定）
```

## 变体：统计中文高频词（按逐字分词演示）

```js
function findMostFrequentChar(text) {
  const chars = text.match(/[\u4e00-\u9fa5]/g) || [];
  const count = new Map();
  for (const ch of chars) {
    count.set(ch, (count.get(ch) || 0) + 1);
  }
  let maxChar = '';
  let maxCount = 0;
  for (const [ch, c] of count) {
    if (c > maxCount) {
      maxChar = ch;
      maxCount = c;
    }
  }
  return { char: maxChar, count: maxCount };
}

console.log(findMostFrequentChar('你好呀你好我很好')); // { char: '好', count: 4 }
```
