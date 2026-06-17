// 232. 无限滚动加载

function createInfiniteLoader(loadMore, threshold = 100) {
  return function () {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;
    const d =
      document.documentElement.scrollHeight -
      window.innerHeight -
      window.scrollY;
    if (d < threshold) loadMore();
  };
}
createInfiniteLoader(() => console.log("load more"))();
