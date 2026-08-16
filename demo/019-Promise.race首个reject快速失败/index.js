function runAsync(num) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(num, console.log(num)), 1000),
  );
}

function runReject(num) {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(`Error: ${num}`, console.log(num)), 1000 * num),
  );
}

Promise.race([runReject(0), runAsync(1), runAsync(2), runAsync(3)])
  .then((res) => console.log("res: ", res))
  .catch((err) => console.log(err));
