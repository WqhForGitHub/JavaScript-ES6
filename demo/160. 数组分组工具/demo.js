// 160. 数组分组工具

function groupBy(arr, key) {
  return arr.reduce((map, item) => ((map[item[key]] ||= []).push(item), map), {});
}
console.log(groupBy([{ type: 'fruit' }, { type: 'tool' }, { type: 'fruit' }], 'type'));
