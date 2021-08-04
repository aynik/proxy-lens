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

export type ProxyLensArrayMethods<A, B extends Array<ArrayItem<B>>> = {
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
  ? ProxyLensArrayMethods<A, Array<ArrayItem<B>>> &
      Omit<
        ReadonlyArray<BaseProxyLens<A, ArrayItem<B>>>,
        Exclude<keyof Array<ArrayItem<B>>, number>
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
        (a: A) => fn(get(a)),
        (b: B, a: A) => set(fn(b), a),
        a,
      ),
    iso: <C>(get_: Getter<B, C>, set_: Setter<B, C>) =>
      proxyLens(
        (a: A): C => get_(get(a)),
        (c: C, a: A) => set(set_(c, get(a)), a),
        a,
      ),
  }
}

function lensArrayMethods<A, B extends Array<ArrayItem<B>>>(
  get: Getter<A, Array<ArrayItem<B>>>,
  set: Setter<A, Array<ArrayItem<B>>>,
  a?: A,
): ProxyLensArrayMethods<A, Array<ArrayItem<B>>> {
  return {
    del: (index: number, _a?: A) =>
      lens(
        set(
          lens(get((_a ?? a) as A))
            .mod((b) => [
              ...(b ?? []).slice(0, index),
              ...(b ?? []).slice(index + 1),
            ])
            .get() as B,
          (_a ?? a) as A,
        ) as A,
      ),
    ins: (index: number, _b: ArrayItem<B> | B, _a?: A) =>
      lens(
        set(
          lens(get((_a ?? a) as A))
            .mod((b) => [
              ...(b ?? []).slice(0, index),
              ...(Array.isArray(_b) ? _b : [_b]),
              ...(b ?? []).slice(index),
            ])
            .get() as B,
          (_a ?? a) as A,
        ) as A,
      ),
    cat: (_b: ArrayItem<B> | B, _a?: A) =>
      lens(
        set(
          lens(get((_a ?? a) as A))
            .mod((b) => [...(b ?? []), ...(Array.isArray(_b) ? _b : [_b])])
            .get() as B,
          (_a ?? a) as A,
        ) as A,
      ),
  }
}

function proxyLens<A, B>(
  get: Getter<A, B> | Getter<A, Array<ArrayItem<B>>>,
  set: Setter<A, B> | Setter<A, Array<ArrayItem<B>>>,
  a?: A,
): ProxyLens<A, B> {
  return new Proxy({} as ProxyLens<A, B>, {
    get(_, key) {
      const basePrimitive = (key.toString().match(/^\+?(0|[1-9]\d*)$/)
        ? []
        : {}) as B
      return (
        lensArrayMethods<A, Array<ArrayItem<B>>>(
          get as Getter<A, Array<ArrayItem<B>>>,
          set as Setter<A, Array<ArrayItem<B>>>,
          a,
        )[key as keyof ProxyLensArrayMethods<A, Array<ArrayItem<B>>>] ??
        lensBaseMethods<A, B>(get as Getter<A, B>, set as Setter<A, B>, a)[
          key as keyof ProxyLensBaseMethods<A, B>
        ] ??
        proxyLens(
          (a: A): B[keyof B] =>
            Object.assign(basePrimitive, get(a))[key as keyof B],
          (b: B[keyof B], a: A): A =>
            (set as Setter<A, B>)(
              Object.assign(basePrimitive, get(a), { [key as keyof B]: b }),
              a,
            ),
          a,
        )
      )
    },
  })
}

export function lens<A>(a?: A): ProxyLens<A, A> {
  return proxyLens<A, A>(
    (a: A): A => a,
    (b: A, _: A): A => b,
    a,
  )
}
