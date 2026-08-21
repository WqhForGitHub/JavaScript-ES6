// 第09章：命令模式 - 菜单按钮

// ==================== 接收者 ====================

const MenuBar = {
  refresh: function () {
    console.log("刷新菜单目录");
  },
};

const SubMenu = {
  add: function () {
    console.log("增加子菜单");
  },
  del: function () {
    console.log("删除子菜单");
  },
};

// ==================== 命令对象 ====================

const RefreshMenuBarCommand = function (receiver) {
  this.receiver = receiver;
};

RefreshMenuBarCommand.prototype.execute = function () {
  this.receiver.refresh();
};

const AddSubMenuCommand = function (receiver) {
  this.receiver = receiver;
};

AddSubMenuCommand.prototype.execute = function () {
  this.receiver.add();
};

const DelSubMenuCommand = function (receiver) {
  this.receiver = receiver;
};

DelSubMenuCommand.prototype.execute = function () {
  this.receiver.del();
};

// ==================== 绑定命令到按钮 ====================

const setCommand = function (button, command) {
  button.onclick = function () {
    command.execute();
  };
};

// ==================== 模拟按钮 ====================

const refreshBarButton = {
  onclick: null,
};

const addSubMenuButton = {
  onclick: null,
};

const delSubMenuButton = {
  onclick: null,
};

// ==================== 组装并执行 ====================

const refreshMenuBarCommand = new RefreshMenuBarCommand(MenuBar);
const addSubMenuCommand = new AddSubMenuCommand(SubMenu);
const delSubMenuCommand = new DelSubMenuCommand(SubMenu);

setCommand(refreshBarButton, refreshMenuBarCommand);
setCommand(addSubMenuButton, addSubMenuCommand);
setCommand(delSubMenuButton, delSubMenuCommand);

console.log("--- 点击刷新菜单按钮 ---");
refreshBarButton.onclick();

console.log("--- 点击增加子菜单按钮 ---");
addSubMenuButton.onclick();

console.log("--- 点击删除子菜单按钮 ---");
delSubMenuButton.onclick();
