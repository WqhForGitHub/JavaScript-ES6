// 改前：递归 + 回调遍历部门树，想提前中断？回调里的 return 管不了递归

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

// 遍历规则写死在函数里，调用方只能塞一个回调进去（内部迭代器）
function walk(dept: Department, callback: (dept: Department) => void): void {
  callback(dept);
  (dept.children || []).forEach((child) => walk(child, callback));
}

// 需求：遍历到"前端组"就停，后面的部门不用再走
walk(company, (dept) => {
  if (dept.name === '前端组') {
    console.log('找到前端组了');
    return; // 只结束了"当前这一次回调"，递归根本停不下来！
  }
  console.log('走到：', dept.name);
});
// 输出里"小程序小组、后端组、市场部"依旧被走了一遍，全是浪费

// 问题：
// 1. 回调式内部迭代器无法中断，return 形同虚设，白走冤枉路
// 2. 遍历逻辑和业务逻辑搅在回调里，可读性差
// 3. 想筛选、切片？只能先塞进数组再二次处理
// 4. 树形结构享受不到 for...of、展开运算符这些语言原生能力

export {};
