/**
 * 手写图片懒加载（IntersectionObserver）
 * Image lazy loading using IntersectionObserver.
 *
 * Approach:
 * - Register an IntersectionObserver that watches all `img[data-src]` elements.
 * - When an image enters the viewport (intersectionRatio > 0), copy `data-src`
 *   to `src`, remove the data attribute, and `unobserve` it so we don't reload.
 * - Provide a fallback that, when IntersectionObserver is unavailable, loads all
 *   images immediately (degrades gracefully).
 * - Returns a controller with `observe(el)`, `unobserve(el)`, `disconnect()`.
 *
 * Note: Browser environment required. In Node this file demonstrates the API;
 * running it will report the absence of IntersectionObserver.
 *
 * @param {{root?:Element, rootMargin?:string, threshold?:number|number[]}} opts
 * @returns {{observe:function, unobserve:function, disconnect:function}}
 */
function createImageLazyLoader(opts = {}) {
  const { root = null, rootMargin = "0px", threshold = 0.01 } = opts;

  if (typeof IntersectionObserver === "undefined") {
    console.warn(
      "[imageLazyLoad] IntersectionObserver not supported; loading all images directly.",
    );
    document &&
      document.querySelectorAll("img[data-src]").forEach((img) => {
        img.src = img.getAttribute("data-src");
        img.removeAttribute("data-src");
      });
    return { observe() {}, unobserve() {}, disconnect() {} };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute("data-src");
          if (src) {
            img.src = src;
            img.removeAttribute("data-src");
          }
          observer.unobserve(img);
        }
      });
    },
    { root, rootMargin, threshold },
  );

  return {
    observe(el) {
      observer.observe(el);
      return el;
    },
    unobserve(el) {
      observer.unobserve(el);
    },
    disconnect() {
      observer.disconnect();
    },
  };
}

// Convenience helper: auto observe every lazy image on the page.
function setupLazyImages(selector = "img[data-src]") {
  const loader = createImageLazyLoader();
  const imgs = document.querySelectorAll(selector);
  imgs.forEach((img) => loader.observe(img));
  return loader;
}

// ---------- Test cases (browser required) ----------
// Simulated expected behaviour:
//   <img data-src="a.jpg"> becomes <img src="a.jpg"> once scrolled into view.
if (typeof module !== "undefined" && module.exports) {
  console.log(
    "createImageLazyLoader is a factory:",
    typeof createImageLazyLoader === "function",
  );
  // expected: createImageLazyLoader is a factory: true
  console.log(
    "setupLazyImages is a function:",
    typeof setupLazyImages === "function",
  );
  // expected: setupLazyImages is a function: true
}

// In a browser:
// const loader = setupLazyImages();
// window.__lazyLoader = loader;
// expected: images load as they scroll into view.
