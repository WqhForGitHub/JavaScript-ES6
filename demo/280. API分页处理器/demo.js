// 280. API分页处理器

function paginate(list, page = 1, size = 10) {
  const start = (page - 1) * size;
  return {
    page,
    size,
    total: list.length,
    records: list.slice(start, start + size),
  };
}
console.log(paginate([1, 2, 3, 4, 5], 2, 2));
