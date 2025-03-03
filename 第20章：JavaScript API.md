# 20.10 计时 API



**`Performance 接口由多个 API 构成：`** 

* **`High Resolution Time API`**
* **`Performance Timeline API`**
* **`Navigation Timing API`**
* **`User Timing API`**
* **`Resource Timing API`**
* **`Paint Timing API`**





## 1. High Resolution Time API

**`Date.now() 方法只适用于日期时间相关操作，而且是不要求计时精度的操作。在下面的例子中，函数 foo() 调用前后分别记录了一个时间戳：`**

```javascript
const t0 = Date.now();

foo();

const t1 = Date.now();

const duration - t1 - t0;

console.log(duration);
```



**`考虑如下 duration 会包含意外值的情况。`**

* **`duration 是 0。Date.now() 只有毫秒级精度，如果 foo() 执行足够快，则两个时间戳的值会相等。`** 
* **`duration 是负值或极大值。如果在 foo() 执行时，系统时钟被向后或向前调整了（如切换到夏令时），则捕获的时间戳不会考虑这种情况，因此时间差中会包含这些调整。`** 

**`为此，必须使用不同的计时 API 来精确且准确地度量时间的流逝。High Resolution Time API 定义了 window.performance.now()，这个方法返回一个微秒精度的浮点值。因此，使用这个方法先后捕获的时间戳更不可能出现相等的情况。而且这个方法可以保证时间戳单调增长。`**

```javascript
const t0 = performance.now();
const t1 = performance.now();

console.log(t0);
console.log(t1);

const duration = t1 - t0;

console.log(duration);
```



**`performance.now() 与 Date.now() 的区别`** 

- **`performance.now() 返回的是高精度的时间戳，可以达到微秒级别，而 Date.now() 返回的是毫秒级别的时间戳。`** 
- **`performance.now() 返回的时间戳是相对于 Performance.timeOrigin 的，不受系统时钟调整的影响，而 Date.now() 返回的时间戳是相对于 Unix epoch 的，可能会受到系统时钟调整的影响。`** 
- **`出于安全原因，performance.now() 返回的时间可能被四舍五入，使其不那么可预测。`** 

**`因此，在需要高精度和稳定性的场景下，建议使用 performance.now()。`** 



