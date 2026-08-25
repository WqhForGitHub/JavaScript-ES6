// ============================================
// 第18章：单一职责原则 - demo2
// 类/模块层面的单一职责
// ============================================

// ============================================
// 反例：一个类承担多个职责
// ============================================

const UserManager = function () {
  this.users = [];
};

// 职责1：用户数据管理
UserManager.prototype.addUser = function (user) {
  this.users.push(user);
  console.log('[UserManager] 添加用户: ' + user.name);
};

UserManager.prototype.removeUser = function (userId) {
  for (let i = 0; i < this.users.length; i++) {
    if (this.users[i].id === userId) {
      this.users.splice(i, 1);
      console.log('[UserManager] 删除用户: ' + userId);
      return;
    }
  }
};

UserManager.prototype.getUser = function (userId) {
  for (let i = 0; i < this.users.length; i++) {
    if (this.users[i].id === userId) {
      return this.users[i];
    }
  }
  return null;
};

// 职责2：UI 渲染
UserManager.prototype.renderUserList = function () {
  console.log('[UserManager] 渲染用户列表:');
  for (let i = 0; i < this.users.length; i++) {
    console.log(
      '[UserManager]   <div>' +
        this.users[i].name +
        ' - ' +
        this.users[i].email +
        '</div>'
    );
  }
};

UserManager.prototype.renderUserProfile = function (userId) {
  const user = this.getUser(userId);
  if (user) {
    console.log('[UserManager] 渲染用户详情: ' + user.name + ', ' + user.email);
  }
};

// 职责3：通知服务
UserManager.prototype.sendWelcomeEmail = function (userId) {
  const user = this.getUser(userId);
  console.log('[UserManager] 发送欢迎邮件给: ' + user.email);
};

UserManager.prototype.sendDeactivationNotice = function (userId) {
  const user = this.getUser(userId);
  console.log('[UserManager] 发送停用通知给: ' + user.email);
};

console.log('=== 反例：UserManager 承担三个职责 ===');
const badManager = new UserManager();
badManager.addUser({ id: 1, name: '张三', email: 'zhangsan@example.com' });
badManager.addUser({ id: 2, name: '李四', email: 'lisi@example.com' });
badManager.renderUserList();
badManager.sendWelcomeEmail(1);
badManager.removeUser(2);
badManager.sendDeactivationNotice(2);
console.log('');

// ============================================
// 重构：每个类/模块只承担一个职责
// ============================================

// 职责1：用户数据服务
const UserService = function () {
  this.users = [];
};

UserService.prototype.addUser = function (user) {
  this.users.push(user);
  console.log('[UserService] 添加用户: ' + user.name);
  return user;
};

UserService.prototype.removeUser = function (userId) {
  for (let i = 0; i < this.users.length; i++) {
    if (this.users[i].id === userId) {
      const removed = this.users.splice(i, 1)[0];
      console.log('[UserService] 删除用户: ' + removed.name);
      return removed;
    }
  }
  return null;
};

UserService.prototype.getUser = function (userId) {
  for (let i = 0; i < this.users.length; i++) {
    if (this.users[i].id === userId) {
      return this.users[i];
    }
  }
  return null;
};

UserService.prototype.getAllUsers = function () {
  return this.users;
};

// 职责2：用户界面渲染
const UserProfileRenderer = function () {};

UserProfileRenderer.prototype.renderUserList = function (users) {
  console.log('[UserProfileRenderer] 渲染用户列表:');
  for (let i = 0; i < users.length; i++) {
    console.log(
      '[UserProfileRenderer]   <div>' +
        users[i].name +
        ' - ' +
        users[i].email +
        '</div>'
    );
  }
};

UserProfileRenderer.prototype.renderUserProfile = function (user) {
  if (user) {
    console.log(
      '[UserProfileRenderer] 渲染用户详情: ' + user.name + ', ' + user.email
    );
  }
};

// 职责3：通知服务
const NotificationService = function () {};

NotificationService.prototype.sendWelcomeEmail = function (user) {
  console.log('[NotificationService] 发送欢迎邮件给: ' + user.email);
};

NotificationService.prototype.sendDeactivationNotice = function (user) {
  console.log('[NotificationService] 发送停用通知给: ' + user.email);
};

// ============================================
// 使用重构后的模块
// ============================================

console.log('=== 重构后：三个模块各司其职 ===');
const userService = new UserService();
const renderer = new UserProfileRenderer();
const notifier = new NotificationService();

const user1 = userService.addUser({
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
});
const user2 = userService.addUser({
  id: 2,
  name: '李四',
  email: 'lisi@example.com',
});

renderer.renderUserList(userService.getAllUsers());
notifier.sendWelcomeEmail(user1);

const removed = userService.removeUser(2);
notifier.sendDeactivationNotice(removed);
console.log('');

// ============================================
// 对比说明
// ============================================

console.log('=== 对比说明 ===');
console.log('反例 UserManager:');
console.log('  - 数据存储变化（如换数据库）需要改 UserManager');
console.log('  - UI 框架变化（如换前端框架）需要改 UserManager');
console.log('  - 通知方式变化（如换邮件服务）需要改 UserManager');
console.log('  - 三个理由让类变化，违反单一职责原则');
console.log('');
console.log('重构后拆分为三个模块:');
console.log('  UserService          - 只因数据存取需求变化而修改');
console.log('  UserProfileRenderer  - 只因 UI 渲染需求变化而修改');
console.log('  NotificationService  - 只因通知需求变化而修改');
console.log('  - 每个类只有一个引起变化的原因');
