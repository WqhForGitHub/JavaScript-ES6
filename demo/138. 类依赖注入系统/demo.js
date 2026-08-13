// 138. 类依赖注入系统

class Api {
  getUser() {
    return { name: 'Ada' };
  }
}
class UserService {
  constructor(api) {
    this.api = api;
  }
  load() {
    return this.api.getUser();
  }
}
console.log(new UserService(new Api()).load());
