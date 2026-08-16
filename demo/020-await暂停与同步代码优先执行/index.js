async function runAsync() {
  console.log("runAsync start");
  await asyncFunc();
  console.log("runAsync end");
}

async function asyncFunc() {
  console.log("do something");
}

runAsync();
console.log("start");
