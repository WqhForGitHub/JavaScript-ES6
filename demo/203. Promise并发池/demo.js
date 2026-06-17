// 203. Promise并发池

async function pool(items, limit, worker) {
  const executing = new Set();
  const results = [];
  for (const item of items) {
    const p = Promise.resolve()
      .then(() => worker(item))
      .then((v) => results.push(v));
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= limit) await Promise.race(executing);
  }
  await Promise.all(executing);
  return results;
}
pool([1, 2, 3], 2, (n) => Promise.resolve(n * 2)).then(console.log);
