async function runAsync() {
  await asyncFunc();
  console.log("async");
  return "async result";
}

async function asyncFunc() {
  console.log("do something");
}

console.log("main start");
setTimeout(function () {
  console.log("timer");
}, 0);
runAsync();
new Promise((resolve) => {
  console.log("promise");
  resolve();
}).then(function () {
  console.log("promise then");
});
console.log("main end");
