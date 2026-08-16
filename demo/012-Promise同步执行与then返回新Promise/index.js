const newPromise1 = new Promise((resolve, reject) => {
  console.log("A");
  resolve("B");
});
const newPromise2 = newPromise1.then((res) => {
  console.log(res);
});
console.log("C", newPromise1);
console.log("D", newPromise2);
