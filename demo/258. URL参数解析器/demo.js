// 258. URL参数解析器

function parseQuery(url) {
  const params = new URL(url, 'https://example.com').searchParams;
  return Object.fromEntries(params.entries());
}
console.log(parseQuery('/list?page=1&size=10'));
