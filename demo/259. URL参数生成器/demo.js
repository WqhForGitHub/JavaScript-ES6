// 259. URL参数生成器

function buildQuery(params) {
  return new URLSearchParams(params).toString();
}
console.log(buildQuery({ page: 1, keyword: 'JavaScript' }));
