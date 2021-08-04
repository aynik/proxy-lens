export type Getter<A, B> = (a: A) => B
export type Setter<A, B> = (b: B, a: A) => A

export type ArrayItem<T> = T extends ReadonlyArray<infer R> ? R : never

export type ProxyLensBaseMethods<A, B> = {
  get(a?: A): B
  set(b: B, a?: A): A
  put(b: B, a?: A): ProxyLens<A, A>
  mod(fn: (b: B) => B): ProxyLens<A, B>
  iso<C>(get: Getter<B, C>, set: Setter<B, C>): ProxyLens<A, C>
}

export type ProxyLensArrayMethods<A, B> = {
  del(index: number, a?: A): ProxyLens<A, A>
  ins(index: number, b: ArrayItem<B> | B, a?: A): ProxyLens<A, A>
  cat(b: ArrayItem<B> | B, a?: A): ProxyLens<A, A>
}

type BaseProxyLens<A, B> = ProxyLensBaseMethods<A, B> &
  (Exclude<B, void | null> extends Record<string, unknown>
    ? { [K in keyof B]-?: ProxyLens<A, B[K]> }
    : unknown)

type ArrayProxyLens<A, B> = Exclude<B, void | null> extends ReadonlyArray<
  unknown
>
  ? ProxyLensArrayMethods<A, B> &
      Omit<
        ReadonlyArray<BaseProxyLens<A, ArrayItem<B>>>,
        Exclude<keyof ReadonlyArray<ArrayItem<B>>, number>
      >
  : unknown

export type ProxyLens<A, B> = BaseProxyLens<A, B> & ArrayProxyLens<A, B>

function lensBaseMethods<A, B>(
  get: Getter<A, B>,
  set: Setter<A, B>,
  a?: A,
): ProxyLensBaseMethods<A, B> {
  return {
    get: a ? () => get(a) : get,
    set: a ? (b: B) => set(b, a) : set,
    put: a ? (b: B) => lens(set(b, a)) : (b: B, a: A) => lens(set(b, a)),
    mod: (fn) =>
      proxyLens(
        (a) => fn(get(a)),
        (b, a) => set(fn(b), a),
        a,
      ),
    iso: (get_, set_) =>
      proxyLens(
        (a) => get_(get(a)),
        (b, a) => set(set_(b, get(a)), a),
        a,
      ),
  }
}

function mutateArrayCopy<A, B>(
  get: Getter<A, B>,
  a: A,
  mutate: (b: unknown[]) => unknown[],
): B {
  let target = get(a) as unknown
  target = ((target as unknown[]) ?? []).slice()
  mutate(target as unknown[])
  return target as B
}

function lensArrayMethods<A, B>(
  abGet: Getter<A, B>,
  abSet: Setter<A, B>,
  a?: A,
): ProxyLensArrayMethods<A, B> {
  return {
    del: (index: number, _a?: A) =>
      lens(
        abSet(
          mutateArrayCopy<A, B>(abGet, (_a ?? a) as A, (b) =>
            b.splice(index, 1),
          ),
          (_a ?? a) as A,
        ) as A,
      ),
    ins: (index: number, _b: ArrayItem<B> | B, _a?: A) =>
      lens(
        abSet(
          mutateArrayCopy<A, B>(abGet, (_a ?? a) as A, (b) =>
            b.splice(index, 0, ...(Array.isArray(_b) ? _b : [_b])),
          ),
          (_a ?? a) as A,
        ) as A,
      ),
    cat: (_b: ArrayItem<B> | B, _a?: A) =>
      lens(
        abSet(
          mutateArrayCopy<A, B>(abGet, (_a ?? a) as A, (b) =>
            b.splice(b.length, 0, ...(Array.isArray(_b) ? _b : [_b])),
          ),
          (_a ?? a) as A,
        ) as A,
      ),
  }
}

function getSetTargetCopy<A, B>(
  get: Getter<A, B>,
  name: keyof B,
  a: A,
): B[keyof B]
function getSetTargetCopy<A, B>(
  get: Getter<A, B>,
  name: keyof B,
  a: A,
  b: B[keyof B],
): B
function getSetTargetCopy<A, B>(
  get: Getter<A, B>,
  key: keyof B,
  a: A,
  b?: B[keyof B],
): B[keyof B] | B {
  const target = (key.toString().match(/^\+?(0|[1-9]\d*)$/)
    ? [...(((get(a) as unknown) as unknown[]) ?? [])]
    : { ...get(a) }) as B
  if (arguments.length === 4) {
    target[key as keyof B] = b as B[keyof B]
    return target
  }
  return target[key as keyof B]
}

function proxyLens<A, B>(
  get: Getter<A, B>,
  set: Setter<A, B>,
  a?: A,
): ProxyLens<A, B> {
  return new Proxy({} as ProxyLens<A, B>, {
    get(_, name) {
      return (
        lensArrayMethods<A, B>(get, set, a)[
          name as keyof ProxyLensArrayMethods<A, B>
        ] ??
        lensBaseMethods<A, B>(get, set, a)[
          name as keyof ProxyLensBaseMethods<A, B>
        ] ??
        proxyLens(
          (a: A) => getSetTargetCopy(get, name as keyof B, a),
          (b: B[keyof B], a: A) =>
            set(getSetTargetCopy(get, name as keyof B, a, b), a),
          a,
        )
      )
    },
  })
}

export function lens<A>(a?: A): ProxyLens<A, A> {
  return proxyLens<A, A>(
    (a) => a,
    (b, _) => b,
    a,
  )
}
