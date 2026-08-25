// 第05章：策略模式 - 表单验证

// ========== 验证策略对象 ==========
const strategies = {
  isNonEmpty: function (value, errorMsg) {
    if (value === "") {
      return errorMsg;
    }
  },
  minLength: function (value, length, errorMsg) {
    if (value.length < length) {
      return errorMsg;
    }
  },
  isMobile: function (value, errorMsg) {
    if (!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
      return errorMsg;
    }
  },
};

// ========== Validator 类 ==========
const Validator = function () {
  this.cache = []; // 保存校验规则
};

Validator.prototype.add = function (value, rules) {
  const self = this;
  for (var i = 0, rule; (rule = rules[i++]); ) {
    (function (rule) {
      const strategyAry = rule.strategy.split(":");
      const errorMsg = rule.errorMsg;
      self.cache.push(function () {
        const strategy = strategyAry.shift();
        strategyAry.unshift(value);
        strategyAry.push(errorMsg);
        return strategies[strategy].apply(value, strategyAry);
      });
    })(rule);
  }
};

Validator.prototype.start = function () {
  for (var i = 0, validatorFunc; (validatorFunc = this.cache[i++]); ) {
    const errorMsg = validatorFunc();
    if (errorMsg) {
      return errorMsg;
    }
  }
};

// ========== 模拟表单验证 ==========
console.log("===== 策略模式 - 表单验证 =====");

// 模拟表单数据
const formData = {
  userName: "",
  password: "12",
  phoneNumber: "12345678901",
};

// 测试1：空用户名
console.log("\n--- 测试1：空用户名 ---");
const validator1 = new Validator();
validator1.add(formData.userName, [
  { strategy: "isNonEmpty", errorMsg: "用户名不能为空" },
  { strategy: "minLength:6", errorMsg: "用户名长度不能少于6位" },
]);
const errorMsg1 = validator1.start();
console.log("验证结果：", errorMsg1 || "验证通过"); // 用户名不能为空

// 测试2：密码过短
console.log("\n--- 测试2：密码过短 ---");
const validator2 = new Validator();
validator2.add(formData.password, [
  { strategy: "isNonEmpty", errorMsg: "密码不能为空" },
  { strategy: "minLength:6", errorMsg: "密码长度不能少于6位" },
]);
const errorMsg2 = validator2.start();
console.log("验证结果：", errorMsg2 || "验证通过"); // 密码长度不能少于6位

// 测试3：手机号格式错误
console.log("\n--- 测试3：手机号格式错误 ---");
const validator3 = new Validator();
validator3.add(formData.phoneNumber, [
  { strategy: "isMobile", errorMsg: "手机号码格式不正确" },
]);
const errorMsg3 = validator3.start();
console.log("验证结果：", errorMsg3 || "验证通过"); // 手机号码格式不正确

// 测试4：全部通过
console.log("\n--- 测试4：全部通过 ---");
const validFormData = {
  userName: "zhangsan",
  password: "123456",
  phoneNumber: "13800138000",
};
const validator4 = new Validator();
validator4.add(validFormData.userName, [
  { strategy: "isNonEmpty", errorMsg: "用户名不能为空" },
  { strategy: "minLength:6", errorMsg: "用户名长度不能少于6位" },
]);
validator4.add(validFormData.password, [
  { strategy: "isNonEmpty", errorMsg: "密码不能为空" },
  { strategy: "minLength:6", errorMsg: "密码长度不能少于6位" },
]);
validator4.add(validFormData.phoneNumber, [
  { strategy: "isMobile", errorMsg: "手机号码格式不正确" },
]);
const errorMsg4 = validator4.start();
console.log("验证结果：", errorMsg4 || "验证通过"); // 验证通过
