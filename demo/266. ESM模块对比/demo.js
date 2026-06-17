// 266. ESM模块对比

const commonJS = { exports: { value: 1 } };
const esm = Object.freeze({ default: "main", named: "value" });
console.log("CommonJS 可动态修改:", commonJS.exports);
console.log("ESM 更适合静态分析:", esm);
