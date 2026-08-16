async function runAsync() {
  console.log("async start");
  await new Promise((resolve) => {
    console.log("promise");
  });
  console.log("async end");
  return "async result";
}
console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
