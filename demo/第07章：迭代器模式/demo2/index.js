// 第07章：迭代器模式 - 迭代器模式应用

// ========== 中止迭代器 ==========
console.log('===== 中止迭代器 =====');

const each = function (ary, callback) {
  for (let i = 0, l = ary.length; i < l; i++) {
    if (callback(ary[i], i) === false) {
      break; // 如果 callback 返回 false，提前中止迭代
    }
  }
};

each([1, 2, 3, 4, 5], function (item, index) {
  if (item > 3) {
    console.log('遇到大于3的元素，中止迭代：', item);
    return false; // 中止迭代
  }
  console.log('当前元素：', item);
});
// 输出：当前元素：1，当前元素：2，当前元素：3，遇到大于3的元素，中止迭代：4

// ========== 迭代器模式应用：上传对象的选择 ==========
console.log('\n===== 迭代器模式应用：上传对象的选择 =====');

const getActiveUploadObj = function () {
  try {
    return new ActiveXObject('TXFTNActiveX.FTNUpload'); // IE 上传控件
  } catch (e) {
    return false;
  }
};

const getFlashUploadObj = function () {
  if (supportFlash()) {
    // 假设有 supportFlash 函数
    const str = '<object type="application/x-shockwave-flash"></object>';
    return str;
  }
  return false;
};

const getFormUploadObj = function () {
  const str = '<input name="file" type="file" class="ui-file" />';
  return str; // 表单上传总是可用
};

// 由于实际环境中没有 ActiveX 和 Flash，我们用模拟函数替代
const getActiveUploadObjMock = function () {
  console.log('尝试 ActiveX 上传...不支持');
  return false;
};

const getFlashUploadObjMock = function () {
  console.log('尝试 Flash 上传...不支持');
  return false;
};

const getFormUploadObjMock = function () {
  console.log('尝试表单上传...支持！');
  return '表单上传控件';
};

// 使用迭代器模式选择上传对象
const iteratorUploadObj = function () {
  const uploadObjs = [
    getActiveUploadObjMock,
    getFlashUploadObjMock,
    getFormUploadObjMock,
  ];
  for (var i = 0, fn; (fn = uploadObjs[i++]);) {
    const uploadObj = fn();
    if (uploadObj !== false) {
      return uploadObj;
    }
  }
};

const uploadObj = iteratorUploadObj();
console.log('选中的上传对象：', uploadObj);

// ========== 轻松扩展新的上传方式 ==========
console.log('\n===== 轻松扩展新的上传方式 =====');

// 假设新增 HTML5 上传方式
const getHtml5UploadObj = function () {
  console.log('尝试 HTML5 上传...支持！');
  return 'HTML5上传控件';
};

// 只需要将新函数加入数组，并放在合适的位置
const iteratorUploadObj2 = function () {
  const uploadObjs = [
    getHtml5UploadObj,
    getActiveUploadObjMock,
    getFlashUploadObjMock,
    getFormUploadObjMock,
  ];
  for (var i = 0, fn; (fn = uploadObjs[i++]);) {
    const uploadObj = fn();
    if (uploadObj !== false) {
      return uploadObj;
    }
  }
};

const uploadObj2 = iteratorUploadObj2();
console.log('选中的上传对象：', uploadObj2);

// ========== 迭代器模式的优势 ==========
console.log('\n===== 迭代器模式的优势 =====');
console.log('1. 中止迭代器让迭代过程可以提前终止，避免不必要的遍历');
console.log('2. iteratorUploadObj 模式将"选择"逻辑与"具体实现"分离');
console.log('3. 新增上传方式只需添加新函数到数组中，符合开放-封闭原则');
console.log('4. 各上传方式的检测函数互相独立，修改其中一个不影响其他');
