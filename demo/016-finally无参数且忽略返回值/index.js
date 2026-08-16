Promise.resolve("A")
  .then((res) => {
    console.log("promise1", res);
  })
  .finally(() => {
    console.log("finally1");
  });
Promise.resolve("B")
  .finally(() => {
    console.log("finally2");
    return "result";
  })
  .then((res) => {
    console.log("promise2", res);
  });
