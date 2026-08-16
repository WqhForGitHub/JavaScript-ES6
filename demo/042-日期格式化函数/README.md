# 042 - 日期格式化函数

> 实现类似 `formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')` 的函数。

## 方式一：占位符替换版

```js
function formatDate(date, pattern = 'yyyy-MM-dd hh:mm:ss') {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const pad = (n) => String(n).padStart(2, '0'); // 补零

  const config = {
    yyyy: date.getFullYear(), // 年
    MM: pad(date.getMonth() + 1), // 月（0-11，需 +1）
    dd: pad(date.getDate()), // 日
    hh: pad(date.getHours()), // 时
    mm: pad(date.getMinutes()), // 分
    ss: pad(date.getSeconds()), // 秒
    SSS: String(date.getMilliseconds()).padStart(3, '0'), // 毫秒
    w: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()], // 星期
  };

  return pattern.replace(/yyyy|MM|dd|hh|mm|ss|SSS|w/g, (match) => config[match]);
}

// 测试
const now = new Date('2026-08-16T10:08:30.123');
console.log(formatDate(now)); // 2026-08-16 10:08:30
console.log(formatDate(now, 'yyyy/MM/dd')); // 2026/08/16
console.log(formatDate(now, 'yyyy年MM月dd日 星期w')); // 2026年08月16日 星期日
console.log(formatDate(now, 'hh:mm:ss.SSS')); // 10:08:30.123
console.log(formatDate('2026-01-05', 'yyyy-MM-dd')); // 2026-01-05（支持字符串入参）
```

## 方式二：方法式调用（day.js 风格）

```js
class DateFormatter {
  constructor(date = new Date()) {
    this.date = date instanceof Date ? date : new Date(date);
  }
  pad(n) {
    return String(n).padStart(2, '0');
  }
  year() {
    return this.date.getFullYear();
  }
  month() {
    return this.pad(this.date.getMonth() + 1);
  }
  day() {
    return this.pad(this.date.getDate());
  }
  hours() {
    return this.pad(this.date.getHours());
  }
  minutes() {
    return this.pad(this.date.getMinutes());
  }
  seconds() {
    return this.pad(this.date.getSeconds());
  }
  format(pattern = 'yyyy-MM-dd') {
    const full = {
      yyyy: this.year(),
      MM: this.month(),
      dd: this.day(),
      hh: this.hours(),
      mm: this.minutes(),
      ss: this.seconds(),
    };
    return Object.entries(full).reduce((str, [key, value]) => str.replace(key, value), pattern);
  }
}

console.log(new DateFormatter().format('yyyy-MM-dd hh:mm:ss')); // 当前时间
console.log(new DateFormatter('2026-08-16').format('yyyy/MM/dd')); // 2026/08/16
```

## 扩展：相对时间格式化

```js
function formatRelativeTime(input) {
  const date = input instanceof Date ? input : new Date(input);
  const diff = Date.now() - date.getTime(); // 时间差（毫秒）

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < month) return `${Math.floor(diff / day)} 天前`;
  if (diff < year) return `${Math.floor(diff / month)} 个月前`;
  return `${Math.floor(diff / year)} 年前`;
}

console.log(formatRelativeTime(Date.now() - 5000)); // 刚刚
console.log(formatRelativeTime(Date.now() - 3 * hour)); // 3 小时前
```
