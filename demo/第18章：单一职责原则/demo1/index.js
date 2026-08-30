// ============================================
// 第18章：单一职责原则 - demo1
// 函数层面的单一职责
// ============================================

// ============================================
// 反例：一个函数承担多个职责
// ============================================

const processUserDataAndUpdateUI = function (users) {
  // 职责1：数据处理
  const processedUsers = [];
  for (let i = 0; i < users.length; i++) {
    processedUsers.push({
      id: users[i].id,
      displayName: users[i].firstName + ' ' + users[i].lastName,
      email: users[i].email.toLowerCase(),
    });
  }

  // 职责2：UI 更新
  console.log('--- 反例：一个函数做三件事 ---');
  console.log('[UI] 更新用户列表容器:');
  for (let j = 0; j < processedUsers.length; j++) {
    console.log(
      '[UI] 渲染行: <li>' +
        processedUsers[j].displayName +
        ' - ' +
        processedUsers[j].email +
        '</li>',
    );
  }

  // 职责3：事件绑定
  console.log('[Event] 绑定用户列表点击事件');
  console.log('[Event] 绑定用户列表悬停事件');
  console.log('');
};

const rawUsers = [
  { id: 1, firstName: '张', lastName: '三', email: 'ZHANGSAN@EXAMPLE.COM' },
  { id: 2, firstName: '李', lastName: '四', email: 'LISI@EXAMPLE.COM' },
  { id: 3, firstName: '王', lastName: '五', email: 'WANGWU@EXAMPLE.COM' },
];

processUserDataAndUpdateUI(rawUsers);

// ============================================
// 重构：每个函数只承担一个职责
// ============================================

// 职责1：数据处理
const processUserData = function (users) {
  const processedUsers = [];
  for (let i = 0; i < users.length; i++) {
    processedUsers.push({
      id: users[i].id,
      displayName: users[i].firstName + ' ' + users[i].lastName,
      email: users[i].email.toLowerCase(),
    });
  }
  return processedUsers;
};

// 职责2：UI 更新
const updateUserListUI = function (processedUsers) {
  console.log('[UI] 更新用户列表容器:');
  for (let i = 0; i < processedUsers.length; i++) {
    console.log(
      '[UI] 渲染行: <li>' +
        processedUsers[i].displayName +
        ' - ' +
        processedUsers[i].email +
        '</li>',
    );
  }
};

// 职责3：事件绑定
const attachUserListEvents = function () {
  console.log('[Event] 绑定用户列表点击事件');
  console.log('[Event] 绑定用户列表悬停事件');
};

// 组合调用
console.log('--- 重构：每个函数只做一件事 ---');
const processed = processUserData(rawUsers);
updateUserListUI(processed);
attachUserListEvents();
console.log('');

// ============================================
// 对比说明
// ============================================

console.log('--- 对比说明 ---');
console.log('反例 processUserDataAndUpdateUI:');
console.log('  - 修改数据处理逻辑需要改这个函数');
console.log('  - 修改 UI 渲染方式需要改这个函数');
console.log('  - 修改事件绑定方式需要改这个函数');
console.log('  - 三个理由让函数变化，违反单一职责原则');
console.log('');
console.log('重构后拆分为三个函数:');
console.log('  processUserData   - 只因数据处理需求变化而修改');
console.log('  updateUserListUI  - 只因 UI 需求变化而修改');
console.log('  attachUserListEvents - 只因事件需求变化而修改');
console.log('  - 每个函数只有一个引起变化的原因');
