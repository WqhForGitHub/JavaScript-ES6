Promise.resolve("A")
  .then((res) => {
    console.log(res);
    return "B";
  })
  .catch((err) => {
    return "C";
  })
  .then((res) => {
    console.log(res);
  });
