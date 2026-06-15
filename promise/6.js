Promise.resolve(1).then(2).then(Promise.resolve(3)).then(console.log)


// then 方法的入参只能是函数。万一你想塞给它一些乱七八糟的东西，它就会“翻脸不认人”。
 
// 具体到我们这个题里，第一个 then 方法中传入的是一个 Promise 对象，then 说：”我不认识“；第二个 then 中传入的是一个数字， then 继续说”我不认识“；第四个干脆啥也没穿，then 说”入参undefined了，拜拜“；直到第五个入参，一个函数被传了进来，then 哭了：”终于等到一个我能处理的！“，于是只有最后一个入参生效了。
 
// 在这个过程中，我们最初 resolve 出来那个值，穿越了一个又一个无效的 then 调用，就好像是这些 then 调用都是透明的、不存在的一样，因此这种情形我们也形象地称它是 Promise 的“值穿透”。