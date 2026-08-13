// 100. arguments转数组

function collect() {
  console.log(Array.from(arguments));
  console.log([...arguments]);
}
collect(1, 'a', true);
