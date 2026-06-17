// 233. 图片懒加载

function lazyLoadImages(images) {
  if (typeof IntersectionObserver === "undefined") return;
  const ob = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.src = e.target.dataset.src;
        ob.unobserve(e.target);
      }
    });
  });
  images.forEach((img) => ob.observe(img));
}
console.log("lazyLoadImages ready");
