// 224. location跳转器

const locationHelper = {
  parse(url) {
    const u = new URL(url, 'https://example.com');
    return { path: u.pathname, query: u.search, hash: u.hash };
  },
  jump(url) {
    if (typeof location !== 'undefined') location.href = url;
  },
};
console.log(locationHelper.parse('/user?id=1#profile'));
