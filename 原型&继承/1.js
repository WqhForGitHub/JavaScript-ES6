function Person(name) {
    this.name = name
}
var p2 = new Person('king');
// console.log(p2.__proto__)  // Person.prototype
// console.log(p2.__proto__.__proto__) // Object.prototype
// console.log(p2.__proto__.__proto__.__proto__) // null
// console.log(p2.__proto__.__proto__.__proto__.__proto__) // null
// console.log(p2.__proto__.__proto__.__proto__.__proto__.__proto__) // null
console.log(p2.constructor) // Person
console.log(p2.prototype) 
console.log(Person.constructor) // Function
console.log(Person.prototype)
console.log(Person.prototype.constructor) 
console.log(Person.prototype.__proto__) // Object.prototype
console.log(Person.__proto__) // Function.prototype
console.log(Function.prototype.__proto__) // Object.prototype
console.log(Function.__proto__) // Function.prototype
console.log(Object.__proto__)
console.log(Object.prototype.__proto__)


