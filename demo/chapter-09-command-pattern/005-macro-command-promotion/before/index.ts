// 改前："一键开启大促"就是把所有步骤硬编码在一个函数里，改一步动全身
const services = {
  onSaleProducts(): void {
    console.log('[商品] 全场上架大促商品');
  },
  openCoupon(): void {
    console.log('[营销] 发放满减优惠券');
  },
  openFlashSale(): void {
    console.log('[营销] 开启秒杀活动');
  },
  notifyUsers(): void {
    console.log('[推送] 给会员发送大促短信');
  },
  addBanner(): void {
    console.log('[运营] 首页挂上大促横幅');
  },
  standbyOps(): void {
    console.log('[运维] 扩容服务器，随时待命');
  },
};

function startPromotion(): void {
  // 六个步骤写死在一个函数里，顺序、内容都改不了
  services.onSaleProducts();
  services.openCoupon();
  services.openFlashSale();
  services.notifyUsers();
  services.addBanner();
  services.standbyOps();
}

startPromotion();

// 问题：
// 1. 想只跑"营销部分"（发券 + 秒杀）？做不到，只能把函数抄一遍再删删改改
// 2. 大促方案调整（比如要先扩容再上架），必须回来修改 startPromotion 本身
// 3. 六个步骤没法复用到别的场景（如"日常小促"只想复用发券和推送）

export {};
