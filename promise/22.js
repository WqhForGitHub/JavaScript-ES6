async function async1() {
    console.log("async1 start");
    await async2();
    console.log("async1 end"); // 放入微任务队列 1
}

async function async2() {
    console.log("async2");
}

console.log("script start");

setTimeout(function () {
    console.log("setTimeout");   // 放入宏任务队列 1
}, 0);

async1();

new Promise(resolve => {
    console.log("promise1");
    resolve();  // 放入微任务队列 2
}).then(function () {
    console.log("promise2");
});
console.log('script end')


// script start => async1 start => async2 => promise1 => script end =>  async1 end => promise2 => setTimeout