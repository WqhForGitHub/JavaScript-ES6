const newPromise = new Promise((resolve, reject) => {
  console.log("A");
  setTimeout(() => {
    console.log("timer start");
    resolve("succeed");
    console.log("timer end");
  }, 0);
  console.log("B");
});
newPromise.then((result) => {
  console.log(result);
});
console.log("C");
