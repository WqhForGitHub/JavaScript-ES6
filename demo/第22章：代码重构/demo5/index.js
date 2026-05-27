// ============================================================
// 拆分循环 & 替换算法
// 1. 一个循环做多件事时，拆成多个独立循环（清晰度大幅提升）
// 2. 用更清晰、更高效的算法替换现有的复杂或低效算法
// ============================================================

// ============================================================
// 一、拆分循环
// ============================================================

var people = [
  { age: 25, salary: 8000 },
  { age: 32, salary: 12000 },
  { age: 28, salary: 9500 },
  { age: 45, salary: 20000 },
  { age: 19, salary: 5000 },
];

// ---------- 重构前 ----------
// 一个循环同时做两件事：找最年轻的人和计算总薪水
var youngestBefore = people[0].age;
var totalSalaryBefore = 0;

for (var i = 0; i < people.length; i++) {
  if (people[i].age < youngestBefore) {
    youngestBefore = people[i].age;
  }
  totalSalaryBefore += people[i].salary;
}

console.log("重构前 - 最年轻: " + youngestBefore + ", 总薪水: " + totalSalaryBefore);

// ---------- 重构后 ----------
// 拆成两个独立的循环，每个循环只做一件事
var getYoungestAge = function (arr) {
  var youngest = arr[0].age;
  for (var i = 1; i < arr.length; i++) {
    if (arr[i].age < youngest) {
      youngest = arr[i].age;
    }
  }
  return youngest;
};

var getTotalSalary = function (arr) {
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    total += arr[i].salary;
  }
  return total;
};

var youngestAfter = getYoungestAge(people);
var totalSalaryAfter = getTotalSalary(people);

console.log("重构后 - 最年轻: " + youngestAfter + ", 总薪水: " + totalSalaryAfter);

// ============================================================
// 二、替换算法
// ============================================================

// ---------- 重构前 ----------
// 用一连串 if-else 查找国家对应的大洲
var getContinentBefore = function (country) {
  if (country === "中国" || country === "日本" || country === "韩国") {
    return "亚洲";
  } else if (country === "美国" || country === "加拿大" || country === "墨西哥") {
    return "北美洲";
  } else if (country === "巴西" || country === "阿根廷") {
    return "南美洲";
  } else if (country === "英国" || country === "法国" || country === "德国") {
    return "欧洲";
  } else if (country === "澳大利亚" || country === "新西兰") {
    return "大洋洲";
  } else {
    return "未知";
  }
};

console.log("重构前 - 中国: " + getContinentBefore("中国"));
console.log("重构前 - 法国: " + getContinentBefore("法国"));

// ---------- 重构后 ----------
// 用查找表（对象映射）替换复杂的条件分支，更清晰且易于维护
var COUNTRY_TO_CONTINENT = {
  "中国": "亚洲",
  "日本": "亚洲",
  "韩国": "亚洲",
  "美国": "北美洲",
  "加拿大": "北美洲",
  "墨西哥": "北美洲",
  "巴西": "南美洲",
  "阿根廷": "南美洲",
  "英国": "欧洲",
  "法国": "欧洲",
  "德国": "欧洲",
  "澳大利亚": "大洋洲",
  "新西兰": "大洋洲",
};

var getContinentAfter = function (country) {
  return COUNTRY_TO_CONTINENT[country] || "未知";
};

console.log("重构后 - 中国: " + getContinentAfter("中国"));
console.log("重构后 - 法国: " + getContinentAfter("法国"));
console.log("重构后 - 埃及: " + getContinentAfter("埃及"));  // 未知
