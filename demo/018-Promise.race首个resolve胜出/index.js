function runAsync(num) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(num, console.log(num)), 1000),
  );
}

Promise.race([runAsync(1), runAsync(2), runAsync(3)])
  .then((res) => console.log("res: ", res))
  .catch((err) => console.log(err));
