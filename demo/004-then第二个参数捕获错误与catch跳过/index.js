Promise.reject("error")
  .then(
    (res) => {
      console.log("succeed", res);
    },
    (err) => {
      console.log("innerError", err);
    },
  )
  .catch((err) => {
    console.log("catch", err);
  });
