// var a = 10
// var obj = {
//     a: 20,
//     say: () => {
//         console.log(this.a) // 10
//     }
// }
// obj.say()

// var anotherObj = { a: 30 }
// obj.say.apply(anotherObj)  // 10


var a = 10;
var obj = {
    a: 20,
    say() {
        console.log(this.a) // 20
    }
}

obj.say();
var anotherObj = {
    a: 30
}

obj.say.apply(anotherObj) // 30
