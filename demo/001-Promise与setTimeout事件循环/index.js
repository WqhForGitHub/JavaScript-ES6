Promise.resolve().then(() => {
  console.log("outerPromise");
  const innerTimer = setTimeout(() => {
    console.log("innerTimer");
  }, 0);
});

const timer1 = setTimeout(() => {
  console.log("outerTimer");
  Promise.resolve().then(() => {
    console.log("innerPromise");
  });
}, 0);
console.log("run");
