// 改后：职责链模式 -- 每种券是链上一个节点，用户从链头进入，第一个匹配的节点负责发券

interface User {
  name: string;
  isVip: boolean;
  vipLevel: number;
  isNew: boolean;
}

// ========== 抽象发券者：“匹配则发券，否则传给下一种券”只在基类写一遍 ==========
abstract class CouponIssuer {
  private next: CouponIssuer | null = null;

  constructor(protected couponName: string) {}

  setNext(next: CouponIssuer): CouponIssuer {
    this.next = next;
    return next;
  }

  issue(user: User): string {
    if (this.match(user)) {
      return `向 ${user.name} 发放 ${this.couponName}`;
    }
    if (this.next) {
      return this.next.issue(user);
    }
    return `${user.name} 暂无可领的优惠券`;
  }

  // 子类只回答：这个用户符不符合我这种券的领取条件？
  protected abstract match(user: User): boolean;
}

// ========== 具体发券者：一种券一个类 ==========
class SupremeCoupon extends CouponIssuer {
  constructor() {
    super('100 元至尊券');
  }

  protected match(user: User): boolean {
    return user.isVip && user.vipLevel >= 5;
  }
}

class VipCoupon extends CouponIssuer {
  constructor() {
    super('50 元会员券');
  }

  protected match(user: User): boolean {
    return user.isVip;
  }
}

class NewcomerCoupon extends CouponIssuer {
  constructor() {
    super('30 元新人券');
  }

  protected match(user: User): boolean {
    return user.isNew;
  }
}

// ========== 组装职责链：至尊券 -> 会员券 -> 新人券 ==========
const supreme = new SupremeCoupon();
supreme.setNext(new VipCoupon()).setNext(new NewcomerCoupon());

const users: User[] = [
  { name: '老王', isVip: true, vipLevel: 6, isNew: false },
  { name: '小美', isVip: true, vipLevel: 2, isNew: false },
  { name: '小明', isVip: false, vipLevel: 0, isNew: true },
  { name: '阿呆', isVip: false, vipLevel: 0, isNew: false },
];
users.forEach((user) => console.log(supreme.issue(user)));

// ========== 大促扩展：临时在链头插入“黑五专享券”，活动结束摘掉即可 ==========
class BlackFridayCoupon extends CouponIssuer {
  constructor() {
    super('66 元黑五专享券');
  }

  protected match(user: User): boolean {
    return user.isVip || user.isNew; // 活动期间：会员和新人都可领
  }
}

const blackFriday = new BlackFridayCoupon();
blackFriday.setNext(supreme); // 黑五券 -> 至尊券 -> 会员券 -> 新人券

console.log(blackFriday.issue({ name: '阿呆', isVip: false, vipLevel: 0, isNew: false })); // 仍无券
console.log(blackFriday.issue({ name: '小明', isVip: false, vipLevel: 0, isNew: true })); // 黑五券

// 优势：
// 1. 每种券的“匹配条件 + 券名”封装在自己的类里，可独立修改和测试
// 2. 判定顺序就是链的组装顺序，调整顺序只需重新 setNext，不动任何规则
// 3. 大促等临时规则在链头插入、活动后摘除，主流程零感知
// 4. 用户从链头进入，无需知道自己符合哪种券 -- 判定责任在链上

export {};
