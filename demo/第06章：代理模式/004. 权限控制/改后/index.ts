// 改后：保护代理 -- 权限校验统一在代理层完成，业务代码保持干净，新增方法零成本
class UserService {
  deleteUser(userId: number) {
    console.log(`删除用户 ${userId}`);
  }

  updateSalary(userId: number, salary: number) {
    console.log(`修改用户 ${userId} 的薪资为 ${salary}`);
  }
}

class AdminGuardProxy {
  constructor(
    private real: UserService,
    private role: string,
  ) {}

  private check(): boolean {
    if (this.role !== 'admin') {
      console.log('权限不足：只有管理员才能执行该操作');
      return false;
    }
    return true;
  }

  deleteUser(userId: number) {
    if (!this.check()) return;
    this.real.deleteUser(userId);
  }

  updateSalary(userId: number, salary: number) {
    if (!this.check()) return;
    this.real.updateSalary(userId, salary);
  }
}

const guestService = new AdminGuardProxy(new UserService(), 'guest');
guestService.deleteUser(1001); // 拒绝
guestService.updateSalary(1001, 20000); // 拒绝

const adminService = new AdminGuardProxy(new UserService(), 'admin');
adminService.deleteUser(1001); // 通过
adminService.updateSalary(1001, 20000); // 通过

export {};
