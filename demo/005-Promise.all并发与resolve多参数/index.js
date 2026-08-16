function runAsync(num) {
  return new Promise((r) => setTimeout(() => r(num, console.log(num)), 1000));
}

Promise.all([runAsync(1), runAsync(2), runAsync(3)]).then((res) =>
  console.log(res),
);
