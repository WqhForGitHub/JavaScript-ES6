// 227. screen信息展示

function getScreenInfo() {
  if (typeof screen === 'undefined') return { message: '无 screen 对象' };
  return {
    width: screen.width,
    height: screen.height,
    availableWidth: screen.availWidth,
    availableHeight: screen.availHeight,
  };
}
console.log(getScreenInfo());
