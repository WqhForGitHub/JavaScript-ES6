// 106. 深层属性安全访问

const data = { user: { profile: { name: "Alice" } } };
console.log(data.user?.profile?.name);
console.log(data.order?.items?.[0]?.name ?? "no item");
