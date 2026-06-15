# JavaScript 手写代码题 500 道

> 涵盖基础类型、数组、字符串、对象、函数、异步、DOM、事件、设计模式、ES6+、工具函数、数据结构、算法等 17 大分类

---

## 一、基础类型与类型判断（1-25）

1. 手写 `typeof` 的实现，能判断基本类型和引用类型
2. 手写 `instanceof` 操作符
3. 手写判断变量是否为数组的方法（至少 3 种）
4. 手写判断变量是否为 NaN
5. 手写判断变量是否为整数
6. 手写判断变量是否为素数
7. 手写判断变量是否为闰年
8. 手写判断字符串是否为回文
9. 手写深拷贝函数（Deep Clone）
10. 手写浅拷贝函数（Shallow Clone）
11. 手写 `Object.is` 实现
12. 手写类型判断函数 `getType`，返回精确类型字符串
13. 手写判断是否为空对象
14. 手写判断是否为空数组
15. 手写判断变量是否为 Promise 对象
16. 手写判断变量是否为 Generator 函数
17. 手写判断变量是否为 async 函数
18. 手写判断是否为类数组对象
19. 手写判断变量是否为纯对象（plain object）
20. 手写判断两个值是否相等（深度比较 deepEqual）
21. 手写判断变量是否为可迭代对象
22. 手写判断变量是否为 Map 或 Set
23. 手写判断变量是否为 Date 对象
24. 手写判断变量是否为正则表达式对象
25. 手写判断变量是否为原始值（primitive）

---

## 二、数组方法手写（26-75）

26. 手写 `Array.prototype.map`
27. 手写 `Array.prototype.filter`
28. 手写 `Array.prototype.reduce`
29. 手写 `Array.prototype.forEach`
30. 手写 `Array.prototype.find`
31. 手写 `Array.prototype.findIndex`
32. 手写 `Array.prototype.every`
33. 手写 `Array.prototype.some`
34. 手写 `Array.prototype.includes`
35. 手写 `Array.prototype.indexOf`
36. 手写 `Array.prototype.lastIndexOf`
37. 手写 `Array.prototype.flat`（支持指定深度）
38. 手写 `Array.prototype.flatMap`
39. 手写 `Array.prototype.fill`
40. 手写 `Array.prototype.concat`
41. 手写 `Array.prototype.slice`
42. 手写 `Array.prototype.splice`
43. 手写 `Array.prototype.join`
44. 手写 `Array.prototype.reverse`
45. 手写 `Array.prototype.sort`
46. 手写 `Array.prototype.push`
47. 手写 `Array.prototype.pop`
48. 手写 `Array.prototype.shift`
49. 手写 `Array.prototype.unshift`
50. 手写 `Array.prototype.entries`
51. 手写 `Array.prototype.keys`
52. 手写 `Array.prototype.values`
53. 手写 `Array.from`
54. 手写 `Array.of`
55. 手写 `Array.isArray`
56. 手写数组去重（至少 5 种方法）
57. 手写数组扁平化（至少 3 种方法）
58. 手写数组求最大值（至少 4 种方法）
59. 手写数组求最小值
60. 手写数组求和
61. 手写数组平均值
62. 手写数组随机打乱（Fisher-Yates 洗牌算法）
63. 手写数组分块（chunk），如 [1,2,3,4,5] 分成 [[1,2],[3,4],[5]]
64. 手写数组差集（difference）
65. 手写数组交集（intersection）
66. 手写数组并集（union）
67. 手写数组补集（complement）
68. 手写数组计数，如 [1,1,2,3] => {1:2, 2:1, 3:1}
69. 手写数组分组（groupBy）
70. 手写数组排序——冒泡排序
71. 手写数组排序——选择排序
72. 手写数组排序——插入排序
73. 手写数组排序——快速排序
74. 手写数组排序——归并排序
75. 手写数组排序——堆排序

---

## 三、字符串方法手写（76-110）

76. 手写 `String.prototype.charAt`
77. 手写 `String.prototype.charCodeAt`
78. 手写 `String.prototype.concat`
79. 手写 `String.prototype.includes`
80. 手写 `String.prototype.indexOf`
81. 手写 `String.prototype.lastIndexOf`
82. 手写 `String.prototype.match`
83. 手写 `String.prototype.replace`
84. 手写 `String.prototype.replaceAll`
85. 手写 `String.prototype.search`
86. 手写 `String.prototype.slice`
87. 手写 `String.prototype.split`
88. 手写 `String.prototype.substring`
89. 手写 `String.prototype.toLowerCase`
90. 手写 `String.prototype.toUpperCase`
91. 手写 `String.prototype.trim`
92. 手写 `String.prototype.trimStart`
93. 手写 `String.prototype.trimEnd`
94. 手写 `String.prototype.padStart`
95. 手写 `String.prototype.padEnd`
96. 手写 `String.prototype.repeat`
97. 手写 `String.prototype.startsWith`
98. 手写 `String.prototype.endsWith`
99. 手写字符串反转
100.  手写首字母大写转换
101.  手写驼峰转换（如 `get-element-by-id` → `getElementById`）
102.  手写下划线转驼峰（如 `get_element_by_id` → `getElementById`）
103.  手写驼峰转下划线（如 `getElementById` → `get_element_by_id`）
104.  手写字符串全排列
105.  手写统计字符串中出现最多的字符
106.  手写去除字符串中连续重复的字符
107.  手写字符串压缩（如 `aaabbc` → `a3b2c1`）
108.  手写字符串解压缩（如 `a3b2c1` → `aaabbc`）
109.  手写判断两个字符串是否为字母异位词（anagram）
110.  手写最长公共前缀

---

## 四、对象方法手写（111-150）

111. 手写 `Object.keys`
112. 手写 `Object.values`
113. 手写 `Object.entries`
114. 手写 `Object.assign`
115. 手写 `Object.create`
116. 手写 `Object.freeze`
117. 手写 `Object.seal`
118. 手写 `Object.defineProperty`
119. 手写 `Object.getOwnPropertyNames`
120. 手写 `Object.getOwnPropertyDescriptor`
121. 手写 `Object.getPrototypeOf`
122. 手写 `Object.setPrototypeOf`
123. 手写 `Object.isExtensible`
124. 手写 `hasOwnProperty` 实现
125. 手写深拷贝（处理循环引用）
126. 手写深拷贝（处理 RegExp、Date、Map、Set 等）
127. 手写深合并（deepMerge）
128. 手写对象扁平化，如 `{a: {b: 1}}` → `{'a.b': 1}`
129. 手写对象反扁平化，如 `{'a.b': 1}` → `{a: {b: 1}}`
130. 手写对象路径取值 `get(obj, 'a.b.c', default)`
131. 手写对象路径赋值 `set(obj, 'a.b.c', value)`
132. 手写对象路径删除 `unset(obj, 'a.b.c')`
133. 手写对象按路径判断是否存在 `has(obj, 'a.b.c')`
134. 手写 `JSON.stringify`（简易版）
135. 手写 `JSON.parse`（简易版）
136. 手写 `JSON.stringify` 处理循环引用
137. 手写对象浅比较 `shallowEqual`
138. 手写对象深度比较 `deepEqual`
139. 手写对象深冻结 `deepFreeze`
140. 手写对象遍历（包括 Symbol 属性）
141. 手写对象属性过滤（omit）
142. 手写对象属性选取（pick）
143. 手写对象属性默认值填充（defaults）
144. 手写对象映射 `mapKeys`
145. 手写对象映射 `mapValues`
146. 手写对象键值反转 `invert`
147. 手写根据函数条件查找对象属性 `findKey`
148. 手写将查询字符串解析为对象 `parseQuery('?a=1&b=2')`
149. 手写将对象转为查询字符串 `stringifyQuery({a:1, b:2})`
150. 手写 Proxy 实现对象私有属性

---

## 五、函数与高阶函数（151-185）

151. 手写 `call` 方法
152. 手写 `apply` 方法
153. 手写 `bind` 方法
154. 手写 `Function.prototype.bind`（支持 `new` 调用）
155. 手写柯里化函数 `curry`
156. 手写偏函数 `partial`
157. 手写反柯里化 `uncurry`
158. 手写函数组合 `compose`
159. 手写函数管道 `pipe`
160. 手写函数记忆化 `memoize`
161. 手写函数只执行一次 `once`
162. 手写函数最多执行 n 次 `before`
163. 手写函数最少执行 n 次后才执行 `after`
164. 手写节流函数 `throttle`
165. 手写防抖函数 `debounce`
166. 手写带立即执行选项的防抖
167. 手写带取消功能的防抖/节流
168. 手写延迟执行函数 `delay`
169. 手写重试函数 `retry(fn, times)`
170. 手写超时执行函数 `timeout(fn, ms)`
171. 手写函数异步串行执行器
172. 手写函数异步并行执行器
173. 手写函数结果缓存（带过期时间）
174. 手写惰性函数
175. 手写尾递归优化函数
176. 手写函数管道（支持异步函数）
177. 手写高阶函数 `tap`（在链式调用中执行副作用）
178. 手写高阶函数 `trace`（调试用，输出中间值）
179. 手写单例模式函数
180. 手写函数 `flow`（类似 lodash flow）
181. 手写函数 `converge`（收敛函数）
182. 手写函数 `juxt`（并列执行多个函数）
183. 手写函数 `identity`（返回自身）
184. 手写函数 `constant`（返回常量）
185. 手写函数 `noop`（空操作函数）

---

## 六、Promise 与异步（186-220）

186. 手写 `Promise`（基础版）
187. 手写 `Promise`（完整版，含 then 链式调用）
188. 手写 `Promise.resolve`
189. 手写 `Promise.reject`
190. 手写 `Promise.all`
191. 手写 `Promise.allSettled`
192. 手写 `Promise.race`
193. 手写 `Promise.any`
194. 手写 `Promise.prototype.finally`
195. 手写 `Promise.prototype.catch`
196. 手写 Promise 并发限制调度器
197. 手写 Promise 顺序执行器
198. 手写 Promise 重试机制
199. 手写 Promise 超时包装
200. 手写 Promise 取消机制
201. 手写 `async/await`（Generator + Promise 实现）
202. 手写 `co` 库（Generator 自动执行器）
203. 手写异步回调转 Promise（promisify）
204. 手写并行执行异步任务（带并发数限制）
205. 手写 `asyncPool` 并发池
206. 手写异步队列
207. 手写异步信号量
208. 手写事件循环模拟
209. 手写 Promise 缓存（请求去重）
210. 手写红绿灯交替切换
211. 手写请求重试（指数退避策略）
212. 手写请求数据缓存与刷新
213. 手写 async 函数的错误处理包装器
214. 手写 Promise 延迟函数 `sleep`
215. 手写 Promise 链式调用的中断
216. 手写限制异步函数执行时间
217. 手写异步任务可取消
218. 手写可观察的 Promise（Observable Promise）
219. 手写 Deferred 对象
220. 手写 Promise 瀑布流执行

---

## 七、DOM 与 BOM（221-245）

221. 手写 `document.getElementById`
222. 手写 `document.getElementsByClassName`
223. 手写 `document.getElementsByTagName`
224. 手写 `document.querySelector`
225. 手写 `document.querySelectorAll`
226. 手写 DOM 节点插入
227. 手写 DOM 节点删除
228. 手写 DOM 节点替换
229. 手写 DOM 节点克隆
230. 手写事件监听器（兼容 IE）
231. 手写事件委托
232. 手写事件代理（支持选择器过滤）
233. 手写自定义 DOM 事件
234. 手写虚拟 DOM（简单版）
235. 手写 DOM Diff 算法
236. 手写 DOM Patch（将 diff 结果应用到真实 DOM）
237. 手写图片懒加载
238. 手写无限滚动加载
239. 手写回到顶部按钮
240. 手写拖拽功能
241. 手写复制到剪贴板
242. 手写全屏切换
243. 手写页面可见性检测
244. 手写 URL 参数解析
245. 手写浏览器本地存储封装（支持过期时间）

---

## 八、事件系统（246-265）

246. 手写 EventEmitter（发布订阅模式）
247. 手写 EventEmitter（支持 once）
248. 手写 EventEmitter（支持 off 取消订阅）
249. 手写 EventEmitter（支持命名空间）
250. 手写事件总线 EventBus
251. 手写观察者模式
252. 手写响应式数据（简单版）
253. 手写 Vue 响应式原理（依赖收集）
254. 手写 Vue 响应式原理（派发更新）
255. 手写 Vue 的 Watcher
256. 手写 Vue 的 Dep
257. 手写 Vue 的 computed
258. 手写 Vue 的 watch
259. 手写 Vue 的 nextTick
260. 手写 Node.js EventEmitter
261. 手写带优先级的事件系统
262. 手写异步事件系统
263. 手写事件冒泡与捕获模拟
264. 手写跨标签页通信（BroadcastChannel）
265. 手写全局状态管理（简易版 Store）

---

## 九、设计模式（266-300）

266. 手写单例模式
267. 手写工厂模式
268. 手写抽象工厂模式
269. 手写建造者模式
270. 手写原型模式
271. 手写适配器模式
272. 手写装饰器模式
273. 手写代理模式
274. 手写外观模式
275. 手写桥接模式
276. 手写组合模式
277. 手写享元模式
278. 手写策略模式
279. 手写模板方法模式
280. 手写观察者模式
281. 手写发布订阅模式
282. 手写迭代器模式
283. 手写责任链模式
284. 手写命令模式
285. 手写备忘录模式
286. 手写状态模式
287. 手写访问者模式
288. 手写中介者模式
289. 手写解释器模式
290. 手写链式调用模式
291. 手写中间件模式（Koa 风格）
292. 手写中间件模式（Redux 风格）
293. 手写惰性求值模式
294. 手写活跃对象模式
295. 手写 Promise 链模式
296. 手写事件驱动模式
297. 手写 MVVM 模式（简易版）
298. 手写 MVC 模式（简易版）
299. 手写 MVP 模式（简易版）
300. 手写依赖注入模式

---

## 十、ES6+ 特性实现（301-340）

301. 手写 `let` 和 `const` 的块级作用域（使用闭包模拟）
302. 手写解构赋值（数组解构）
303. 手写解构赋值（对象解构）
304. 手写展开运算符（对象展开）
305. 手写展开运算符（数组展开）
306. 手写剩余参数（rest parameters）
307. 手写模板字符串
308. 手写 Symbol（简易模拟）
309. 手写 Set 集合
310. 手写 Map 映射
311. 手写 WeakMap（简易模拟）
312. 手写 WeakSet（简易模拟）
313. 手写 `for...of` 迭代器协议
314. 手写 Generator 生成器
315. 手写 Generator 的 yield 委托
316. 手写 Iterator 迭代器
317. 手写可迭代对象（自定义迭代行为）
318. 手写 Proxy 代理（拦截 get）
319. 手写 Proxy 代理（拦截 set）
320. 手写 Proxy 代理（拦截 has）
321. 手写 Proxy 代理（拦截 deleteProperty）
322. 手写 Proxy 代理（拦截 apply）
323. 手写 Reflect.apply
324. 手写 Reflect.get
325. 手写 Reflect.set
326. 手写 Class 语法糖（ES5 实现）
327. 手写 Class 继承（ES5 寄生组合继承）
328. 手写 super 关键字（ES5 模拟）
329. 手写 static 方法（ES5 模拟）
330. 手写 `Array.prototype[Symbol.iterator]`
331. 手写 `String.prototype[Symbol.iterator]`
332. 手写 `Map.prototype[Symbol.iterator]`
333. 手写 `Set.prototype[Symbol.iterator]`
334. 手写 async/await 的 Generator 实现
335. 手写 `Object.getOwnPropertyDescriptors`
336. 手写 `Object.values` / `Object.entries`（ES5 实现）
337. 手写 `String.prototype.padStart` / `padEnd`（ES5 实现）
338. 手写 `Array.prototype.includes`（ES5 实现）
339. 手写 `Object.is`（ES5 实现）
340. 手写 `Promise.allSettled`（使用 Promise.all 实现）

---

## 十一、工具函数与 Lodash（341-385）

341. 手写 `_.debounce`
342. 手写 `_.throttle`
343. 手写 `_.cloneDeep`
344. 手写 `_.merge`
345. 手写 `_.get`
346. 手写 `_.set`
347. 手写 `_.has`
348. 手写 `_.unset`
349. 手写 `_.pick`
350. 手写 `_.omit`
351. 手写 `_.defaults`
352. 手写 `_.find`
353. 手写 `_.findIndex`
354. 手写 `_.groupBy`
355. 手写 `_.keyBy`
356. 手写 `_.countBy`
357. 手写 `_.flatten`
358. 手写 `_.flattenDeep`
359. 手写 `_.difference`
360. 手写 `_.intersection`
361. 手写 `_.union`
362. 手写 `_.uniq`
363. 手写 `_.uniqBy`
364. 手写 `_.chunk`
365. 手写 `_.compact`（去除假值）
366. 手写 `_.zip`
367. 手写 `_.unzip`
368. 手写 `_.range`
369. 手写 `_.shuffle`
370. 手写 `_.sample`
371. 手写 `_.size`
372. 手写 `_.isEmpty`
373. 手写 `_.isEqual`
374. 手写 `_.isNil`（null 或 undefined）
375. 手写 `_.isNaN`
376. 手写 `_.isNumber`
377. 手写 `_.isString`
378. 手写 `_.isFunction`
379. 手写 `_.isArray`
380. 手写 `_.isObject`
381. 手写 `_.mapKeys`
382. 手写 `_.mapValues`
383. 手写 `_.invert`
384. 手写 `_.once`
385. 手写 `_.memoize`

---

## 十二、数据结构（386-410）

386. 手写栈（Stack）
387. 手写队列（Queue）
388. 手写双端队列（Deque）
389. 手写链表（LinkedList）
390. 手写双向链表（DoublyLinkedList）
391. 手写循环链表（CircularLinkedList）
392. 手写集合（Set）
393. 手写字典/映射（Map）
394. 手写哈希表（HashTable）
395. 手写二叉搜索树（BST）
396. 手写 AVL 树
397. 手写字典树（Trie）
398. 手写堆（最小堆/最大堆）
399. 手写优先队列
400. 手写图（Graph）——邻接矩阵表示
401. 手写图（Graph）——邻接表表示
402. 手写图的广度优先遍历（BFS）
403. 手写图的深度优先遍历（DFS）
404. 手写图的拓扑排序
405. 手写图的 Dijkstra 最短路径
406. 手写并查集（Union-Find）
407. 手写跳表（SkipList）
408. 手写 LRU 缓存
409. 手写 LFU 缓存
410. 手写布隆过滤器（BloomFilter）

---

## 十三、算法与排序（411-440）

411. 手写冒泡排序
412. 手写选择排序
413. 手写插入排序
414. 手写希尔排序
415. 手写归并排序
416. 手写快速排序
417. 手写堆排序
418. 手写计数排序
419. 手写桶排序
420. 手写基数排序
421. 手写二分查找（递归版）
422. 手写二分查找（迭代版）
423. 手写二分查找（查找第一个等于目标值）
424. 手写二分查找（查找最后一个等于目标值）
425. 手写斐波那契数列（递归）
426. 手写斐波那契数列（动态规划）
427. 手写最长递增子序列（LIS）
428. 手写最长公共子序列（LCS）
429. 手写最长公共子串
430. 手写编辑距离（Levenshtein Distance）
431. 手写 0-1 背包问题
432. 手写完全背包问题
433. 手写爬楼梯问题
434. 手写零钱兑换问题
435. 手写全排列
436. 手写组合
437. 手写字符串匹配（KMP 算法）
438. 手写大数相加
439. 手写大数相乘
440. 手写快速幂

---

## 十四、HTTP 与网络请求（441-460）

441. 手写 XMLHttpRequest 封装
442. 手写 Ajax 请求函数
443. 手写 Fetch API（简易版）
444. 手写 Axios 简易版（支持拦截器）
445. 手写请求重试机制
446. 手写请求取消（AbortController）
447. 手写请求并发控制
448. 手写 JSONP 跨域请求
449. 手写 WebSocket 简易封装
450. 手写 SSE（Server-Sent Events）客户端
451. 手写轮询请求
452. 手写长轮询请求
453. 手写请求缓存
454. 手写请求去重（相同请求合并）
455. 手写上传文件（FormData）
456. 手写下载文件
457. 手写 Base64 编码
458. 手写 Base64 解码
459. 手写 URL 编码/解码
460. 手写 Cookie 操作封装（增删改查）

---

## 十五、正则表达式（461-475）

461. 手写验证手机号
462. 手写验证邮箱
463. 手写验证身份证号
464. 手写验证 URL
465. 手写验证日期格式
466. 手写验证中文
467. 手写验证邮编
468. 手写验证 IPv4 地址
469. 手写验证车牌号
470. 手写千分位分隔符格式化
471. 手写去除 HTML 标签
472. 手写提取 URL 参数
473. 手写模板引擎（正则替换版）
474. 手写密码强度校验
475. 手写驼峰与短横线互转

---

## 十六、性能优化与防抖节流（476-490）

476. 手写防抖函数（基础版）
477. 手写防抖函数（带立即执行）
478. 手写防抖函数（带取消功能）
479. 手写防抖函数（带返回值）
480. 手写节流函数（时间戳版）
481. 手写节流函数（定时器版）
482. 手写节流函数（时间戳 + 定时器版）
483. 手写节流函数（带取消和立即执行）
484. 手写图片懒加载（IntersectionObserver）
485. 手写虚拟列表（Virtual List）
486. 手写虚拟滚动（横向）
487. 手写函数结果缓存（Memoization）
488. 手写 Web Worker 计算任务
489. 手写 requestAnimationFrame 节流
490. 手写双缓冲渲染

---

## 十七、综合与进阶（491-500）

491. 手写简易版 Vue（响应式 + 模板编译）
492. 手写简易版 React（Virtual DOM + Diff）
493. 手写简易版 Redux（createStore + reducer）
494. 手写简易版 React-Redux（connect + Provider）
495. 手写简易版 Vue Router（hash 模式）
496. 手写简易版 Vuex
497. 手写简易版 KoA（中间件机制）
498. 手写简易版 Express（路由 + 中间件）
499. 手写简易版 Webpack（模块打包）
500. 手写简易版 Babel（AST 转换）

---

> 全部 500 道题目涵盖 JavaScript 基础到进阶的各个方面，建议按分类顺序练习，循序渐进。
