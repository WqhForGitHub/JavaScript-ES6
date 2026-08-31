// 改前：权限校验要自己递归遍历权限树，每加一种节点都要改校验函数
interface MenuNodeData {
  type: 'menu' | 'button';
  code?: string; // 按钮才有权限码
  children?: MenuNodeData[];
}

const permissionTree: MenuNodeData = {
  type: 'menu',
  children: [
    {
      type: 'menu',
      children: [
        { type: 'button', code: 'order:view' },
        { type: 'button', code: 'order:delete' },
      ],
    },
    {
      type: 'menu',
      children: [{ type: 'button', code: 'user:view' }],
    },
  ],
};

function hasPermission(node: MenuNodeData, code: string): boolean {
  if (node.type === 'button') {
    return node.code === code;
  }
  return (node.children ?? []).some((child) => hasPermission(child, code));
}

console.log('拥有 order:delete：', hasPermission(permissionTree, 'order:delete')); // true
console.log('拥有 user:delete：', hasPermission(permissionTree, 'user:delete')); // false

// 问题：
// 1. 校验函数必须理解树的内部结构（type/children/code），结构一变就要跟着改
// 2. 新需求（如"整个菜单被停用"）只能往同一个递归函数里继续叠 if
// 3. 不同节点的校验规则其实不一样，却全部挤在一个函数里

export {};
