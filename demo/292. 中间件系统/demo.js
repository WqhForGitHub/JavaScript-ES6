// 292. 中间件系统

function composeMiddlewares(middlewares) {
  return (context) => {
    let index = -1;
    function next() {
      index++;
      const middleware = middlewares[index];
      if (middleware) return middleware(context, next);
    }
    return next();
  };
}
const ctx = { logs: [] };
composeMiddlewares([
  (c, n) => {
    c.logs.push('a');
    n();
  },
  (c) => c.logs.push('b'),
])(ctx);
console.log(ctx.logs);
