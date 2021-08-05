type ArrayItem<T> = T extends ReadonlyArray<infer R> ? R : never
type ArrayFrom<T> = Array<ArrayItem<T>>

type Prop = string | number | symbol

export type Getter<A, B> = (a: A) => B
export type Setter<A, B> = (b: B, a: A) => A

type ArrayGetter<A, B> = Getter<A, ArrayFrom<B>>
type ArraySetter<A, B> = Setter<A, ArrayFrom<B>>

export type ProxyLensBaseMethods<A, B> = {
  get(a?: A): B
  set(b: B, a?: A): A
  put(b: B): ProxyLens<A, A>
  mod(fn: (b: B) => B): ProxyLens<A, B>
  iso<C>(get: Getter<B, C>, set: Setter<B, C>): ProxyLens<A, C>
}

export type ProxyLensArrayMethods<A, B extends ArrayFrom<B>> = {
  del(index: number, a?: A): ProxyLens<A, A>
  ins(index: number, b: ArrayItem<B> | B, a?: A): ProxyLens<A, A>
  cat(b: ArrayItem<B> | B, a?: A): ProxyLens<A, A>
}

type BaseProxyLens<A, B> = ProxyLensBaseMethods<A, B> &
  (Exclude<B, void | null> extends Record<Prop, unknown>
    ? { [K in keyof B]-?: ProxyLens<A, B[K]> }
    : unknown)

type ArrayProxyLens<A, B> = Exclude<B, void | null> extends ReadonlyArray<
  unknown
>
  ? ProxyLensArrayMethods<A, ArrayFrom<B>> &
      Omit<
        ReadonlyArray<BaseProxyLens<A, ArrayItem<B>>>,
        Exclude<keyof ArrayFrom<B>, number>
      >
  : unknown

export type ProxyLens<A, B> = BaseProxyLens<A, B> & ArrayProxyLens<A, B>

function lensBaseMethods<A, B>(
  get: Getter<A, B>,
  set: Setter<A, B>,
  a?: A,
): ProxyLensBaseMethods<A, B> {
  return {
    get: (a_?: A) => get((a_ ?? a) as A),
    set: (b: B, a_?: A) => set(b, (a_ ?? a) as A),
    put: (b: B) =>
      proxyLens(
        (a: A) => set(b, a),
        (a_: A) => a_,
        a,
      ),
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

function lensArrayMethods<A, B extends ArrayFrom<B>>(
  get: ArrayGetter<A, B>,
  set: ArraySetter<A, B>,
  a?: A,
): ProxyLensArrayMethods<A, ArrayFrom<B>> {
  return {
    del: (index: number, a_?: A) =>
      lens(
        set(
          lens(get((a_ ?? a) as A))
            .mod((b) => [
              ...(b ?? []).slice(0, index),
              ...(b ?? []).slice(index + 1),
            ])
            .get() as B,
          (a_ ?? a) as A,
        ) as A,
      ),
    ins: (index: number, b_: ArrayItem<B> | B, a_?: A) =>
      lens(
        set(
          lens(get((a_ ?? a) as A))
            .mod((b) => [
              ...(b ?? []).slice(0, index),
              ...(Array.isArray(b_) ? b_ : [b_]),
              ...(b ?? []).slice(index),
            ])
            .get() as B,
          (a_ ?? a) as A,
        ) as A,
      ),
    cat: (b_: ArrayItem<B> | B, a_?: A) =>
      lens(
        set(
          lens(get((a_ ?? a) as A))
            .mod((b) => [...(b ?? []), ...(Array.isArray(b_) ? b_ : [b_])])
            .get() as B,
          (a_ ?? a) as A,
        ) as A,
      ),
  }
}

function primitiveForKey(key: Prop) {
  return key.toString().match(/^\+?(0|[1-9]\d*)$/) ? [] : {}
}

function proxyLens<A, B>(
  get: Getter<A, B> | ArrayGetter<A, B>,
  set: Setter<A, B> | ArraySetter<A, B>,
  a?: A,
): ProxyLens<A, B> {
  const proto: unknown = {
    ...lensBaseMethods(get as Getter<A, B>, set as Setter<A, B>, a),
    ...lensArrayMethods(get as ArrayGetter<A, B>, set as ArraySetter<A, B>, a),
  }
  return new Proxy(proto as ProxyLens<A, B>, {
    ownKeys: (methods) => [
      ...Object.keys(methods),
      ...Object.keys(a ? get(a as A) : {}),
    ],
    get: (methods, key) =>
      methods[key as keyof ProxyLens<A, B>] ??
      proxyLens(
        (a: A): B[keyof B] =>
          Object.assign(primitiveForKey(key) as B, get(a))[key as keyof B],
        (b: B[keyof B], a: A): A =>
          (set as Setter<A, B>)(
            Object.assign(primitiveForKey(key) as B, get(a), {
              [key as keyof B]: b,
            }),
            a,
          ),
        a,
      ),
  })
}

export function lens<A>(a?: A): ProxyLens<A, A> {
  return proxyLens<A, A>(
    (a: A): A => a,
    (b: A, _: A): A => b,
    a,
  )
}
