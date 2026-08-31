// 改后：单一职责原则 -- 取数、渲染、埋点各自成函数，任何一处变化都只惊动自己那一小块

// ========== 职责一：数据访问 -- 只关心接口长什么样、字段怎么翻译 ==========
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

interface UserProfile {
  id: number;
  name: string;
  avatar: string;
  followers: number;
}

function fetchUserProfile(userId: number): UserProfile | null {
  const raw = apiResponse[userId];
  if (!raw) return null; // 取数失败语义：查无此人，返回 null
  return {
    id: raw.id,
    name: raw.nickname, // 下划线转驼峰的“脏活”只出现在这一层
    avatar: raw.avatar_url,
    followers: raw.follower_count,
  };
}

// ========== 职责二：视图 -- 只关心“一个 UserProfile 怎么变成 HTML” ==========
function renderUserProfile(user: UserProfile): string {
  return (
    '<div class="user-card">' +
    `<img src="${user.avatar}" />` +
    `<span>${user.name}</span>` +
    `<span>粉丝：${user.followers}</span>` +
    '</div>'
  );
}

// ========== 职责三：埋点 -- 只关心“曝光时要上报什么” ==========
function trackProfileView(userId: number): void {
  console.log(`[埋点] 个人主页曝光 userId=${userId}`);
}

// ========== 编排函数：像搭积木一样串起三个职责，自身不含任何业务细节 ==========
function showUserProfile(userId: number): void {
  const user = fetchUserProfile(userId);
  if (!user) {
    console.log('渲染失败：用户不存在');
    return;
  }
  console.log(`渲染用户卡片：${renderUserProfile(user)}`);
  trackProfileView(user.id);
}

showUserProfile(1001);
showUserProfile(9999); // 渲染失败：用户不存在

// ========== 复用是拆分的自然回报 ==========
// 1. App 端只要数据：直接调 fetchUserProfile，一行视图代码都不用带
const appUser = fetchUserProfile(1001);
console.log(`App 端拿到数据：${appUser?.name}，粉丝 ${appUser?.followers} 人`);

// 2. 新场景换皮渲染：数据原封不动，新写一个视图函数即可
function renderUserProfileRow(user: UserProfile): string {
  return `<tr><td>${user.name}</td><td>粉丝 ${user.followers}</td></tr>`;
}
console.log(`列表页行渲染：${renderUserProfileRow(appUser!)}`);

// 优势：
// 1. 一个模块只有一个变化原因：接口改字段只动 fetchUserProfile，UI 改版只动 renderUserProfile
// 2. 职责自由组合：同一份数据既能喂给卡片视图，也能喂给列表行视图，互不干扰
// 3. 视图函数是纯函数：喂一个对象就能断言输出，不用 mock 接口、不用启动页面

export {};
