// 改后：宏命令 -- 命令也能组合成更大的命令，一键执行 = 执行一串命令

// ========== 命令接口 ==========
interface Command {
  execute(): void;
}

// ========== 宏命令：一组命令的组合，本身也是命令（可无限嵌套） ==========
class MacroCommand implements Command {
  private commands: Command[] = [];

  add(command: Command): void {
    this.commands.push(command);
  }

  execute(): void {
    this.commands.forEach((command) => command.execute());
  }
}

// ========== 基础命令：每个步骤各自封装 ==========
class OnSaleProductsCommand implements Command {
  execute(): void {
    console.log('[商品] 全场上架大促商品');
  }
}

class OpenCouponCommand implements Command {
  execute(): void {
    console.log('[营销] 发放满减优惠券');
  }
}

class OpenFlashSaleCommand implements Command {
  execute(): void {
    console.log('[营销] 开启秒杀活动');
  }
}

class NotifyUsersCommand implements Command {
  execute(): void {
    console.log('[推送] 给会员发送大促短信');
  }
}

class AddBannerCommand implements Command {
  execute(): void {
    console.log('[运营] 首页挂上大促横幅');
  }
}

class StandbyOpsCommand implements Command {
  execute(): void {
    console.log('[运维] 扩容服务器，随时待命');
  }
}

// ========== 组装：像搭积木一样拼出"营销准备"和"大促启动"两个宏 ==========
const marketingMacro = new MacroCommand();
marketingMacro.add(new OpenCouponCommand());
marketingMacro.add(new OpenFlashSaleCommand());

const promotionMacro = new MacroCommand();
promotionMacro.add(new StandbyOpsCommand()); // 顺序随意调整：先扩容
promotionMacro.add(new OnSaleProductsCommand());
promotionMacro.add(marketingMacro); // 宏里嵌宏
promotionMacro.add(new NotifyUsersCommand());
promotionMacro.add(new AddBannerCommand());

console.log('--- 一键开启双11大促 ---');
promotionMacro.execute();

// 营销宏还能单独复用：日常小促只发券、不开秒杀
const dailyMacro = new MacroCommand();
dailyMacro.add(new OpenCouponCommand());

console.log('--- 日常小促：只发券 ---');
dailyMacro.execute();

// 优势：
// 1. 每个步骤是独立命令，可任意组合、调序、复用
// 2. 宏命令本身也是命令，可以嵌套成更大的宏（树形组合）
// 3. 大促方案变化 = 重新组装积木，任何已有命令都不用改

export {};
