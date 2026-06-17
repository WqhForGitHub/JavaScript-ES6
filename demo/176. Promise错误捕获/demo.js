// 176. Promise错误捕获

Promise.resolve()
  .then(() => {
    throw new Error("failed");
  })
  .catch((err) => console.log(err.message))
  .finally(() => console.log("finally"));
