# 004 - 下划线与驼峰相互转换

## 驼峰转下划线（camelCase -> camel_case）

```js
function camelToUnderline(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

console.log(camelToUnderline('firstName')); // first_name
console.log(camelToUnderline('getUserName')); // get_user_name
```

## 下划线转驼峰（camel_case -> camelCase）

```js
function underlineToCamel(str) {
  return str.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
}

console.log(underlineToCamel('first_name')); // firstName
console.log(underlineToCamel('get_user_name')); // getUserName
```

## 中划线转驼峰（kebab-case -> camelCase）

```js
function kebabToCamel(str) {
  return str.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());
}

console.log(kebabToCamel('first-name')); // firstName
```

## 通用封装：支持自定义分隔符

```js
/**
 * 命名风格转换
 * @param {string} str 待转换字符串
 * @param {'toCamel'|'toLine'} mode 转换模式
 * @param {string} sep 分隔符，默认 '-'
 */
function convertNaming(str, mode = 'toCamel', sep = '-') {
  const reg = new RegExp(`${sep}(\\w)`, 'g');
  if (mode === 'toCamel') {
    // 分隔符转驼峰：a-b-c -> aBC
    return str.replace(reg, (_, letter) => letter.toUpperCase());
  }
  // 驼峰转分隔符：aBC -> a-b-c
  const escaped = sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return str.replace(/([A-Z])/g, `${escaped}$1`).toLowerCase();
}

console.log(convertNaming('first_name', 'toCamel', '_')); // firstName
console.log(convertNaming('firstName', 'toLine', '_')); // first_name
console.log(convertNaming('get-element-by-id', 'toCamel')); // getElementById
console.log(convertNaming('getElementById', 'toLine')); // get-element-by-id
```

## 批量转换对象 key

```js
function convertKeys(obj, mode = 'toCamel', sep = '_') {
  const result = {};
  for (const key in obj) {
    const newKey = convertNaming(key, mode, sep);
    result[newKey] = obj[key];
  }
  return result;
}

console.log(convertKeys({ user_name: '张三', user_age: 18 }));
// { userName: '张三', userAge: 18 }
```
