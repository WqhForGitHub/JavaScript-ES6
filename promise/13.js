// Promise.resolve('1').then(res => {
//     console.log(res)
// }).finally(() => {
//     console.log('finally')
// })

// Promise.resolve('2').finally(() => {
//     console.log('finally2')
//     return '我是finally2的返回值'
// }).then(res => {
//     console.log('finally2后面的then函数', res)
// })



// new Promise(resolve => {
//     console.log(1);
//     resolve()
// }).then(()=>{
//     console.log(3);
// }).then(()=>{
//     console.log(5);
// }).then(()=>{
//     console.log(7);
// }).then(()=>{
//     console.log(9);
// })

// new Promise(resolve => {
//     console.log(2);
//     resolve()
// }).finally(()=>{
//     console.log(4);
// }).then(()=>{
//     console.log(10);
// })

new Promise(resolve => {
    console.log(1);
    resolve()
}).then(()=>{
    console.log(3);
}).then(()=>{
    console.log(5);
}).then(()=>{
    console.log(7);
}).then(()=>{
    console.log(9);
})

new Promise(resolve => {
    console.log(2);
    resolve()
}).then(()=>{
    console.log(4);
}).finally(()=>{
    console.log(6);
}).then(()=>{
    console.log(10);
})
