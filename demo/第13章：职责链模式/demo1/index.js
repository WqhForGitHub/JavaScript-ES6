// 第13章：职责链模式 - demo1：订单购买

// ============================================================
// 一、不好的方式：巨大的条件分支函数
// ============================================================

const order = function (orderType, pay, stock) {
  if (orderType === 1) {
    // 500元定金购手机
    if (pay === true) {
      console.log('500元定金预购，得到100优惠券');
    } else {
      // 未支付定金，降级到普通订单
      if (stock > 0) {
        console.log('普通购买，无优惠券');
      } else {
        console.log('手机库存不足');
      }
    }
  } else if (orderType === 2) {
    // 200元定金购手机
    if (pay === true) {
      console.log('200元定金预购，得到50优惠券');
    } else {
      // 未支付定金，降级到普通订单
      if (stock > 0) {
        console.log('普通购买，无优惠券');
      } else {
        console.log('手机库存不足');
      }
    }
  } else if (orderType === 3) {
    // 普通购买
    if (stock > 0) {
      console.log('普通购买，无优惠券');
    } else {
      console.log('手机库存不足');
    }
  }
};

console.log('--- 不好的方式：巨大的条件分支 ---');
order(1, true, 500); // 500元定金，已支付
order(1, false, 500); // 500元定金，未支付
order(2, true, 500); // 200元定金，已支付
order(3, false, 500); // 普通购买
order(3, false, 0); // 普通购买，无库存
console.log('');

// ============================================================
// 二、好的方式：职责链模式
// ============================================================

// 定义三个处理函数，返回特定值表示是否传递给下一个节点
const order500 = function (orderType, pay, stock) {
  if (orderType === 1 && pay === true) {
    console.log('500元定金预购，得到100优惠券');
    return; // 处理成功，不再传递
  }
  return 'nextSuccessor'; // 传递给下一个节点
};

const order200 = function (orderType, pay, stock) {
  if (orderType === 2 && pay === true) {
    console.log('200元定金预购，得到50优惠券');
    return;
  }
  return 'nextSuccessor';
};

const orderNormal = function (orderType, pay, stock) {
  if (stock > 0) {
    console.log('普通购买，无优惠券');
  } else {
    console.log('手机库存不足');
  }
};

// Chain 构造函数
const Chain = function (fn) {
  this.fn = fn;
  this.successor = null;
};

// 设置下一个节点
Chain.prototype.setNextSuccessor = function (successor) {
  return (this.successor = successor);
};

// 传递请求给某个节点
Chain.prototype.passRequest = function () {
  const ret = this.fn.apply(this, arguments);
  if (ret === 'nextSuccessor') {
    return (
      this.successor &&
      this.successor.passRequest.apply(this.successor, arguments)
    );
  }
  return ret;
};

// 创建职责链节点
const chainOrder500 = new Chain(order500);
const chainOrder200 = new Chain(order200);
const chainOrderNormal = new Chain(orderNormal);

// 设置职责链顺序：500 -> 200 -> normal
chainOrder500.setNextSuccessor(chainOrder200);
chainOrder200.setNextSuccessor(chainOrderNormal);

console.log('--- 职责链模式 ---');
console.log('测试：orderType=1, pay=true, stock=500');
chainOrder500.passRequest(1, true, 500);

console.log('测试：orderType=1, pay=false, stock=500');
chainOrder500.passRequest(1, false, 500);

console.log('测试：orderType=2, pay=true, stock=500');
chainOrder500.passRequest(2, true, 500);

console.log('测试：orderType=2, pay=false, stock=500');
chainOrder500.passRequest(2, false, 500);

console.log('测试：orderType=3, pay=false, stock=500');
chainOrder500.passRequest(3, false, 500);

console.log('测试：orderType=3, pay=false, stock=0');
chainOrder500.passRequest(3, false, 0);
console.log('');

// ============================================================
// 三、职责链的灵活性：可以随时增删节点
// ============================================================

console.log('--- 灵活性：插入新的节点 ---');

const order300 = function (orderType, pay, stock) {
  if (orderType === 3 && pay === true) {
    console.log('300元定金预购，得到60优惠券');
    return;
  }
  return 'nextSuccessor';
};

const chainOrder300 = new Chain(order300);
// 在500和200之间插入300节点
chainOrder500.setNextSuccessor(chainOrder300);
chainOrder300.setNextSuccessor(chainOrder200);
chainOrder200.setNextSuccessor(chainOrderNormal);

console.log('测试：orderType=3, pay=true, stock=500（新增的300元定金）');
chainOrder500.passRequest(3, true, 500);

console.log('测试：orderType=3, pay=false, stock=500');
chainOrder500.passRequest(3, false, 500);
