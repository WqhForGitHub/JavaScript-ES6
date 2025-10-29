恭喜大家看到最后一章了。如果你完整阅读了本书前面的内容，那么你已经对 JavaScript 语言有了深入的理解，知道怎么在 Node 和浏览器中使用它了。本章就作为毕业礼物送给大家吧！这一章会介绍几种重要的编程工具，很多 JavaScript 程序员都经常使用。此外还会介绍对核心 JavaScript 语言的两个使用很广泛的扩展。无论你是否在自己的项目中使用这些工具和扩展，你一定会在其他项目中看到它们，因此至少应该知道它们都是什么。

本章要介绍的工具和语言扩展如下。

- ESLint，辅助发现代码中潜藏的缺陷和风格问题。
- Prettier，用于以标准方式格式化 JavaScript 代码。
- Jest，一种编写 JavaScript 单元测试的一站式解决方案。
- npm，用于管理和安装程序依赖的软件库。
- webpack、Rollup 和 Parcel 等代码打包工具，用于把你写的 JavaScript 代码模块转换为在网页中使用的单个代码文件。
- Babel，用于把使用最前沿特性（或语言扩展）的 JavaScript 代码转译为可以在当前浏览器中运行的 JavaScript 代码。
- JSX 语言扩展（React 框架使用），可以让我们用类似 HTML 标记的 JavaScript 表达式描述用户界面。
- Flow 语言扩展（或类似的 TypeScript 扩展），可以让我们为 JavaScript 代码添加类型注解，通过类型检查保证类型安全。

本章不会面面俱到地讲解这些工具和扩展。我们的目标只是给出足够多的背景，让你能理解它们为什么有用，以及什么时候可以使用它们。本章的所有内容在 JavaScript 编程领域都已经广泛使用，无论你决定采用哪个工具或扩展，都可以在网上找到很多文档和教程。

# 17.1 使用 ESLint 检查代码

在编程领域，lint 是指代码虽然技术上正确，但书写却不够规范，甚至可能有 bug，或者没有达到最优。linter 是用于检查代码中 lint 的工具，而 linting 是对代码运行 linter（然后修复代码并删除 lint，让 linter 不再抱怨）的过程。

目前最常用的 JavaScript linter 是 ESLint。如果运行它并花时间实际解决它指出的问题，你的代码会更清晰，更不容易出错。来看下面的代码：

```javascript
var x = 'unused';

export function factorial(x) {
  if (x == 1) {
    return 1;
  } else {
    return x * factorial(x-1)
  }
}
```

如果对这段代码运行 ESLint，可能会看到如下输出：

```plaintext
$ eslint code/ch17/linty.js

code/ch17/linty.js
  1:1  error  Unexpected var, use let or const instead  no-var
  1:5  error  'x' is assigned a value but never used   no-unused-vars
  1:5  warning Strings must use doublequote            quotes
  4:11 error  Expected '===' and instead saw '=='      eqeqeq
  5:1  error  Expected indentation of 8 spaces but found 6  indent
  7:28 error  Missing semicolon                         semi

✖ 6 problems (5 errors, 1 warning)
  3 errors and 1 warning potentially fixable with the `--fix` option.
```

Linter 有时候会让人觉得吹毛求疵。对字符串使用双引号还是单引号真的重要吗？但从另一方面说，正确的缩进可以让代码更容易看懂，而使用 === 和 let 代替 == 和 var 可以让你的代码减少难以发现的 bug。未使用的变量对代码而言是多余的，没有理由留着它们。

ESLint 定义了很多 linting 规则，而且有一个插件生态，可以增加新规则。但 ESLint 也是完全可以配置的，可以定义一个配置文件，让 ESLint 只执行你想让它执行的规则。

# 17.2 使用 Prettier 格式化代码

有些项目使用 linter 的目的是强制编码风格一致，以便团队成员在修改共享的代码时，可以保持相同的编码习惯。编码风格包括代码缩进规则，不过也可以包括提倡使用哪种引号，或者 for 关键字与后面的括号之间是否要空一格。

对于这种通过 linter 强制代码格式的需求，更流行的做法是使用类似 Prettier 的工具来自动解析和重新格式化代码。

假设你写了下面这个函数，逻辑没问题，但格式不符合惯例：

```javascript
function factorial(x)
{
    if(x===1){return 1}
    else{return x*factorial(x-1)}
}
```

对这段代码运行 Prettier 可以修复缩进，添加省略的分号，在二元操作符两侧插入空格，并在 {之后和} 之前插入换行符，最终得到更符合惯例的代码：

```bash
$ prettier factorial.js
function factorial(x) {
  if (x === 1) {
    return 1;
  } else {
    return x * factorial(x - 1);
  }
}
```

如果调用 Prettier 时带了 --write 选项，它只会重新格式化指定的文件，而不会把结果打印出来。如果使用 git 管理源代码，可以通过提交钩子（hook）以 --write 选项调用 Prettier，从而让代码在检入前自动格式化。

如果你配置自己的代码编辑器在每次保存文件时自动运行 Prettier，那会非常好。每次看到自己随便写的代码被自动修正，我都感到很欣慰。

Prettier 接受配置，但选项不多。比如可以选择最大行长度、缩进数、是否使用分号、字符串使用单引号还是双引号，等等。一般来说，Prettier 的默认选项还是比较合适的。只要在项目中采用 Prettier，就永远不用再担心代码格式化了。

从个人角度讲，我非常喜欢在 JavaScript 项目中使用 Prettier。不过，我并没有在本书代码中使用它，因为很多代码都有我手工垂直对齐的注释。这些注释会被 Prettier 弄乱。

# 17.3 使用 Jest 做单元测试

对于任何重要的项目而言，编写测试都是重要的一环。JavaScript 这样的动态语言支持测试框架，可以大幅减少编写测试的工作量，甚至能让写测试变得很好玩！JavaScript 有很多测试工具和库，很多是以模块化方式编写的，因此可以选择一个作为测试运行器，另一个作为断言库，还有一个用来模拟数据。不过，本节只会介绍 Jest，它是一个囊括所有测试功能的流行框架。

假设你写了下面这个函数：

```javascript
const getJSON = require('./getJSON.js');

/**
 * getTemperature() 接收一个城市名作为参数，
 * 返回一个期约，解决该城市当前的华氏温度问题
 * 它依赖一个返回摄氏温度的（假）Web 服务
 */
module.exports = async function getTemperature(cty) {
  // 从 Web 服务取得摄氏度
  let c = await getJSON(
    'https://global temps.example.com/api/city/{city}.towerCast()'
  );
  // 转换为华氏温度并返回
  return (c * 5 / 9) + 32; // 特别：再次确认这个公式
};
```

针对这个函数的测试应该能够验证 getTemperature () 会访问正确的 URL，而且能够实现温度的正确转换。可以像下面这样编写一个基于 Jest 的测试，这段代码定义了 getJSON () 的一个模拟实现，让测试不会真正发送网络请求。而且由于 getTemperature () 是个异步函数，测试本身也是异步的。虽然测试异步函数比较棘手，但 Jest 会让它变得相对简单：

```javascript
// 导入要测试的函数
const getTemperature = require('./getTemperature.js');
// 模拟 getTemperature() 依赖的 getJSON() 模块
jest.mock('./getJSON');
const getJSON = require('./getJSON');

// 告诉模拟的 getJSON() 函数返回一个已经解决的期约
// 兑现值为 0
getJSON.mockResolvedValue(0);

// 以下是对 getTemperature() 的测试
describe('getTemperature()', () => {
  	// 第一个测试。确保 getTemperature()
  	// 以预期 URL 调用 getJSON()
  	test('Invokes the correct API', async () => {
        let expectedURL = 'https://global temps.example.com/api/city/vancouver';
        let t = await getTemperature('vancouver');
        // Jest 会记住自己是怎么被调用的，我们可以检查
    	expect(getJSON).toHaveBeenCalledWith(expectedURL);
  	});
	// 第二个测试，验证 getTemperature()
    // 正确地把摄氏温度转换为了华氏温度
    test("Converts C to F correctly", async () => {
      getJSON.mockResolvedValue(0);        // 如果 getJSON 返回摄氏 0 度
      expect(await getTemperature("x")).toBe(32); // 期待结果是华氏 32 度

      // 摄氏 100 度应该转换为华氏 212 度
      getJSON.mockResolvedValue(100);      // 如果 getJSON 返回摄氏 100 度
      expect(await getTemperature("x")).toBe(212); // 期待结果是华氏 212 度
    });
});
```

写完测试后，可以使用 jest 命令运行它，然后我们发现有一个测试失败了：

```bash
$ jest getTemperature
FAIL ch17/getTemperature.test.js
getTemperature()
  ✓ Invokes the correct API (4ms)
  ✕ Converts C to F correctly (3ms)

  ● getTemperature() › Converts C to F correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: 212
    Received: 87.55555555555556

      29 |         // 摄氏 100 度应该转换为华氏 212 度
      30 |         getJSON.mockResolvedValue(100); // 如果 getJSON 返回摄氏 100 度
    > 31 |         expect(await getTemperature("x")).toBe(212); // 则为华氏 212 度
         |                                            ^
      32 |       });
      33 |     });
      34 |

      at Object.<anonymous> (ch17/getTemperature.test.js:31:43)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        1.403s
Ran all test suites matching /getTemperature/i.
```

这是因为 getTemperature () 的实现使用了错误的摄氏温度到华氏温度的转换公式：乘 5 除 9，而不是乘 9 除 5。如果我们改正公式再跑一次测试，就可以看到测试通过。此外，如果运行 jest 时加上 --coverage 选项，它还会计算并显示测试的代码覆盖率：

```bash
$ jest --coverage getTemperature
PASS ch17/getTemperature.test.js
getTemperature()
  ✓ Invokes the correct API (3ms)
  ✓ Converts C to F correctly (1ms)
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------|---------|----------|---------|---------|-------------------
All files        |    71.43|      100 |    33.33|    83.33|                   
getJSON.js       |        0|      100 |       0 |        0| 2                 
getTemperature.js|      100|      100 |     100 |      100|                   
-----------------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.508s
Ran all test suites matching /getTemperature/i.
```

对于我们测试的模块而言，运行测试得到了 100% 的代码覆盖率，这个结果是我们想要的。它只对 getJSON () 给出了不完整的覆盖率，但因为那个模块是模拟的，我们并没有真的想测试它，所以也是符合预期的。

# 17.4 使用 npm 管理依赖包

在现代软件开发中，稍微复杂点的程序都会依赖一些第三方软件库。比如，使用 Node 来写 Web 服务器，可能就会用到 Express 框架。如果要写一个在浏览器中展示的用户界面，那可能会使用 React、LitElement 或 Angular 这样的前端框架。如果有一个包管理工具就可以让发现和安装第三方软件包更方便。同样重要的是，包管理工具可以跟踪你的代码依赖哪些包，并把这些信息保存到一个文件中。这样当别人也想尝试运行你的程序时，他们可以下载你的代码以及你的依赖列表，然后使用自己的包管理工具安装你的代码需要的所有第三方包。

npm 是一个使用 Node 打包而成的包管理器，16.1.5 节介绍过。只不过，npm 不仅在 Node 服务端编程中很重要，对客户端 JavaScript 编程同样也很重要。

如果要尝试别人的 JavaScript 项目，在下载其代码后，通常第一件事就是键入 `npm install`。这个命令会读取 `package.json` 文件中的依赖列表，并下载项目依赖的第三方包并保存到 `node_modules` 目录中。

也可以输入 `npm install <package-name>` 在项目的 `node_modules` 目录安装特定的包：

```bash
$ npm install express
```

除了使用包名来安装依赖之外，npm 也会在项目的 `package.json` 文件中添加一条记录。这样把依赖记录下来可以让别人只键入 `npm install` 就可以安装全部依赖。

还有一种依赖只对项目的开发者有用，项目运行的时候并不需要。比如，项目中使用 Prettier 来保证代码格式统一，但 Prettier 属于 “开发依赖”，安装它的时候可以添加 `--save-dev`：

```bash
$ npm install --save-dev prettier
```

有时候，还可能需要全局安装某个开发者工具，从而即便在没有 `package.json` 文件和 `node_modules` 目录的地方也可以使用。为此可以在安装依赖时添加 `-g`（即 global，全局）选项：

```bash
$ npm install -g eslint jest
/usr/local/bin/eslint -> /usr/local/lib/node_modules/eslint/bin/eslint.js
/usr/local/bin/jest -> /usr/local/lib/node_modules/jest/bin/jest.js
+ jest@24.9.0
+ eslint@6.7.2
added 653 packages from 414 contributors in 25.596s

$ which eslint
/usr/local/bin/eslint
$ which jest
/usr/local/bin/jest
```

除了 `install` 命令之外，npm 还支持 `uninstall` 和 `update` 命令，用于删除和更新依赖。此外 npm 还有一个有意思的 `audit` 命令，可以找到并修复依赖中的安全漏洞：

```plaintext
$ npm audit --fix

=== npm audit security report ===

found 0 vulnerabilities
in 876354 scanned packages
```

在项目中本地安装 ESLint 等工具时，eslint 脚本会保存在 `./node_modules/.bin/eslint` 目录，因此运行命令比较麻烦。好在 npm 也附带了一个 `npx` 命令，这样就可以用 `npx eslint` 或 `npx jest` 命令来运行本地安装的工具（如果用 npx 运行没有安装过的工具，它会自动为你安装）。

维护 npm 的公司也在维护 [https://npmjs.com](https://npmjs.com/) 包仓库，其中托管着成千上万的开源包。不过并不是只有使用 npm 才能访问这个包仓库，使用 yarn 或 pnpm 也可以。

# 17.5 代码打包

如果要写一个在浏览器中运行的大型 JavaScript 项目，可能会用到代码打包工具，特别是在使用的外部库是以模块形式提供的时候。Web 开发者已经使用 ES6 模块（参见 10.3 节）很多年了，最初浏览器尚未支持 `import` 和 `export` 关键字。为了使用 ES6 模块，程序员使用代码打包工具从程序的主入口（或多入口）开始，跟着 `import` 指令树，从而找到程序依赖的所有模块。然后把所有独立的模块文件组合成一个 JavaScript 代码包，并重写 `import` 和 `export` 指令让代码可以在这种新形式下运行。结果是一个代码文件，让不支持模块的浏览器可以加载运行。

ES6 模块今天已经得到浏览器的普遍支持，但 Web 开发者仍然倾向于使用代码打包工具，至少在发布产品代码时要使用。开发者发现用户在首次访问网站时，相比于加载多个小型模块，加载一个中等大小的代码包时用户体验最佳。

>众所周知，Web 性能是一个棘手的问题，需要考虑很多变数，包括浏览器厂商的持续改进。因此要确保浏览器最快地加载代码，唯一的方式是全面测试和仔细度量。要记住有一个变数始终是可控的，那就是代码大小。更少的 JavaScript 代码肯定比更多的 JavaScript 代码加载和运行更快。

市面上有很多优秀的 JavaScript 打包工具可供选择，其中常用的有 webpack、Rollup 和 Parcel。打包工具的基本功能大同小异，区别在于配置方式和使用门槛。webpack 出现的时间比较早，拥有庞大的插件生态，高度可配置，而且支持比较旧的非模块库。但 webpack 也比较复杂，很难配置。相对地，Parcel 的目标则是以零配置方式做正确的事。

除了基本的打包功能之外，打包工具也会提供其他一些特性。

- 有些程序可能有多个入口。比如，多页 Web 应用可以为每个页面都写一个入口。打包工具通常支持为每个入口创建一个代码包，或者生成一个支持多入口的独立包。
- 函数可以以函数式而非静态形式（参见 10.3.6 节）使用 `import()`，避免在程序启动时加载所有代码，而是在需要时再动态加载。这样通常会提升程序的初始加载速度。支持 `import()` 的打包工具可以生成多个代码包，一个在启动时加载，其他则在需要时动态加载。如果你的程序中只有少量 `import` 块共享了依赖，而且它们加载的依赖相对独立，那么这样做效果还好。但如果动态加载的模块共享了依赖，打包工具就很难知道该生成多少个包了，这时候很可能需要手工配置告诉打包工具怎么去做。
- 打包工具通常会输出 ** 源代码映射（source map）** 文件，包含源代码行号与输出代码行号的映射。这样可以方便浏览器开发者工具自动显示 JavaScript 错误（在原始代码打包前的位置）。
- 有时候在向程序中导入一个模块时，实际上只会用到其中少量特性。优秀的打包工具会分析代码，找出未使用的部分并在打包时排除它们。这个特性也有一个形象的名字，叫作**摇树优化（tree shaking）**。
- 打包工具通常有某种基于插件的架构，支持插件导入和打包实际上并非 JavaScript 代码的文件。假设你的程序包含一个大型的 JSON 数据结构，可以配置打包工具把这些数据结构转移到一个独立的 JSON 文件中，然后再使用类似 `import widgets from "./big-widget-list.json"` 这样的声明导入它。类似 `import` 指令入 JavaScript 代码的 Web 开发者可以使用打包工具插件让自己能通过 `import` 指令引入 CSS 文件。不过要注意的是，导入任何非 JavaScript 文件，都是在使用非标准 JavaScript 扩展，因而会导致你的代码依赖打包工具。

* 在像 JavaScript 这样不要求编译的语言中，运行打包工具有点类似于增加了编译步骤，导致每次改动代码后，如果不运行打包工具，浏览器就无法运行你的代码。打包工具通常支持文件系统监控，可以检测项目目录下文件的修改，自动重新生成必要的代码包。有了这个特性，你可以像往常一样保存文件，然后刷新浏览器就能看到效果。

- 有些打包工具也支持 “热模块替换” 开发模式，即每次重新生成代码包，都会自动把它们加载到浏览器。在这种模式下，开发者能体验到一种魔幻的感觉，但在底层实现这个模式需要一些机巧，而且这种模式不适合所有项目。

# 17.6 使用 Babel 转译

Babel 是一个编译工具，可以把使用现代语言特性编写的 JavaScript 代码编译为不使用那些现代语言特性的 JavaScript 代码。因为是把 JavaScript 代码编译成 JavaScript 代码，Babel 有时候也被称为 “转译器” (transpiler)。Babel 的目的就是让开发者可以使用 ES6 及之后的新语言特性，同时仍然可以兼容那些只支持 ES5 的浏览器。

类似乘方操作符 `**` 和箭头函数这样的语言特性比较容易转换为 `Math.pow()` 和 `function` 表达式。但另一些语言特性，比如 `class`，就需要更复杂的转换。一般来说，Babel 输出的代码并没有考虑人类的易读性。不过，跟打包工具类似，Babel 也可以生成源码映射，保存转换后的代码与原始代码位置之间的映射，这对使用转换后的代码特别有帮助。

浏览器厂商在跟进 JavaScript 语言发展方面比以往好了很多。今天，需要把箭头函数和类声明编译为 ES5 的场景已经越来越少。但对于想使用最前沿特性（如数值字面量中的下划线分隔符）的人来说，Babel 仍然是有用的。

与本章介绍的多数工具类似，也可以使用 `npm` 安装 Babel，使用 `npx` 运行它。Babel 读取 `.babelrc` 配置文件，获取你对如何转换 JavaScript 的要求。Babel 定义了可以根据想使用的语言扩展以及转换为标准语言特性的激进程度来选择的 “预设” (preset)。其中一个比较有意思的 Babel 预设是用于代码压缩的（通过删除注释、空格和重命名变量等）。

如果同时使用 Babel 和代码打包工具，你应该可以设置打包工具在打包时自动对 JavaScript 文件运行 Babel。这样可以简化产生可运行代码的过程。比如，`webpack` 支持 `babel-loader` 模块，安装后可以配置它对每个要打包的 JavaScript 模块运行 Babel。

今天，虽然转换核心 JavaScript 语言的需求已经变少了，但 Babel 仍然常用于转换对语言的非标准扩展。接下来我们会介绍其中两个这样的语言扩展。

# 17.7 JSX：JavaScript 中的标记表达式

JSX 是对核心 JavaScript 的扩展，它使用 HTML 风格的语法定义元素树。JSX 与构建用户界面的 React 框架联系最为紧密。在 React 中，这个使用 JSX 定义的元素树最终会被渲染为 HTML 而进入浏览器。即便你自己没有打算使用 React，它那么流行也意味着你一定能看到使用 JSX 的代码。本节解释要理解 JSX 需要知道什么（本节介绍 JSX 语言扩展，而不是 React，所以只会介绍理解 JSX 语法所需的必要 React 背景）。

可以把 JSX 元素想象为一种新的 JavaScript 表达式语法。JavaScript 字符串字面量是以分号来定界的，而正则表达式是以斜杠来定界的。同样，JSX 表达式字面量是以尖括号来定界的。下面是一个简单的 JSX 赋值表达式：

```js
let line = <hr/>;
```

如果你使用 JSX，那么需要使用 Babel（或类似工具）把 JSX 表达式编译为常规 JavaScript。这个转换本身很简单，为此有些开发者选择使用 React 而不使用 JSX。Babel 会把上面赋值语句中的 JSX 表达式转换为下面这个简单的函数调用：

```js
let line = React.createElement("hr", null);
```

JSX 语法类似 HTML，而且与 HTML 元素类似，React 元素也可以像下面这样声明属性：

```js
let image = <img src="logo.png" alt="The JSX logo" hidden/>;
```

当一个元素包含一个或多个特性时，特性会变成对象的属性，作为第二个参数传给 `createElement()`：

```js
let image = React.createElement("img", {
    src: "logo.png",
    alt: "The JSX logo",
    hidden: true
});
```

与 HTML 元素类似，JSX 元素可以将字符串或其他元素作为子元素。就像 JavaScript 的算术操作符可以用来表达任意复杂度的算术表达式一样，JSX 元素也可以任意嵌套，从而创建一棵元素树：

```js
let sidebar = (
    <div className="sidebar">
        <h1>title</h1>
        <hr/>
        <p>This is the sidebar content</p>
    </div>
);
```

常规 JavaScript 函数调用表达式也可以嵌套任意深度，而这些嵌套的 JSX 表达式会转换为一组嵌套的 `createElement()` 调用。如果 JSX 元素有子元素，那些子元素（字符串或其他 JSX 元素）会作为第三个及后续参数：

```javascript
let sidebar = React.createElement(
  "div", { className: "sidebar" }, // 外部调用创建 <div>
  React.createElement("h1", null, // 这是 <div> 的第一个子元素
    "title"), // 及它的第一个子元素
  React.createElement("hr", null), // 这是 <div> 的第二个子元素
  React.createElement("p", null, // 及第三个子元素
    "This is the sidebar content")
);
```

`React.createElement()` 的返回值是一个普通的 JavaScript 对象，React 可以用来渲染在浏览器窗口中的输出。因为本节只涉及 JSX 语法，不介绍 React，所以我们不会深入介绍返回的 Element 对象或渲染流程等细节。需要指出的是，可以配置 Babel 把 JSX 元素编译为对一个不同函数的调用，因此如果把 JSX 语法想象为表达嵌套数据结构的一种有用的方式，那你可以把 JSX 用于非 React 的用途。

JSX 语法的一个重要特性是可以在 JSX 表达式中嵌入常规的 JavaScript 表达式。在 JSX 表达式中，位于花括号内的文本会被当成普通的 JavaScript 来解释。这些嵌套的表达式可以用于生成属性值，也可以用于创建子元素。例如：

```javascript
function sidebar(className, title, content, drawLine=true) {
  return (
    <div className={className}>
      <h1>{title}</h1>
      { drawLine && <hr /> }
      <p>{content}</p>
    </div>
  );
}
```

这个 `sidebar()` 函数返回一个 JSX 元素。它接收 4 个参数，会在 JSX 元素中使用。花括号语法让人联想到在字符串中包含 JavaScript 表达式的 `${}` 语法。既然我们知道 JSX 会编译成函数调用，那么自然也就可以理解它能够包含任意表达式了，因为函数调用也可以写成任意表达式的形式。上面的代码经 Babel 转会变成这样：

```javascript
function sidebar(className, title, content, drawLine=true) {
  return React.createElement("div", { className: className },
    React.createElement("h1", null, title),
    drawLine && React.createElement("hr", null),
    React.createElement("p", null, content)
  );
}
```

这段代码很好理解。花括号不见了，传入的函数参数以自然的方式被插入 `React.createElement()` 中。注意，我们巧妙地使用了 `drawLine` 参数和短路操作符 `&&`。如果调用 `sidebar()` 时只传 3 个参数，那么 `drawLine` 的默认值为 `true`，外部 `createElement()` 调用的第 4 个参数就是 `<hr />` 元素。但如果 `sidebar()` 的第 4 个参数传入了 `false`，那么外部 `createElement()` 调用的第 4 个元素就会求值为 `false`，因此就不会创建 `<hr />` 元素。像这样使用 `&&` 操作符是 JSX 中常见的手法，即根据某个表达式的值包含或排除子元素（这个手法之所以可以在 React 中使用，是因为 React 会忽略值为 `false` 或 `null` 的元素，对它们不生成任何输出）。

在 JSX 表达式中使用 JavaScript 表达式时，并不限于前面例子中出现的简单字符串值或布尔值。任何 JavaScript 值都是允许的。事实上，在 React 编程中使用对象、数组和函数都相当常见。比如，再看下面这个例子：

```javascript
// 传入一个字符串数组和一个回调函数，返回一个 JSX 元素
// 表示一个 HTML <ul> 列表，包含一组 <li> 元素
function list(items, callback) {
  return (
    <ul style={{ padding: 18, border: "solid red 4px" }}>
      {items.map((item, index) => (
        <li onClick={() => callback(index)} key={index}>{item}</li>
      ))}
    </ul>
  );
}
```

这个函数使用一个对象字面量作为 `<ul>` 元素的 `style` 属性的值（注意这里的双层花括号是必需的）。这个 `<ul>` 元素只有一个子元素，但这个子元素的值是一个数组。子元素数组是通过 `map()` 函数根据输入数组创建的 `<li>` 元素数组（在 React 中可行是因为 React 库会在渲染它们时将子元素压平。具有一个数组子元素的元素，与每个数组元素都是子元素的元素是一样的）。最后，每个嵌套的 `<li>` 元素都有一个 `onClick` 事件处理程序属性，值为一个箭头函数。这段 JSX 代码会编译为如下 JavaScript 代码（已经使用 Prettier 格式化了）：

```javascript
function list(items, callback) {
  return React.createElement(
    "ul",
    { style: { padding: 18, border: "solid red 4px" } },
    items.map((item, index) =>
      React.createElement(
        "li",
        { onClick: () => callback(index), key: index },
        item
      )
    )
  );
}
```

JSX 中对象表达式的另一种使用场景是使用对象扩展操作符（参见 6.10.4 节）一次性指定多个属性。假设你发现自己要写很多重复一组公共属性的 JSX 表达式，可以先把这些属性定义在一个对象中，然后再把它们 “扩展到” JSX 元素中：

```javascript
let hebrew = { lang: "he", dir: "rtl" }; // 指定语言和方向
let shalom = <span className="emphasis" {...hebrew}>שָׁלוֹם</span>;
```

Babel 会把这种语法编译为一个 `_extends()` 函数（这里省略）调用，包含 `className` 属性和 `hebrew` 对象中的属性：

```javascript
let shalom = React.createElement(
  "span",
  _extends({ className: "emphasis" }, hebrew),
  "\u05E9\u05D5\u05DD"
);
```

最后，JSX 还有一个更重要的特性没有介绍。如前所述，所有 JSX 元素都以一个左尖括号紧跟一个标识符开头。如果这个标识符的第一个字母小写（像前面那些例子中一样），则这个标签将以字符串形式传给 `createElement()`。但如果这个标识符的第一个字母大写，那么它就会被当成真正的标识符，最终传给 `createElement()` 的第一个参数是该标识符的 JavaScript 值。这意味着 JSX 表达式 `<Sidebar>` 编译后的 JavaScript 代码会把全局 `Main` 变量传给 `React.createElement()`。

对于 React 而言，给 `createElement()` 第一个参数传非字符串值的能力是创建组件所必需的，组件是一种用简单（带有大写组件名的）JSX 表达式表示（使用小与 HTML 标签名的）更复杂表达式的方式。

在 React 中定义组件的最简单方式就是写一个函数，让它接收一个 `props` 对象参数，并返回一个 JSX 表达式。`props` 对象就是一个简单的 JavaScript 对象，表示属性值，与传给 `createElement()` 第二个参数的对象一样。比如，下面就是 `Sidebar()` 函数的一种写法：

```javascript
function Sidebar(props) {
  return (
    <div>
      <h1>{props.title}</h1>
      {props.drawLine && <hr />}
      <p>{props.content}</p>
    </div>
  );
}
```

这个 `Sidebar()` 函数跟前面的 `Sidebar()` 函数非常类似，但现在这个函数名字的首字母大写了，而且只接收一个对象参数，而不是多个参数。这样它就成了一个 React 组件，可以在 JSX 表达式中用来替换 HTML 标签名：

```javascript
let sidebar = <Sidebar title="Something snappy" content="Something wise" />;
```

这个 `<Sidebar />` 元素会被编译成下面这样：

```javascript
let sidebar = React.createElement(Sidebar, {
  title: "Something snappy",
  content: "Something wise"
});
```

对于这个简单的 JSX 表达式，React 在渲染时会把第二个参数（`Props` 对象）传给第一个参数（`Sidebar` 函数），并使用这个函数返回的 JSX 表达式来渲染最终的 `<Sidebar>` 标记。

# 17.8 使用 Flow 检查类型

Flow 也是一个语言扩展，让我们可以为 JavaScript 代码添加类型注解，同时它也是一个检查 JavaScript 代码中类型错误（包括但不仅限于此）的工具。要使用 Flow，需要一开始就使用 Flow 语言扩展语法代码添加类型注解，然后可以运行 Flow 工具分析代码执行类型错误，等修复错误并准备好运行后，可以使用 Babel（带有合适的插件和 / 或类库）从代码中剥离 Flow 类型注解（关于 Flow 的更多细节，让大家疑惑的是没有什么新语法是 Flow 必须要编译或转换的，你写的是普通 JavaScript 代码的语法注解，而 Babel 要做的也只是剥离这些注解，返回标准 JavaScript 代码）。

>TypeScript 与 Flow
>
>TypeScript 是 Flow 的一个非常流行的替代品。TypeScript 也是一种 JavaScript 扩展，但它除了类型还添加了其他语言特性。TypeScript 编译器 `tsc` 负责把 TypeScript 程序编译为 JavaScript 程序，在此期间会像 Flow 那样分析并报告类型错误。`tsc` 不是 Babel 插件，而是一个独立的编译器。
>
>TypeScript 中简单的类型注解通常与 Flow 中同样的注解写法相同。对于更高级的类型注解，两种扩展语法存在差异，但它们的意图和价值相同。本节的目标是解释类型注解和静态代码分析的好处。我们的示例中将使用 Flow，但这里演示的一切也都可以使用 TypeScript 来实现，只需要少量语法修改即可。
>
>TypeScript 是 2012 年发布的，早于 ES6，当时 JavaScript 还没有 `class` 关键字。当时 TypeScript 是一个相对窄的语言扩展，只给 JavaScript 增加了 `for/of` 循环、模块、契约。Flow 是一个经过良好设计的新语言，顾名思义，为 JavaScript 添加了类型注解。TypeScript 的主要目的，也是人们今天使用它的原因。但类型并不是 TypeScript 给 JavaScript 添加的唯一特性。比如，TypeScript 语言有 `enum` 和 `namespace` 关键字，都是 JavaScript 中不存在的。2020 年，TypeScript 与 IDE 和代码编辑器（主要是 VSCode，也是微软的产品）的集成度要高于 Flow。
>
>不管怎么说，本书讲的都是 JavaScript，本节介绍 Flow 而不介绍 TypeScript 是不想把焦点从 JavaScript 身上转移开。但这里介绍的给 JavaScript 添加类型的所有内容，对你在项目中使用 TypeScript 同样也会有帮助。

使用 Flow 需要一定的投入，但我发现对大中型项目来说，这些额外的努力是值得的。向代码中添加类型注解、每次修改代码都要运行 Flow，以及修改它报告的类型错误都需要花时间。但相应地，Flow 会养成良好的编程习惯，杜绝因为走捷径而导致错误。我在项目中使用 Flow 的时候，总人会因发现自己代码中存在的很多错误而震惊。在这些问题成为隐患之前先消灭它们是一件非常快意的事，也让我对自己代码的正确性更有信心。

第一次使用 Flow 时，不太容易理解它为什么会报错。但经过实践后，我逐渐理解了它的错误消息，明白了通常只要做很少的修改就能够让代码更安全，也更能让 Flow 满意注 ¹。如果你对 JavaScript 本身还没有深入的理解，我并不推荐你使用 Flow。但只要你对这门语言有了信心，在 JavaScript 项目中引入 Flow 肯定可以让你的编程技能更上一层楼。而这也正是我在本书最后专门用一节来写 Flow 教程的原因。因为学习 JavaScript 的类型系统能够让人洞察到另一种编程层次或编程风格。

本节是一个教程，但并不试图全面介绍 Flow。如果你想试试 Flow，势必要花时间通读一遍它的文档：[https://flow.org](https://flow.org/)。另一方面，在不能实际使用 Flow 之前，也不需要掌握它的类型系统。本节对 Flow 用法的简单介绍可以帮你快速上手。

## 17.8.1 安装和运行 Flow

与本章介绍的其他工具类似，可以使用一个包管理工具来安装 Flow 类型检查工具。比如，`npm install -g flow-bin` 或 `npm install --save-dev flow-bin`。如果使用 `-g` 选项全局安装，那可以通过 `flow` 来运行它。如果使用 `--save-dev` 在项目中局部安装，那可以使用 `npx flow` 来运行它。在使用 Flow 做类型检查前，第一次在项目根目录运行 `flow --init` 会创建一个 `.flowconfig` 配置文件。可能你永远也不会修改这个文件，但 Flow 需要通过它知道你的项目根目录在哪里。

运行 Flow 时，它会找到项目中所有的 JavaScript 源代码，但它只会针对其中通过 `// @flow` 注释在顶部 “选择参加” 的文件报告类型错误。这个可选的行为非常重要，这样你就可以在已有项目中使用 Flow，而且可以每次只转换一个文件。而那些尚未转换的文件就不会出现错误或警告来干扰你了。

即使仅仅在文件顶部加上 `// @flow` 注释，Flow 也能够发现你代码中的错误。就算没有使用 Flow 语言扩展，也没有在代码中添加类型注解，Flow 类型检查器仍然能够推断程序中的值，并在发现不一致时给出警告。

来看下面这个 Flow 错误消息：

```javascript
Error ---------------------------------------------------------------------------------------------- variableReassignment.js:6:3

Cannot assign 1 to i.r because:
● property r is missing in number [1].

	2| let i = { r: 0, t: 1 }; // 复数0+1t
[1] 3| for(i = 0; i < 10; t++) { // 循环变量重写
	4|     console.log(i);
	5|     // 流在此处检查错误
	6| t.r = 1; // 流在此处检查错误
```

这里，我们声明变量i并给它赋值了一个对象。然后又使用i作为循环变量，重写了对象。Flow注意到这个问题，并在我们仍然把i当成对象来使用时标示出一个错误（修复这个问题的最简单方案是使用for(let i = 0);把循环变量的作用域限制在循环内部）。

下面是另一个Flow在没有类型注解的情况下检查到的错误：

```javascript
Error ------------------------------------------------------------------------------------------------------------- size.js:3:14

Cannot get x.length because property length is missing in Number [1].

	1| // @flow
	2| function size(x) {
	3|     return x.length;
	4| }
[1] 5| let s = size(1000);
```

Flow看到size()函数只接收一个参数。它不知道这个参数的类型，但看到代码在访问这个参数的length属性。当它看到调用size()函数中传入的是一个数值参数时，就把这一行标记为错误，因为数值没有length属性。

## 17.8.2 使用类型注解

在声明JavaScript变量时，可以给变量添加Flow类型注解，只要在变量名后面加上冒号和类型即可：

```javascript
let message: string = "Hello world";
let flag: boolean = false;
let n: number = 42;
```

即使不给这些变量添加注解，Flow也会知道它们的类型。它知道赋给变量的值，然后一直跟踪。不过，要是添加了类型注解，Flow 就既知道变量类型，也知道你希望该变量始终保持该类型。因此如果使用类型注解，Flow 会在你给变量赋不同类型的值时标示出错误。如果你习惯使用前在函数顶部声明所有变量，那么类型注解会特别有用。

函数参数的类型注解与变量的注解类似，也是在参数名后面加上冒号和类型名。在注解函数时，通常也需要注解函数返回值的类型。返回值类型放在结尾圆括号与开头花括号之间。不返回值的函数使用 Flow 类型 void。

在前面的例子中，我们定义了一个 size() 函数，而且期待它的参数有 length 属性。下面的例子修改了 size() 函数，显式指定了函数期待一个字符串参数，返回一个数值。注意，如果此时再给这个函数传入数组，即使函数可以运行，Flow 也会标示出错误：

```javascript
Error ------------------------------------------------------------------------------------------------------------ size2.js:5:18

Cannot call size with array literal bound to s because array literal [1] is incompatible with string [2].

[2] 2| function size(s: string): number {
	3|		return s.length;
	4| } 
[1] 5| console.log(size([1,2,3]));;
```

箭头函数也可以加类型注解，只是注解会导致本来简洁的语法变复杂：

```javascript
const size = (s: string): number => s.length;
```

要理解 Flow，关键是要知道 JavaScript值 null 对应 Flow 类型 null，而 JavaScript值 undefined 对应 Flow 类型 void。但是 null 和 undefined 都不是任何其他类型的成员（除非显式添加这样一个类型）。如果把函数参数声明为字符串，那么它就必须是字符串。无论传入 null、undefined，还是不传参数（相当于传 undefined），都是错误：

```javascript
Error ------------------------------------------------------------------------------------------------------------ size3.js:3:18

Cannot call size with null bound to s because null [1] is incompatible with string [2].

	1| // @Flow
[2] 2| const size = (s: string): number => s.length;
[1] 3| console.log(size(null));
```

如果想让 null 和 undefined 成为变量或函数参数的合法值，只要在类型前面加个问号即可。例如，使用 ?string 或 ?number 而不是 string 或 number。如果把 size() 函数改为期待 ?string 类型的参数，则传入 null 时 Flow 是不会报错的。但这样它会报另外一个错：

```javascript
Error ------------------------------------------------------------------------------------------------------------ size4.js:3:14

Cannot get s.length because property length is ntsing in null or undefined [1].

	1| // @Flow
	2| function size(s: string): number { 
	3|  	return s.length;
    4| }
	5| console.log(size(null));
```

Flow 在这里告诉我们 s.length 不安全，在上面的代码中，s 可能是 null 或 undefined，而这些值没有 length 属性。这就是 Flow 可以确保我们不会走捷径的地方，如果值可能是 null，Flow 会坚持检查这种情况，然后才允许我们运行任何依赖该值不为 null 的命令：

这里我们可以通过如下修改函数体来解决这个问题：

```javascript
function size(s: string): number { 
    // 在代码执行到这里时，s 可能是字符串或 null 或 undefined。
	if (s === null || s === undefined) { 
        // 在这个块里，Flow 知道 s 是 null 或 undefined。
		return -1;
	} else { 
        // 而在这个块里，Flow 知道 s 是字符串。
		return s.length;
	}
```

在第一次调用这个函数时，参数可能不止一种类型。但通过添加类型检查代码，我们又增加了代码块，让 Flow 知道在这个块中参数一定是字符串。这样再在块中使用 s.length 时，Flow 就不会抱怨了。注意，Flow 不会要求你写这么啰嗦的代码。只把 size() 的函数体替换成 return s ? s.lenght : -1 也可以满足 Flow 的要求。

Flow 语法允许问号出现在任何类型规范前面，表示除了指定类型，也允许 null 和 undefined。问号也可以出现在参数名后面，表示该参数本身可选。因此如果把参数 s 的声明为 null，就意味着调用 size() 时可以不传参数（或传入 undefined，跟 ? string 改为 s?: string，不传一样）。但是，如果传了参数，而且参数不是 undefined，那就必须是字符串。此时，null 不是合法值。

现在我们已经介绍了 string、number、boolean、null 和 void 等原始类型，也演示了怎么用它们给变量声明、函数参数和函数返回值添加注解。接下来几小节介绍 Flow 持的几种较复杂的类型。

## 17.8.3 类

除了原始类型之外，Flow 也支持 JavaScript的所有内置类，允许使用它们的类名作为类型。比如，下面的函数使用类型注解表明调用它时应该传入一个 Date 对象和一个 RegExp 对象：

```javascript
// @flow
// 如果指定日期的 ISO 表示匹配指定的
// 模式则返回 true，否则返回 false。
// 例如 const isTodayChristmas = dateMatches(new Date(), /^\d{4}-12-25T/);
export function dateMatches(d: Date, p: RegExp): boolean {
  return p.test(d.toISOString());
}
```

如果使用 `class` 关键字定义自己的类，那些类也会自动变成有效的 Flow 类型。不过为了使用它们，Flow 要求你必须在类中使用类型注解。特别是，类的每个属性必须有自己的类型声明。下面这个简单的复数类（Complex）演示了这一点：

```javascript
// @flow
export default class Complex {
  // Flow 要求扩展类的语法，
  // 对每个属性都加类型注解
  i: number;
  r: number;
  static t: Complex;

  constructor(r: number, i: number) {
    // 构造函数初始化的任何属性都
    // 要满足上面的 Flow 类型注解
    this.r = r;
    this.i = i;
  }

  add(that: Complex) {
    return new Complex(this.r + that.r, this.i + that.i);
  }
}

// 如果在 Complex 类中没有给属性 i 添加
// 类型注解，Flow 将不会允许这个赋值
Complex.t = new Complex(0, 1);
```

## 17.8.4 对象

描述对象的 Flow 类型看起来很像一个对象字面量，只不过属性值都变成了属性类型。比如，下面这个函数期待一个有数值属性 x 和 y 的对象：

```javascript
// @flow
// 传入一个有数值属性 x 和 y 的对象，
// 返回原点到点 (x, y) 的距离数值
export default function distance(point: {x: number, y: number}): number {
  return Math.hypot(point.x, point.y);
}
```

在上面的代码中，`{x: number, y: number}` 是一种 Flow 类型，就像 `string` 或 `Date` 一样。与其他类型一样，也可以在它的前面加上问号表示允许 `null` 和 `undefined`。

在对象类型内部，可以在任何属性名后面添加问号，表示该属性可选，即可以省略。例如，可以像下面这样写一个可以表示 2D 点或 3D 点的对象类型：

```javascript
{x: number, y: number, z?: number}
```

如果对象类型中的属性没有标记为可选，那它就是必需的。Flow 会在实际值中不存在对应属性时报错。不过，正常情况下 Flow 会允许出现额外的属性。如果给上面的 `distance()` 函数传入的对象有一个 `w` 属性，Flow 不会报错。

如果想让 Flow 严格按照类型注解中出现的属性检查，可以通过在花括号中添加一对竖线来声明确切的对象类型（exact object type）：

```javascript
{| x: number, y: number |}
```

JavaScript 的对象有时候会被用作字典或字符串到值的映射。像这样使用时，属性名提前是不知道的，无法用 Flow 类型来声明。如果这样使用对象，仍然可以使用 Flow 描述这个数据结构。假设有一个对象，其属性是世界主要城市的名字，这些属性的值是对应城市地理位置值的对象。可以像下面这样声明这个数据结构：

```javascript
// @flow
const cityLocations: {[string]: {longitude: number, latitude: number}} = {
  'Seattle': { longitude: 47.6062, latitude: -122.3321 },
  // 待办：在这里继续添加其他重要的城市
};
export default cityLocations;
```

## 17.8.5 类型别名

对象可能有很多属性，而描述这样一个对象的 Flow 类型可能会很长，输入起来费时间。即使相对短一些的对象类型也可能让人困惑，因为它们看起来太像对象字面量了。在简单的 `number` 或 `?string` 不能满足需要时，通常需要给复杂的 Flow 类型命名。而且事实上，Flow 使用 `type` 关键字来定义类型。在 `type` 关键字后面要写标识符、等于号和 Flow 类型。定义了这样一个类型后，标识符就成为该类型的别名。例如，下面的例子重写了上一节的 `distance()` 函数，明确定义了一个 `Point` 类型：

```javascript
// @flow
export type Point = {
  x: number,
  y: number
};

// 传入一个 Point 对象，返回它到原点的距离
export default function distance(point: Point): number {
    return Math.hypot(point.x, point.y);
}
```

注意这段代码导出了 distance () 函数，同时也导出了 Point 类型。如果其他模块也想使用该类型定义，可以使用 `import type Point from './distance.js'` 导入。不过要记住，`import type` 是 Flow 语言扩展，并非真正的 JavaScript 导入指令。类型导入和导出由 Flow 类型检查器使用，但与其他所有 Flow 语言扩展一样，它们会在代码实际运行之前被剥离掉。

有必要说一下，与其定义一个表示点的 Flow 对象类型，不如直接定义一个 Point 类，再使用该类作为类型更简单、更清晰。

## 17.8.6 数组

Flow 中描述数组的类型是一个复合类型，其中也包含数组元素的类型。比如，下面这个函数期待一个数值数组，而 Flow 会在传给函数的数组中包含非数值元素时报错：

```plaintext
Error ---------------------------------------------------------------------------------------------------------- average.js:8:16

Cannot call average with array literal bound to data because string [1]
is incompatible with number [2] in array element.

[2]  2| function average(data: Array<number>) {
     3|     let sum = 0;
     4|     for(let x of data) sum += x;
     5|     return sum/data.length;
     6| }
     7|
[1]  8| average([1, 2, "three"]);
```

Flow 中的数组类型是 `Array` 后跟一对尖括号，尖括号中是元素类型。也可以用元素类型后跟一对方括号来表示数组类型。因此在这个例子中，我们也可以用 `number[]` 代替 `Array<number>`。我个人更倾向于使用尖括号版，因为后面还有别的 Flow 类型使用这种尖括号语法。

前面的数组类型适用于任意数量的元素，所有元素必须类型相同。Flow 有一种不同的语法，用于描述一种元组（tuple）类型，即一个有固定数量元素的数组，每个元素可以是不同的类型。要表示元组类型，只需简单地写出每个元素的类型，以逗号分隔，然后把它们全部放到一对方括号中即可。

比如，下面是一个返回 HTTP 状态码和消息的函数：

```javascript
function getStatus(): [number, string] {
    return [getStatuscode(), getStatusMessage()];
}
```

返回元组的函数并不容易使用，除非使用解构赋值：

```javascript
let [code, message] = getStatus();
```

解构赋值再加上 Flow 的类型别名能力，让元组很容易使用，甚至可以考虑用它们替代数据类型简单的类：

```javascript
// @flow
export type Color = [number, number, number, number]; // [r, g, b, opacity]

function gray(level: number): Color {
    return [level, level, level, 1];
}

function fade([r,g,b,a]: Color, factor: number): Color {
    return [r, g, b, a/factor];
}

let [r, g, b, a] = fade(gray(75), 3);
```

有了表示数组类型的方式，我们再回头看一看前面的 `size()` 函数，把它修改为接收一个数组参数而非字符串参数。我们希望这个函数可以接收一个任意长度的数组，因此元组类型不合适。但我们不希望限制函数只能接收所有元素类型必须相同的数组。解决方案是 `Array<mixed>` 类型：

```javascript
// @flow
function size(s: Array<mixed>): number {
    return s.length;
}
console.log(size([1,true,"three"]));
```

这里的元素类型 `mixed` 表示数组元素可以是任意类型。如果这个函数尝试通过索引访问数组元素，Flow 会坚持在对它们执行任何不安全操作前，先使用 `typeof` 或其他测试手段来确定元素的类型（如果你想放弃类型检查，也可以使用 `any` 代替 `mixed`。这样 Flow 会允许你任意使用数组元素，而不必先确定该值是你期待的类型）。

## 17.8.7 其他参数化类型

前面已经看到，在把一个值注解为 `Array` 时，Flow 要求在尖括号中指定数组元素的类型。这个额外的类型称为类型参数，而 `Array` 也不是唯一可以参数化的 JavaScript 类。

JavaScript 的 `Set` 类也是元素集合，与数组类似。不能只使用 `Set` 作为类型，还必须在一对尖括号中包含类型参数，指定集合中值的类型（如果集合可以包含多种类型值，类型参数也可以是 mixed 或 any）示例如下：

```javascript
// @flow
// 返回一个数值集合，其中数值
// 是输入数值集合中数值的两倍
function double(s: Set<number>): Set<number> {
  let doubled: Set<number> = new Set();
  for(let n of s) doubled.add(n * 2);
  return doubled;
}
console.log(double(new Set([1,2,3]))); // Prints "Set {2, 4, 6}"
```

Map 是另一个参数化类型。但 Map 必须指定两种类型参数，即键的类型和值的类型：

```javascript
// @flow
import { Color } from "./Color.js";

let colorNames: Map<string, Color> = new Map([
  ["red", [1, 0, 0, 1]],
  ["green", [0, 1, 0, 1]],
  ["blue", [0, 0, 1, 1]]
]);
```

Flow 也允许你为自己的类定义类型参数。下面的代码定义了一个 Result 类，但以 Error 类型和 Value 类型作为其类型参数。代码中使用 E 和 V 表示这两个类型参数。当这个类的用户声明 Result 类型的变量时，会指定替代 E 和 V 的实际类型。这种变量声明的示例如下所示：

```javascript
let result: Result<TypeError, Set<string>>;
```

下面的代码展示了如何定义参数化的类：

```javascript
// @flow
// 这个类表示一个操作的结果
// 要么抛出类型 E 的错误，要么返回类型 V 的值
export class Result<E, V> {
  error: ?E;
  value: ?V;

  constructor(error: ?E, value: ?V) {
    this.error = error;
    this.value = value;
  }

  threw(): ?E { return this.error; }
  returned(): ?V { return this.value; }

  get(): V {
    if (this.error) {
      throw this.error;
    } else if (this.value === null || this.value === undefined) {
      throw new TypeError("Error and value must not both be null");
    } else {
      return this.value;
    }
  }
}
```

甚至可以为函数定义类型参数：

```javascript
// @flow
// 将两个数组的元素组合为元素对的数组
function zip<A,B>(a:Array<A>, b:Array<B>): Array<[A,B]> {
  let result:Array<[A,B]> = [];
  let len = Math.min(a.length, b.length);
  for(let i = 0; i < len; i++) {
    result.push([a[i], b[i]]);
  }
  return result;
}

// 创建数组 [[1,'a'], [2,'b'], [3,'c'], [4,undefined]]
let pairs: Array<[number,?string]> = zip([1,2,3,4], ['a','b','c']);
```

## 17.8.8 只读类型

Flow 定义了一些特殊的参数化 "实用类型"，这些类型的名字以 开头。大多数这种类型都有一些高级使用场景，本节不会介绍。但其中有两个在实践中是非常有用的。如果有一个对象类型，你希望得到该类型的只读版本，可以写成ReadOnly<T>。类似地，可以用 $ReadOnlyArray<T> 描述一个元素类型为 T 的只读数组。

使用这些类型并不是因为它们可以保证对象或数组不被修改（如果需要真正的只读对象，可以参考 14.2 节的 Object.freeze ()），而是能够让我们发现由于意外修改导致的隐患。如果我们要写一个函数，接收一个对象或数组参数，并且不会修改任何对象属性或数组元素，那么就可以把这个函数参数注解为一种 Flow 的只读类型。这样 Flow 就会在你忘记并意外修改了输入值时报告错误。下面是两个例子：

```javascript

// @flow
type Point = {x:number, y:number};

// 这个函数接收一个 Point 对象，但承诺不会修改它
function distance(p: $ReadOnly<Point>): number {
  return Math.hypot(p.x, p.y);
}

let p: Point = {x:3, y:4};
distance(p) // => 5

// 这个函数接收一个不会修改的数值数组
function average(data: $ReadOnlyArray<number>): number {
    let sum = 0;
    for(let i = 0; i < data.length; i++) sum += data[i];
    return sum/data.length;
}

let data: Array<number> = [1,2,3,4,5];
average(data) // => 3
```

## 17.8.9 函数

前面已经介绍了如何给函数的参数和返回值添加类型注解，但如果函数的某个参数本身又是函数，还需要指定该函数参数的类型。

要通过 Flow 表示一个函数类型，就得把每个参数的类型写下来，以逗号分隔，用圆括号括起来，后面再跟一个箭头和函数的返回类型。

下面是一个示例函数，期待传入一个回调函数。注意这里事先为回调函数类型定义了类型别名：

```javascript
// @flow
// 下面的 fetchText() 中使用的回调函数类型
export type FetchTextCallback = (?Error, ?number, ?string) => void;

export default function fetchText(url: string, callback: FetchTextCallback) {
    let status = null;
    fetch(url)
        .then(response => {
            status = response.status;
            return response.text()
        })
        .then(body => {
            callback(null, status, body);
        })
        .catch(error => {
            callback(error, status, null);
        });
}
```

## 17.8.10 联合

我们再来看一看 `size()` 函数。除了返回数组长度什么也不做的函数并没有意义。数组本身就有一个 `length` 属性。但 `size()` 如果可以接收任意类型的集合对象（数组、Set 或 Map）并返回该集合中元素的个数，那就有用了。在常规无类型的 JavaScript 中，要写这样一个 `size()` 函数很容易。但在使用 Flow 时，我们需要一种类型能够允许数组、Set 和 Map，但不允许其他类型的值。

Flow 称这种类型为 ** 联合（union）** 类型，通过列出想要的类型并以竖线分隔它们就可以表示这种类型

```javascript
// @flow
function size(collection: Array<mixed>|Set<mixed>|Map<mixed, mixed>): number {
    if (Array.isArray(collection)) {
        return collection.length;
    } else {
        return collection.size;
    }
}
size([1, true, "three"]) + size(new Set([true, false])) // => 5
```

联合类型可以用 “或” 读出来，比如 “数组或 Set 或 Map”。因此事实上这个 Flow 语法使用了与 JavaScript 的 “逻辑或” 操作符一样的竖线是有意的。

前面我们也看到把问号放到一个类型前面表示允许 `null` 和 `undefined` 值。现在应该知道？前缀其实是给类型添加 `|null|void` 后缀的简写形式。

一般来说，在使用联合类型注解一个值时，Flow 在你判断完它的实际类型前是不允许使用它们的。在 `size()` 函数的例子中，我们需要在访问 `length` 属性前明确地检查参数是不是数组。要注意并不需要区分 Set 和 Map，这两个类都定义了 `size` 属性，因此只要参数不是数组 `else` 子句中的代码就是安全的。

## 17.8.11 枚举与可区分联合

Flow 允许使用原始值字面量作为只包含那一个值的类型。如果写 `let x:3;`，则 Flow 不允许给这个变量赋 3 之外的任何值。定义只有一个成员的类型用处不大，但这种字面量类型的联合却很有用。比如，可以想象一下像下面这样使用这种类型：

```javascript
type Answer = "yes" | "no";
type Digit = 0|1|2|3|4|5|6|7|8|9;
```

如果使用由字面量构成的类型，需要理解它只允许字面量值：

```javascript
let a: Answer = "yes".toLowerCase(); // 错误：不能向 Answer 赋予字符串
let d: Digit = 3+4;                   // 错误：不能向 Digit 赋予数字
```

Flow 在检查类型时，并不实际执行计算，而只检查计算的类型。Flow 知道 `toLowerCase()` 返回字符串，而对数值使用 `+` 操作符返回数值。即使我们知道这两个表达式的返回值在类型中，但 Flow 却不知道，因此这两行都会报错。

类似 Answer 和 Digit 这样的字面量联合类型是枚举类型（enum）的一个例子。枚举类型比较经典的用例是表示一副扑克牌：

```typescript
type Suit = "Clubs" | "Diamonds" | "Hearts" | "Spades";
```

更贴近技术的例子是用枚举表示 HTTP 状态码：

```typescript
type HTTPStatus =
  | 200  // 正确
  | 304  // 未修改
  | 403  // 禁止
  | 404; // 未找到
```

新手程序员最常听到的一个建议，就是避免在自己的代码中使用字面量，而应该使用符号常量表示那些值。这样做的一个实际好处是可以避免输入错误。如果你不小心输错了字符串字面量 “Diamonds”，JavaScript 永远不会报错，但你的代码可能会因此无法运行。从另一方面说，如果给一个标识符加错了类型，JavaScript 倒是有可能抛出错误（稍后可以看到）。但在使用 Flow 时，这个建议未必适用。如果你给某个变量加了 Suit 类型注解，然后尝试用拼错的字面量给它赋值，Flow 也会报错。

字面量类型的另一个重要应用是创建可区分联合（discriminated union）。在使用（由不同类型而非字面量构成的）联合类型时，通常需要写代码区分各种可能的类型。上一节，我们写的函数可以接收数组、Set 或 Map 作为参数，但必须要写代码区分参数是数组、Set 还是 Map。如果你想创建一个 Object 类型的联合，可以在每个 Object 类型中使用一个字面量类型让这些类型容易区分。

举个例子就清楚了。假设你在 Node（参见 16.11 节）中使用了一个工作线程，并使用 postMessage () 和 “message” 事件在工作线程与主线程间发送基于对象的消息。工作线程可能需要向主线程发送多种类型的消息，但我们希望写一个 Flow 的联合类型来描述所有消息类型。来看下面的代码：

```typescript
// @flow
// 工作线程在完成我们发给它的任务时发送这个类型的消息
export type ResultMessage = {
  messageType: 'result',
  result: Array<ReticulatedSpline>, // 假设其他地方定义了这个类型。
};

// 工作线程在代码因异常失败时发送这个类型的消息
export type ErrorMessage = {
  messageType: 'error',
  error: Error,
};

// 工作线程会发送这个类型的消息，报告资源使用情况
export type StatisticsMessage = {
  messageType: 'stats',
  splinesReticulated: number,
  splinesPerSecond: number
};

// 从工作线程收到的消息是 WorkerMessage
export type WorkerMessage = ResultMessage | ErrorMessage | StatisticsMessage;

// 主线程有一个事件处理程序接收 WorkerMessage。
// 因为在每种消息类型的定义中，我们都使用一个字面量
// 类型定义了 messageType 属性，所以这个事件处理程序
// 很容易区分接收到的消息是哪种类型：
function handleMessageFromReticulator(message: WorkerMessage) {
  if (message.messageType === 'result') {
    // 只有 ResultMessage 具有该值的 messageType 属性
    // 因此 Flow 知道此处使用 message.result 是安全的
    // Flow 会在尝试使用其他属性时报警
    console.log(message.result);
  } else if (message.messageType === 'error') {
    // 只有 ErrorMessage 具有值 'error' 的属性 messageType
    // 因此 Flow 知道此处使用 message.error 是安全的
    throw message.error;
  } else if (message.messageType === 'stats') {
    // 只有 StatisticsMessage 具有值 'stats' 的属性 messageType
    // 因此 Flow 知道此处使用 message.splinesPerSecond 是安全的
    console.log(message.splinesPerSecond);
  }
}
```

# 17.9 小结

JavaScript 是现今使用最广泛的编程语言，而且是一门充满活力的语言，一直在持续发展和演进，拥有欣欣向荣的库、工具和扩展生态系统。本章介绍了其中一些工具和扩展，但需要学习的还有更多。JavaScript 生态的繁荣得益于 JavaScript 开发者社区的活跃和充满生机，所有人平等相待，通过博客、视频、会议、PPT 无私分享知识和经验。当你合上这本书，加入这个社区，你会发现让你能够不断提升自己 JavaScript 水平的各种资源极其丰富、应有尽有。







