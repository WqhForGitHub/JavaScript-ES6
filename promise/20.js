async function async1() {
    console.log('async1 start')

    await new Promise(resolve => {
        console.log('promise1')
    })

    console.log('async1 success')

    return 'async1 end'
}

console.log('script start')

async1().then(res => console.log(res))

console.log('script end')


// script start => async1 start => promise1 => script end