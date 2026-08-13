// 90. 可枚举属性检测器

const obj = { visible: 1 };
Object.defineProperty(obj, 'hidden', { value: 2, enumerable: false });
console.log(Object.keys(obj));
console.log(obj.propertyIsEnumerable('visible'));
console.log(obj.propertyIsEnumerable('hidden'));
