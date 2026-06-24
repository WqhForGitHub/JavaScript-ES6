/**
 * 手写 String.prototype[Symbol.iterator]
 *
 * 字符串的迭代器按 Unicode 码位顺序逐个返回字符。
 * 注意：原生字符串迭代器能正确处理代理对（surrogate pairs，如 emoji），
 * 返回完整的码位而非单个 UTF-16 code unit。
 * 这里手写实现，支持基本的码位遍历（处理代理对）。
 */

// 手写字符串迭代器（处理代理对）
function createStringIterator(str) {
  var index = 0;
  var length = str.length;
  return {
    next: function () {
      if (index >= length) {
        return { value: undefined, done: true };
      }
      var charCode = str.charCodeAt(index);
      // 判断是否为高代理项（0xD800 - 0xDBFF）
      if (charCode >= 0xD800 && charCode <= 0xDBFF && index + 1 < length) {
        var nextCode = str.charCodeAt(index + 1);
        // 判断下一个是否为低代理项（0xDC00 - 0xDFFF）
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          // 组合成完整的码位
          var codePoint = 0x10000 + ((charCode - 0xD800) << 10) + (nextCode - 0xDC00);
          var char = String.fromCodePoint(codePoint);
          index += 2;
          return { value: char, done: false };
        }
      }
      // 普通字符
      var ch = str.charAt(index);
      index += 1;
      return { value: ch, done: false };
    }
  };
}

// 手写 String.prototype[Symbol.iterator]
function myStringIterator() {
  return createStringIterator(String(this));
}

// 测试 1：基本字符串
console.log('--- Basic string ---');
var it = createStringIterator('abc');
console.log(it.next().value); // a
console.log(it.next().value); // b
console.log(it.next().value); // c
console.log(it.next().done);  // true

// 测试 2：for...of 使用自定义迭代器
console.log('--- for...of ---');
function makeIterable(str) {
  return {
    [Symbol.iterator]: function () { return createStringIterator(str); }
  };
}
var chars = [];
for (var c of makeIterable('hello')) chars.push(c);
console.log(chars); // ['h', 'e', 'l', 'l', 'o']

// 测试 3：展开和解构
console.log('--- Spread & Destructure ---');
console.log([...makeIterable('XYZ')]); // ['X', 'Y', 'Z']
var [first, second] = makeIterable('AB');
console.log(first, second); // A B

// 测试 4：处理 emoji（代理对）
console.log('--- Emoji (surrogate pairs) ---');
var emojiStr = 'a\uD83D\uDE00b'; // a😀b
var emojiIt = createStringIterator(emojiStr);
console.log(emojiIt.next().value); // a
console.log(emojiIt.next().value); // 😀（完整 emoji，而非拆开的代理对）
console.log(emojiIt.next().value); // b
console.log(emojiIt.next().done);  // true

// 对比：使用 charAt 会拆开代理对
console.log('--- charAt vs iterator ---');
console.log(emojiStr.charAt(1)); // \uD83D（高代理项的一半）
var emojiChars = [...makeIterable(emojiStr)];
console.log(emojiChars.length); // 3（a, 😀, b）
console.log(emojiChars); // ['a', '😀', 'b']

// 测试 5：空字符串
console.log('--- Empty string ---');
var emptyIt = createStringIterator('');
console.log(emptyIt.next().done); // true

// 测试 6：与原生对比
console.log('--- Compare with native ---');
var nativeChars = [];
for (var c of 'hello') nativeChars.push(c);
var myChars = [...makeIterable('hello')];
console.log(JSON.stringify(nativeChars) === JSON.stringify(myChars)); // true

var nativeEmoji = [];
for (var c of emojiStr) nativeEmoji.push(c);
var myEmoji = [...makeIterable(emojiStr)];
console.log(JSON.stringify(nativeEmoji) === JSON.stringify(myEmoji)); // true
