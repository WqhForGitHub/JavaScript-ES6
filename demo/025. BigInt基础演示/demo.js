// 25. BigInt基础演示

const big = 9007199254740993n;
console.log(big + 2n);
console.log(big.toString());
try {
  console.log(big + 1);
} catch (error) {
  console.log(error.message);
}
