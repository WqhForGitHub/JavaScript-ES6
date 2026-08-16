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

Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
