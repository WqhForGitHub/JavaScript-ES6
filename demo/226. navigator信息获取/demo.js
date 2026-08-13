// 226. navigator信息获取

function getNavigatorInfo() {
  if (typeof navigator === 'undefined') return { runtime: 'non-browser' };
  return {
    language: navigator.language,
    online: navigator.onLine,
    userAgent: navigator.userAgent,
  };
}
console.log(getNavigatorInfo());
