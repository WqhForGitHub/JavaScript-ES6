// async function async1() {
//     await async2();
//     console.log('async1');
//     return 'async1 success'
// }

// async function async2() {
//     return new Promise((resolve, reject) => {
//         console.log('async2')
//         reject('error')
//     })
// }
// async1().then(res => console.log(res))




async function async3() {
    await Promise.reject('error!!!').catch(e => console.log(e))
    console.log('async1');
    return Promise.resolve('async1 success')
}
async3().then(res => console.log(res))
console.log('script start')
