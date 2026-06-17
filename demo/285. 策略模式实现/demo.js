// 285. 策略模式实现

const priceStrategies = {
  normal: (p) => p,
  discount: (p) => p * 0.8,
  vip: (p) => p * 0.6,
};
function calculatePrice(price, strategy) {
  return priceStrategies[strategy](price);
}
console.log(calculatePrice(100, "vip"));
