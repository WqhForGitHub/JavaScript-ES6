// 124. class getter／setter

class Temperature {
  set celsius(v) {
    this._c = v;
  }
  get fahrenheit() {
    return (this._c * 9) / 5 + 32;
  }
}
const t = new Temperature();
t.celsius = 20;
console.log(t.fahrenheit);
