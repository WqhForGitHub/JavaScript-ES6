// 改后：组合模式 -- 菜单和按钮都能回答"我有没有这个权限"，规则各自实现

// ========== 组件接口 ==========
interface PermissionNode {
  check(code: string): boolean;
}

// ========== 叶子：按钮，持有权限码 ==========
class ButtonNode implements PermissionNode {
  constructor(private code: string) {}

  check(code: string): boolean {
    return this.code === code;
  }
}

// ========== 容器：菜单，管辖整棵子树 ==========
class MenuNode implements PermissionNode {
  private children: PermissionNode[] = [];
  private disabled = false;

  constructor(private label: string) {}

  add(node: PermissionNode): void {
    this.children.push(node);
  }

  disable(): void {
    this.disabled = true;
  }

  check(code: string): boolean {
    // 整个菜单被停用，子树里的按钮权限全部失效
    if (this.disabled) return false;
    return this.children.some((child) => child.check(code));
  }
}

// ========== 组装权限树 ==========
const orderMenu = new MenuNode('订单管理');
orderMenu.add(new ButtonNode('order:view'));
orderMenu.add(new ButtonNode('order:delete'));

const userMenu = new MenuNode('用户管理');
userMenu.add(new ButtonNode('user:view'));
userMenu.add(new ButtonNode('user:delete'));

const root = new MenuNode('后台系统');
root.add(orderMenu);
root.add(userMenu);

console.log('拥有 order:delete：', root.check('order:delete')); // true
console.log('拥有 user:delete：', root.check('user:delete')); // true

// 停用整个用户管理菜单，里面的按钮权限随之全部失效
userMenu.disable();
console.log('停用后 user:view：', root.check('user:view')); // false
console.log('停用后 user:delete：', root.check('user:delete')); // false

// 优势：
// 1. 校验规则跟着节点走：按钮比对权限码，菜单管辖子树，互不干扰
// 2. "整棵子树停用"这类整体规则写在 MenuNode 一处，自动作用于所有后代
// 3. 调用方只管问节点 check(code)，不感知树结构，查子树、查全树用法一致

export {};
