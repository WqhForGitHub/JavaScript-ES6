const first = () => (new Promise((resolve, reject) => {
    console.log(3);
    let p = new Promise((resolve, reject) => {
        console.log(7);
        setTimeout(() => {
            console.log(5);   // 加入宏任务队列   
            resolve(6);
            console.log(p)
        }, 0)
        resolve(1);     // 加入微任务队列 1
    });
    resolve(2);  // 加入微任务队列 2
    p.then((arg) => {
        console.log(arg);
    });
}));


first().then((arg) => {
    console.log(arg);
});
console.log(4);


//  3 => 7 => 4 => 1 => 2 => 5 => Promise{<resolved>:1}