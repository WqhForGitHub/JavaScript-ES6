async function runAsync() {
  await promiseFunc();
  console.log("async");
  return "async result";
}

async function promiseFunc() {
  return new Promise((resolve, reject) => {
    console.log("promise");
    reject("error");
  });
}

runAsync().then((res) => console.log(res));
