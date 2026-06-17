// 257. REST API模拟器

class RestApiMock {
  constructor(data = []) {
    this.data = data;
  }
  list() {
    return Promise.resolve(this.data);
  }
  create(item) {
    this.data.push(item);
    return Promise.resolve(item);
  }
}
const api = new RestApiMock([{ id: 1, name: "JS" }]);
api.create({ id: 2, name: "DOM" }).then(() => api.list().then(console.log));
