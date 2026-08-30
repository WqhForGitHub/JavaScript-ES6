// 改前：优惠资格判定全部堆在一个函数里，规则一多 if-else 就开始套娃

interface User {
  name: string;
  isVip: boolean; // 是否会员
  vipLevel: number; // 会员等级
  isNew: boolean; // 是否新用户
}

function issueCoupon(user: User): string {
  if (user.isVip) {
    if (user.vipLevel >= 5) {
      return `向 ${user.name} 发放 100 元至尊券`;
    }
    return `向 ${user.name} 发放 50 元会员券`;
  }
  if (user.isNew) {
    return `向 ${user.name} 发放 30 元新人券`;
  }
  return `${user.name} 暂无可领的优惠券`;
}

console.log(issueCoupon({ name: '老王', isVip: true, vipLevel: 6, isNew: false })); // 至尊券
console.log(issueCoupon({ name: '小美', isVip: true, vipLevel: 2, isNew: false })); // 会员券
console.log(issueCoupon({ name: '小明', isVip: false, vipLevel: 0, isNew: true })); // 新人券
console.log(issueCoupon({ name: '阿呆', isVip: false, vipLevel: 0, isNew: false })); // 无券

// 问题：
// 1. 判定顺序写死：先比 VIP 等级再看新人身份，换活动想调整顺序就得重排 if
// 2. 大促想临时插一条“黑五专享券”规则，必须修改这个函数
// 3. 每条规则的“匹配条件 + 发券动作”耦合在一起，无法单独测试某条规则
// 4. 再加两三种券，函数会膨胀成一座 if-else 金字塔

export {};
