// 改前：每套内衣都 new 一个专属模特对象，拍 100 套就是 100 个对象

// 模特对象：性别（只有 2 种）和当天要穿的款式（每套都不同）全塞在对象里
class PhotoModel {
  constructor(
    public sex: 'male' | 'female',
    public underwear: string,
  ) {}

  takePhoto(): void {
    const label = this.sex === 'male' ? '男模特' : '女模特';
    console.log(`拍照：${label}，身穿 ${this.underwear}`);
  }
}

// 拍摄计划：50 套男款 + 50 套女款，每套都配一个专属模特对象
const models: PhotoModel[] = [];
for (let i = 1; i <= 50; i++) {
  models.push(new PhotoModel('male', `男款 ${i} 号内衣`));
}
for (let i = 1; i <= 50; i++) {
  models.push(new PhotoModel('female', `女款 ${i} 号内衣`));
}

console.log(`拍摄 100 套内衣，共创建模特对象：${models.length} 个`); // 100
models[0].takePhoto();
models[50].takePhoto();

// 问题：
// 1. 性别只有 2 种，却随每套内衣重复创建了 100 个对象，数量随款式线性膨胀
// 2. 如果对象里还有头像贴图、体型参数等大字段，内存浪费被同步放大 100 倍
// 3. 想给所有男模统一换发型？只能遍历 100 个对象逐个改

export {};
