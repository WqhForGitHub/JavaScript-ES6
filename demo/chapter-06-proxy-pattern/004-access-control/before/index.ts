// 改前：权限判断散落在每个业务方法里，if-else 到处复制粘贴，新增方法容易漏写
class UserService {
  deleteUser(role: string, userId: number) {
    if (role !== 'admin') {
      console.log('权限不足：只有管理员才能删除用户');
      return;
    }
    console.log(`删除用户 ${userId}`);
  }

  updateSalary(role: string, userId: number, salary: number) {
    if (role !== 'admin') {
      // 又复制粘贴一遍权限判断...
      console.log('权限不足：只有管理员才能修改薪资');
      return;
    }
    console.log(`修改用户 ${userId} 的薪资为 ${salary}`);
  }
}

const service = new UserService();
service.deleteUser('guest', 1001); // 拒绝
service.deleteUser('admin', 1001); // 通过

export {};
