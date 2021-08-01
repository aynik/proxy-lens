export type Getter<A, B> = (a: A) => B
export type Setter<A, B> = (b: B, a: A) => A

export type ProxyLensOperations<A, B> = {
  get(a?: A): B
  set(b: B, a?: A): A
  put(b: B, a?: A): ProxyLens<A, A>
  mod(mod: (b: B) => B): ProxyLens<A, B>
  iso<C>(bcGet: Getter<B, C>, bcSet: Setter<B, C>): ProxyLens<A, C>
}

export type ProxyLens<A, B> = ProxyLensOperations<A, B> &
  (Exclude<B, void | null> extends Record<string, unknown>
    ? { [K in keyof B]-?: ProxyLens<A, B[K]> }
    : unknown)

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

function proxyLens<A, B>(
  abGet: Getter<A, B>,
  abSet: Setter<A, B>,
  a?: A,
): ProxyLens<A, B> {
  return new Proxy({} as ProxyLens<A, B>, {
    get(_, name) {
      return (
        proxyLensOperations<A, B>(abGet, abSet, a)[
          name as keyof ProxyLensOperations<A, B>
        ] ??
        proxyLens(
          (a: A) => ({ ...abGet(a) }[name as keyof B]),
          (b: B[keyof B], a: A) => abSet({ ...abGet(a), [name]: b }, a),
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
