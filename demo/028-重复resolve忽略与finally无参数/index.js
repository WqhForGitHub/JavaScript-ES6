const myPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve("succeed3");
    console.log("timer");
  }, 0);
  resolve("succeed1");
  resolve("succeed2");
})
  .then((res) => {
    console.log(res);
    setTimeout(() => {
      console.log(myPromise);
    }, 1000);
  })
  .finally((res) => {
    console.log("finally", res);
  });
