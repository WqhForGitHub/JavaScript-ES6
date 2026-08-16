async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log("async1 timer");
  }, 0);
}

async function async2() {
  console.log("async2 start");
  setTimeout(() => {
    console.log("async2 timer");
  }, 0);
  console.log("async2 end");
}

async1();
setTimeout(() => {
  console.log("outer timer");
}, 0);
console.log("run");
