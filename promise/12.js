Promise.reject('err!!!').then((res) => {
    console.log('success', res)
}, (err) => {
    console.log('error', err)
}).catch(err => {
    console.log('catch', err)
})


Promise.resolve().then(function success(res) {
    throw new Error('error!!!')
}, function fail1(err) {
    console.log('fail', err)
}).catch(function fail2(err) {
    console.log('fail2', err)
})