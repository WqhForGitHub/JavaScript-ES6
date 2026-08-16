```javascript
Promise.resolve("A").then("B").then(Promise.resolve("C")).then(console.log);
```

```javascript
const newPromise1 = new Promise((resolve, reject) => {
  console.log("A");
  resolve("B");
});
const newPromise2 = newPromise1.then((res) => {
  console.log(res);
});
console.log("C", newPromise1);
console.log("D", newPromise2);
```

```javascript
const newPromise = new Promise((resolve, reject) => {
  console.log("A");
  setTimeout(() => {
    console.log("timer start");
    resolve("succeed");
    console.log("timer end");
  }, 0);
  console.log("B");
});
newPromise.then((result) => {
  console.log(result);
});
console.log("C");
```

```javascript
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
```

```javascript
Promise.resolve()
  .then(() => {
    return new Error("error");
  })
  .then((res) => {
    console.log("then: ", res);
  })
  .catch((err) => {
    console.log("catch: ", err);
  });
```

```javascript
Promise.resolve("A")
  .then((res) => {
    console.log("promise1", res);
  })
  .finally(() => {
    console.log("finally1");
  });
Promise.resolve("B")
  .finally(() => {
    console.log("finally2");
    return "result";
  })
  .then((res) => {
    console.log("promise2", res);
  });
```

```javascript
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
```

```javascript
function runAsync(num) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(num, console.log(num)), 1000),
  );
}

Promise.race([runAsync(1), runAsync(2), runAsync(3)])
  .then((res) => console.log("res: ", res))
  .catch((err) => console.log(err));
```

```javascript
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
```

```javascript
async function runAsync() {
  console.log("runAsync start");
  await asyncFunc();
  console.log("runAsync end");
}

async function asyncFunc() {
  console.log("do something");
}

runAsync();
console.log("start");
```

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log("async1 timer");
  }, 0);
}

async function async2() {
  console.log("async2 start");
  setTimeout(() => {
    console.log("async2 timer");
  }, 0);
  console.log("async2 end");
}

async1();
setTimeout(() => {
  console.log("outer timer");
}, 0);
console.log("run");
```

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log("async1 timer");
  }, 0);
}

async function async2() {
  console.log("async2 start");
  setTimeout(() => {
    console.log("async2 timer");
  }, 0);
  console.log("async2 end");
}

async1();
setTimeout(() => {
  console.log("outer timer");
}, 0);
console.log("run");
```

```javascript
async function runAsync() {
  console.log("async start");
  await new Promise((resolve) => {
    console.log("promise");
  });
  console.log("async end");
  return "async result";
}
console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
```

```javascript
async function runAsync() {
  console.log("async start");
  await new Promise((resolve) => {
    console.log("promise");
    resolve("promise resolve");
  }).then((res) => console.log(res));
  console.log("async end");
  return "async result";
}
console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
```

```javascript
async function runAsync() {
  console.log("async start");
  await new Promise((resolve) => {
    console.log("promise");
    resolve("promise resolve");
  }).then((res) => console.log(res));
  console.log("async end");
  return "async result";
}
console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
```

```javascript
async function runAsync() {
  console.log("async start");
  await asyncFunc();
  console.log("async end");
}

async function asyncFunc() {
  console.log("do something");
}

console.log("main start");
setTimeout(function () {
  console.log("timer");
}, 0);
runAsync();
new Promise((resolve) => {
  console.log("promise");
  resolve();
}).then(function () {
  console.log("promise then");
});
console.log("main end");
```

```javascript
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
```

```javascript
const promiseWrapper = () =>
  new Promise((resolve, reject) => {
    console.log("A");
    let p = new Promise((resolve, reject) => {
      console.log("B");
      setTimeout(() => {
        console.log("timer start");
        resolve("timer succeed");
        console.log("timer end");
      }, 0);
      resolve("inner succeed");
    });
    resolve("outer succeed");
    p.then((res) => {
      console.log(res);
    });
  });

promiseWrapper().then((res) => {
  console.log(res);
});
console.log(4);
```

```javascript
const runAsync = async () => {
  console.log("async start");
  setTimeout(() => {
    console.log("inner timer");
  }, 2000);
  await new Promise((resolve) => {
    console.log("promise");
  });
  console.log("async end");
  return "async result";
};

console.log("main start");
runAsync().then((res) => console.log(res));
console.log("main end");
Promise.resolve("A")
  .then("then")
  .then(Promise.resolve("succeed"))
  .catch("catch")
  .then((res) => console.log(res));
setTimeout(() => {
  console.log("outer timer");
}, 1000);
```

```javascript
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
```
