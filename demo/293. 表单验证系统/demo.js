// 293. 表单验证系统

const validators = {
  required: (v) => v !== undefined && v !== '',
  minLength: (n) => (v) => String(v).length >= n,
};
function validate(value, rules) {
  return rules.every((rule) => rule(value));
}
console.log(validate('abc', [validators.required, validators.minLength(2)]));
