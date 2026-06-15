const p1 = new Promise((resolve) => {
    setTimeout(() => {
        resolve('resolve3');        // 宏任务队列 1 
        console.log('timer1')
    }, 0)
    resolve('resovle1'); // 放入微任务队列
    resolve('resolve2');
}).then(res => {
    console.log(res)  // resolve1
    setTimeout(() => {
        console.log(p1)     // 宏任务队列 2
    }, 1000)
}).finally(res => {
    console.log('finally', res)
})


// resovle1 => finally undefined => timer1 => Promise {<resolved>: undefined}