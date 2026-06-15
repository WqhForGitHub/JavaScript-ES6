async function async1() {
    console.log('async1 start')

    await new Promise(resolve => {
        console.log('promise1')
        resolve('promise1 resolve')
    }).then(res => console.log(res))

    console.log("async1 success")
    return 'async1 end'
}

console.log('script start')
async1().then(res => console.log(res))
console.log("script end")
