// 日志 / 审计代理
function withAudit(target, log = []) {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      log.push(`READ ${prop}`);
      return Reflect.get(obj, prop, receiver);
    },
    set(obj, prop, value, receiver) {
      log.push(`WRITE ${prop} = ${value}`);
      return Reflect.set(obj, prop, value, receiver);
    },
  });
}

const user = withAudit({ name: "Ada", age: 36 });

user.name;      // READ name
user.age = 37;  // WRITE age = 37

console.log(user);