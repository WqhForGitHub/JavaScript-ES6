var createIframe = (function () {
  var iframe;
  return function () {
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }
    return iframe;
  };
})();

var getSingle = function (fn) {
  var result;
  return function () {
    return result || (result = fn.apply(this, arguments));
  };
};

var createLoginLayer = function () {
  var div = document.createElement("div");
  div.innerHTML = "我是登录浮窗";
  div.style.display = "none";
  document.body.appendChild(div);
  return div;
};

var createSingleLoginLayer = getSingle(createLoginLayer);

document.getElementById("loginBtn").onclick = function () {
  var loginLayer = createSingleLoginLayer();
  loginLayer.style.display = "block";
};

var createSingleIframe = getSingle(function () {
  var iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  return iframe;
});

document.getElementById("loginBtn").onclick = function () {
  var loginLayer = createSingleIframe();
  loginLayer.src = "http://baidu.com";
};

var bindEvent = getSingle(function () {
  document.getElementById("div1").addEventListener = function () {
    alert("click");
  };
  return true;
});

var render = function () {
  console.log("开始渲染列表");
  bindEvent();
};

render();
render();
render();
