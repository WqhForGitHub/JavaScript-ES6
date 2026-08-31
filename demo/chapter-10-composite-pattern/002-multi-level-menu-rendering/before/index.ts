// 改前：渲染菜单靠写死层级的嵌套循环，层级一变就全乱
interface MenuItemData {
  label: string;
  children?: MenuItemData[];
}

const menuData: MenuItemData[] = [
  { label: '工作台' },
  {
    label: '订单管理',
    children: [{ label: '订单列表' }, { label: '退款管理' }],
  },
  {
    label: '商品管理',
    children: [
      { label: '商品列表' },
      {
        label: '分类管理',
        children: [{ label: '新增分类' }, { label: '分类排序' }], // 第三层菜单
      },
    ],
  },
];

// 第一层
for (const item of menuData) {
  console.log(`菜单：${item.label}`);
  // 第二层
  for (const child of item.children ?? []) {
    console.log(`  子菜单：${child.label}`);
    // 第三层？还得再写一层循环……产品说以后要支持无限层级，循环写到天荒地老
    for (const grandchild of child.children ?? []) {
      console.log(`    孙菜单：${grandchild.label}`);
    }
  }
}

// 问题：
// 1. 循环层级写死，只能支持固定深度，第四层菜单一来就歇菜
// 2. 每层循环长得几乎一样，纯属重复劳动
// 3. 菜单数据结构和渲染逻辑互相纠缠，换一种展示（如折叠面板）要重写全部循环

export {};
