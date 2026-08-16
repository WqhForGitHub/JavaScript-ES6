const promiseWrapper = () =>
  new Promise((resolve, reject) => {
    console.log("A");
    let p = new Promise((resolve, reject) => {
      console.log("B");
      setTimeout(() => {
        console.log("timer start");
        resolve("timer succeed");
        console.log("timer end");
      }, 0);
      resolve("inner succeed");
    });
    resolve("outer succeed");
    p.then((res) => {
      console.log(res);
    });
  });

promiseWrapper().then((res) => {
  console.log(res);
});
console.log(4);
