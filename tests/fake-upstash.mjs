/* An in-memory stand-in for the Upstash REST pipeline endpoint, covering
   the Redis commands the site sends. Every argument must arrive as a
   string, as the real API expects. */
export function fakeUpstash() {
  const data = new Map();
  const requests = [];
  const of = (key, make) => {
    if (!data.has(key)) data.set(key, make());
    return data.get(key);
  };
  const hash = (key) => of(key, () => new Map());
  const set = (key) => of(key, () => new Set());
  const zset = (key) => of(key, () => new Map());
  const commands = {
    SET: (key, value, flag) =>
      flag === "NX" && data.has(key) ? null : (data.set(key, value), "OK"),
    GET: (key) => data.get(key) ?? null,
    EXISTS: (...keys) => keys.filter((key) => data.has(key)).length,
    DEL: (...keys) => keys.filter((key) => data.delete(key)).length,
    INCR: (key) => {
      const value = Number(data.get(key) ?? 0) + 1;
      data.set(key, String(value));
      return value;
    },
    EXPIRE: () => 1,
    PERSIST: (key) => (data.has(key) ? 1 : 0),
    HSET: (key, ...pairs) => {
      const h = hash(key);
      let added = 0;
      for (let i = 0; i < pairs.length; i += 2) {
        if (!h.has(pairs[i])) added++;
        h.set(pairs[i], pairs[i + 1]);
      }
      return added;
    },
    HSETNX: (key, field, value) => {
      const h = hash(key);
      if (h.has(field)) return 0;
      h.set(field, value);
      return 1;
    },
    HINCRBY: (key, field, by) => {
      const h = hash(key);
      const value = Number(h.get(field) ?? 0) + Number(by);
      h.set(field, String(value));
      return value;
    },
    HDEL: (key, ...fields) => {
      const h = data.get(key);
      return h ? fields.filter((field) => h.delete(field)).length : 0;
    },
    HGET: (key, field) => data.get(key)?.get(field) ?? null,
    HGETALL: (key) => [...(data.get(key) ?? new Map())].flat(),
    ZADD: (key, ...args) => {
      const nx = args[0] === "NX";
      if (nx) args.shift();
      const z = zset(key);
      const [score, member] = args;
      if (nx && z.has(member)) return 0;
      const added = z.has(member) ? 0 : 1;
      z.set(member, Number(score));
      return added;
    },
    ZREM: (key, ...members) => {
      const z = data.get(key);
      return z ? members.filter((member) => z.delete(member)).length : 0;
    },
    ZRANGE: (key, start, stop) => sorted(key, 1).slice(Number(start), end(stop)),
    ZREVRANGE: (key, start, stop) => sorted(key, -1).slice(Number(start), end(stop)),
    SADD: (key, ...members) => {
      const s = set(key);
      const before = s.size;
      members.forEach((member) => s.add(member));
      return s.size - before;
    },
    SCARD: (key) => data.get(key)?.size ?? 0,
    SPOP: (key, count) => {
      const s = data.get(key);
      if (!s) return [];
      const taken = [...s].slice(0, Number(count));
      taken.forEach((member) => s.delete(member));
      if (!s.size) data.delete(key);
      return taken;
    },
    SUNIONSTORE: (destination, ...keys) => {
      const union = new Set(keys.flatMap((key) => [...(data.get(key) ?? [])]));
      if (union.size) data.set(destination, union);
      else data.delete(destination);
      return union.size;
    },
  };
  const end = (stop) => (Number(stop) === -1 ? undefined : Number(stop) + 1);
  const sorted = (key, direction) =>
    [...(data.get(key) ?? new Map())]
      .sort((a, b) => (a[1] - b[1]) * direction)
      .map(([member]) => member);

  async function fetch(url, init) {
    requests.push({ url, init });
    const pipeline = JSON.parse(init.body);
    return Response.json(
      pipeline.map(([name, ...args]) => {
        if (args.some((arg) => typeof arg !== "string"))
          return { error: "ERR arguments must be strings" };
        const command = commands[name];
        return command ? { result: command(...args) } : { error: `ERR unknown ${name}` };
      }),
    );
  }
  return { fetch, data, requests, run: (name, ...args) => commands[name](...args) };
}
