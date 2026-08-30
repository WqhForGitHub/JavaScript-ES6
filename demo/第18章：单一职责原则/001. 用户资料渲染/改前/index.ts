// 改前：一个函数包办取数、拼 HTML、渲染和埋点 -- 数据和视图两副担子挑在一个肩上

// 模拟后端接口：字段是下划线风格（后端的习惯），而且随时可能调整
interface ApiUser {
  id: number;
  nickname: string;
  avatar_url: string;
  follower_count: number;
}

const apiResponse: Record<number, ApiUser> = {
  1001: {
    id: 1001,
    nickname: '张三',
    avatar_url: 'https://cdn.example.com/a.png',
    follower_count: 1024,
  },
};

function showUserProfile(userId: number): void {
  // 担子一：取数 + 字段翻译（下划线转驼峰）
  const raw = apiResponse[userId];
  if (!raw) {
    console.log('渲染失败：用户不存在');
    return;
  }
  const user = {
    id: raw.id,
    name: raw.nickname,
    avatar: raw.avatar_url,
    followers: raw.follower_count,
  };

  // 担子二：视图 -- 拼 HTML 并“渲染到页面”
  const html =
    '<div class="user-card">' +
    `<img src="${user.avatar}" />` +
    `<span>${user.name}</span>` +
    `<span>粉丝：${user.followers}</span>` +
    '</div>';
  console.log(`渲染用户卡片：${html}`);

  // 担子三：顺手再打个埋点
  console.log(`[埋点] 个人主页曝光 userId=${user.id}`);
}

showUserProfile(1001);
showUserProfile(9999); // 渲染失败：用户不存在

// 问题：
// 1. 两个变化原因挤在一起：接口字段改名（后端的事）要改这里，UI 改版换样式（前端的事）也要改这里
// 2. 数据逻辑无法复用：App 端只要数据不要 HTML，却只能把整个函数一起拖走
// 3. 视图没法单独测试：想验证“渲染出的 HTML 是否正确”，必须连接口数据一起 mock

export {};
