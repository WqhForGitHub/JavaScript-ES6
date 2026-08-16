async function runAsync() {
  console.log("async start");
  await new Promise((resolve, reject) => {
    console.log("promise");
    resolve("promise resolve");
  }).then((res) => console.log(res));
  console.log("async end");
  return "async result";
}
console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
