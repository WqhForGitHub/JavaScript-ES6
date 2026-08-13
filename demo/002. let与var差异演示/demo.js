// 2. let与var差异演示

for (var i = 0; i < 3; i++) setTimeout(() => console.log('var:', i), 0);
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let:', j), 0);
console.log('var leaks:', i);
console.log('let leaks:', typeof j);
