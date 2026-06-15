window.number = 2;
var obj = {
    number: 3,
    db1: (function () {
        console.log(this) // window
        this.number *= 4;
        console.log('this.number: ', this.number);
        return function () {
            console.log(this) // obj
            this.number *= 5;
        }
    })()
}

var db1 = obj.db1;
db1(); // this 指向 window
obj.db1();
console.log(obj.number) // 15
console.log(window.number) // 40