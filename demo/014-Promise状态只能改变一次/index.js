const promise = new Promise((resolve, reject) => {
  resolve("succeed1");
  reject("error");
  resolve("succeed2");
});
promise
  .then((res) => {
    console.log("then: ", res);
  })
  .catch((err) => {
    console.log("catch: ", err);
  });
