// 改后：迭代器模式 -- 生成器 + yield* 把树"压平"成序列，可中断、可组合

interface Department {
  name: string;
  children?: Department[];
}

const company: Department = {
  name: '总公司',
  children: [
    {
      name: '研发部',
      children: [{ name: '前端组', children: [{ name: '小程序小组' }] }, { name: '后端组' }],
    },
    { name: '市场部' },
  ],
};

// 深度优先：先吐出自己，再依次压平子树
function* treeIterator(dept: Department): Generator<Department> {
  yield dept;
  for (const child of dept.children || []) {
    yield* treeIterator(child); // 委托给子树的迭代器
  }
}

// 用法一：全量遍历，调用方一行递归都不用写
console.log('--- 全量遍历 ---');
for (const dept of treeIterator(company)) {
  console.log('走到：', dept.name);
}

// 用法二：找到"前端组"立即 break，后面的部门不再访问
console.log('--- 找到即停 ---');
for (const dept of treeIterator(company)) {
  if (dept.name === '前端组') {
    console.log('找到前端组，停止遍历');
    break;
  }
  console.log('走过：', dept.name);
}

// 用法三：展开成数组，筛选出所有"组"级别的部门
const groups = [...treeIterator(company)].filter((d) => d.name.endsWith('组'));
console.log(
  '所有小组：',
  groups.map((d) => d.name),
); // ['前端组', '小程序小组', '后端组']

// 优势：
// 1. for...of + break 完美支持，找到即停，不走冤枉路
// 2. 树被抽象成"一维序列"，调用方完全不碰递归
// 3. 展开、filter、map 等数组能力全部免费获得
// 4. treeIterator 对任何树形结构通用：权限菜单树、商品分类树、评论楼中楼

export {};
