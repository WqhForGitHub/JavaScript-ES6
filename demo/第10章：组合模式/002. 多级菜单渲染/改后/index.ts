// 改后：组合模式 -- 菜单和菜单项实现同一个接口，自己渲染自己，支持无限层级

// ========== 组件接口 ==========
interface MenuComponent {
  render(depth: number): void;
}

// ========== 叶子：菜单项 ==========
class MenuItem implements MenuComponent {
  constructor(private label: string) {}

  render(depth: number): void {
    console.log(`${'  '.repeat(depth)}- ${this.label}`);
  }
}

// ========== 容器：菜单组，渲染自己并把任务委托给孩子 ==========
class MenuGroup implements MenuComponent {
  private children: MenuComponent[] = [];

  constructor(private label: string) {}

  add(component: MenuComponent): void {
    this.children.push(component);
  }

  render(depth: number): void {
    console.log(`${'  '.repeat(depth)}+ ${this.label}`);
    // 不管孩子是菜单项还是另一个菜单组，统一调用 render
    this.children.forEach((child) => child.render(depth + 1));
  }
}

// ========== 组装一棵任意深的菜单树 ==========
const sidebar = new MenuGroup('后台管理系统');
sidebar.add(new MenuItem('工作台'));

const orderMenu = new MenuGroup('订单管理');
orderMenu.add(new MenuItem('订单列表'));
orderMenu.add(new MenuItem('退款管理'));

const categoryMenu = new MenuGroup('分类管理'); // 第三层菜单，无需任何特殊处理
categoryMenu.add(new MenuItem('新增分类'));
categoryMenu.add(new MenuItem('分类排序'));

const productMenu = new MenuGroup('商品管理');
productMenu.add(new MenuItem('商品列表'));
productMenu.add(categoryMenu);

sidebar.add(orderMenu);
sidebar.add(productMenu);

sidebar.render(0);

// 优势：
// 1. 无限层级天然支持：容器把渲染委托给孩子，递归自动展开
// 2. 菜单项、菜单组用法完全一致，单个菜单项也能单独 render
// 3. 新增"分隔线"等新节点 = 新增一个类，渲染逻辑零修改

export {};
