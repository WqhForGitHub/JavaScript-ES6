// 125. 类实例检测器

class Book {}
const book = new Book();
console.log(book instanceof Book);
console.log({} instanceof Book);
