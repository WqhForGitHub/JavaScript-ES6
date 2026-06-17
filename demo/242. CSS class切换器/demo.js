// 242. CSS class切换器

function createClassToggler(el, className) {
  return {
    on: () => el.classList.add(className),
    off: () => el.classList.remove(className),
    toggle: () => el.classList.toggle(className),
  };
}
console.log("createClassToggler ready");
