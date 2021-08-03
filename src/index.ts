type ArrayItem<T> = T extends ReadonlyArray<infer R> ? R : never

export type Getter<A, B> = (a: A) => B
export type Setter<A, B> = (b: B, a: A) => A

export type ProxyLensOperations<A, B> = {
  get(a?: A): B
  set(b: B, a?: A): A
  put(b: B, a?: A): ProxyLens<A, A>
  mod(mod: (b: B) => B): ProxyLens<A, B>
  iso<C>(bcGet: Getter<B, C>, bcSet: Setter<B, C>): ProxyLens<A, C>
}

export type ArrayProxyLensOperations<A, B> = {
  del(index: number, a?: A): ProxyLens<A, A>
  ins(index: number, b: ArrayItem<B>, a?: A): ProxyLens<A, A>
  cat(b: ArrayItem<B>, a?: A): ProxyLens<A, A>
}

export type BaseProxyLens<A, B> = ProxyLensOperations<A, B> &
  (Exclude<B, void | null> extends Record<string, unknown>
    ? { [K in keyof B]-?: ProxyLens<A, B[K]> }
    : unknown)

export type BaseArrayProxyLens<A, B> = Exclude<
  B,
  void | null
> extends ReadonlyArray<unknown>
  ? ArrayProxyLensOperations<A, B> &
      Omit<
        ReadonlyArray<BaseProxyLens<A, ArrayItem<B>>>,
        Exclude<keyof ReadonlyArray<ArrayItem<B>>, number>
      >
  : unknown

export type ProxyLens<A, B> = BaseProxyLens<A, B> & BaseArrayProxyLens<A, B>

function proxyLensOperations<A, B>(
  abGet: Getter<A, B>,
  abSet: Setter<A, B>,
  a?: A,
): ProxyLensOperations<A, B> {
  return {
    get: a ? () => abGet(a) : abGet,
    set: a ? (b: B) => abSet(b, a) : abSet,
    put: a ? (b: B) => lens(abSet(b, a)) : (b: B, a: A) => lens(abSet(b, a)),
    mod: (mod) =>
      proxyLens(
        (a) => mod(abGet(a)),
        (b, a) => abSet(mod(b), a),
        a,
      ),
    iso: (bcGet, bcSet) =>
      proxyLens(
        (a) => bcGet(abGet(a)),
        (b, a) => abSet(bcSet(b, abGet(a)), a),
        a,
      ),
  }
}

function mutateArrayCopy<A, B>(
  abGet: Getter<A, B>,
  a: A,
  mutate: (b: unknown[]) => unknown[],
): B {
  let target = abGet(a) as unknown
  target = ((target as unknown[]) ?? []).slice()
  mutate(target as unknown[])
  return target as B
}

function arrayProxyLensOperations<A, B>(
  abGet: Getter<A, B>,
  abSet: Setter<A, B>,
  a?: A,
): ArrayProxyLensOperations<A, B> {
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
    ins: (index: number, _b: ArrayItem<B>, _a?: A) =>
      lens(
        abSet(
          mutateArrayCopy<A, B>(abGet, (_a ?? a) as A, (b) =>
            b.splice(index, 0, _b),
          ),
          (_a ?? a) as A,
        ) as A,
      ),
    cat: (_b: ArrayItem<B>, _a?: A) =>
      lens(
        abSet(
          mutateArrayCopy<A, B>(abGet, (_a ?? a) as A, (b) =>
            b.splice(b.length, 0, _b),
          ),
          (_a ?? a) as A,
        ) as A,
      ),
  }
}

function getSetTargetCopy<A, B>(
  abGet: Getter<A, B>,
  name: keyof B,
  a: A,
): B[keyof B]
function getSetTargetCopy<A, B>(
  abGet: Getter<A, B>,
  name: keyof B,
  a: A,
  b: B[keyof B],
): B
function getSetTargetCopy<A, B>(
  abGet: Getter<A, B>,
  key: keyof B,
  a: A,
  b?: B[keyof B],
): B[keyof B] | B {
  const target = (key.toString().match(/^\+?(0|[1-9]\d*)$/)
    ? [...(((abGet(a) as unknown) as unknown[]) ?? [])]
    : { ...abGet(a) }) as B
  if (arguments.length === 4) {
    target[key as keyof B] = b as B[keyof B]
    return target
  }
  return target[key as keyof B]
}

function proxyLens<A, B>(
  abGet: Getter<A, B>,
  abSet: Setter<A, B>,
  a?: A,
): ProxyLens<A, B> {
  return new Proxy({} as ProxyLens<A, B>, {
    get(_, name) {
      return (
        arrayProxyLensOperations<A, B>(abGet, abSet, a)[
          name as keyof ArrayProxyLensOperations<A, B>
        ] ??
        proxyLensOperations<A, B>(abGet, abSet, a)[
          name as keyof ProxyLensOperations<A, B>
        ] ??
        proxyLens(
          (a: A) => getSetTargetCopy(abGet, name as keyof B, a),
          (b: B[keyof B], a: A) =>
            abSet(getSetTargetCopy(abGet, name as keyof B, a, b), a),
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
