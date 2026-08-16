const runAsync = async () => {
  console.log("async start");
  setTimeout(() => {
    console.log("inner timer");
  }, 2000);
  await new Promise((resolve) => {
    console.log("promise");
  });
  console.log("async end");
  return "async result";
};

console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
Promise.resolve("A")
  .then("then")
  .then(Promise.resolve("succeed"))
  .catch("catch")
  .then((res) => console.log(res));
setTimeout(() => {
  console.log("outer timer");
}, 1000);
