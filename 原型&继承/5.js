function Dog() {
    this.name = 'puppy'
}
Dog.prototype.bark = () => {
    console.log('woof!woof!')
}
const dog = new Dog()
console.log(Dog.prototype.constructor === Dog && dog.constructor === Dog && dog instanceof Dog) // true
