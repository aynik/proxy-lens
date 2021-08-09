export type Getter<A, B> = (a: A) => B
export type Setter<A, B> = (b: B, a: A) => A

export type BaseLens<A, B> = {
  get(target?: A): B
  set(value: B, target?: A): A
  put(value: B): ProxyLens<A, A>
  mod<C>(get: Getter<B, C>, set?: Setter<B, C>): ProxyLens<A, C>
}

type ExtractRecord<T> = Extract<T, { [key: string]: unknown }>

type BaseProxyLens<A, B> = BaseLens<A, B> &
  (ExtractRecord<B> extends { [key: string]: unknown }
    ? {
        [K in keyof ExtractRecord<B>]-?: ProxyLens<A, ExtractRecord<B>[K]>
      }
    : unknown)

type ArrayItem<T> = T extends ReadonlyArray<infer R> ? R : never
type ArrayFrom<T> = ReadonlyArray<ArrayItem<T>>

type ExtractArray<T> = Extract<T, ReadonlyArray<unknown>>

export type ArrayLens<A, B> = ExtractArray<B> extends ArrayFrom<B>
  ? {
      del(index: number, target?: A): ProxyLens<A, A>
      ins(index: number, value: ArrayItem<B> | B, target?: A): ProxyLens<A, A>
      cat(value: ArrayItem<B> | B, target?: A): ProxyLens<A, A>
    }
  : never

type ArrayProxyLens<A, B> = ArrayLens<A, B> &
  (ExtractArray<B> extends ArrayFrom<B>
    ? {
        [I in keyof Omit<
          ArrayFrom<ExtractArray<B>>,
          Exclude<keyof ArrayFrom<ExtractArray<B>>, number>
        >]: ProxyLens<A, ExtractArray<B>[I]>
      }
    : unknown)

export type ProxyLens<A, B> = BaseProxyLens<A, B> & ArrayProxyLens<A, B>

function baseLens<A, B>(
  get: Getter<A, B>,
  set: Setter<A, B>,
  root?: A,
): BaseLens<A, B> {
  return {
    get: (target?: A): B => get((target ?? root) as A),
    set: (value: B, target?: A): A => set(value, (target ?? root) as A),
    put: (value: B): ProxyLens<A, A> =>
      proxyLens<A, A>(
        (target: A): A => set(value, target),
        (target: A): A => target,
        root,
      ),
    mod: <C>(get_: Getter<B, C>, set_?: Setter<B, C>): ProxyLens<A, C> =>
      proxyLens<A, C>(
        (root: A): C => get_(get(root)),
        (value: C, root: A): A =>
          set_ != null ? set(set_(value, get(root)), root) : root,
        root,
      ),
  } as BaseLens<A, B>
}

function arrayLens<A, B extends ArrayFrom<B>>(
  get: Getter<A, ArrayFrom<B>>,
  set: Setter<A, ArrayFrom<B>>,
  root?: A,
): ArrayLens<A, ArrayFrom<B>> {
  return {
    del: (index: number, target?: A): ProxyLens<A, A> =>
      lens<A>(
        set(
          lens<ArrayFrom<B>>(get((target ?? root) as A))
            .mod(
              (target): ArrayFrom<B> => [
                ...(target ?? []).slice(0, index),
                ...(target ?? []).slice(index + 1),
              ],
            )
            .get() as B,
          (target ?? root) as A,
        ) as A,
      ),
    ins: (
      index: number,
      value: ArrayFrom<B> | B,
      target?: A,
    ): ProxyLens<A, A> =>
      lens<A>(
        set(
          lens<ArrayFrom<B>>(get((target ?? root) as A))
            .mod(
              (target): ArrayFrom<B> => [
                ...(target ?? []).slice(0, index),
                ...(Array.isArray(value) ? value : [value]),
                ...(target ?? []).slice(index),
              ],
            )
            .get() as B,
          (target ?? root) as A,
        ) as A,
      ),
    cat: (value: ArrayFrom<B> | B, target?: A): ProxyLens<A, A> =>
      lens<A>(
        set(
          lens<ArrayFrom<B>>(get((target ?? root) as A))
            .mod(
              (target): ArrayFrom<B> => [
                ...(target ?? []),
                ...(Array.isArray(value) ? value : [value]),
              ],
            )
            .get() as B,
          (target ?? root) as A,
        ) as A,
      ),
  }
}

function getTarget<T>(key: string | number | symbol) {
  return (key.toString().match(/^\+?(0|[1-9]\d*)$/) ? [] : {}) as T
}

export function proxyLens<A, B>(
  get: Getter<A, B> | Getter<A, ArrayFrom<B>>,
  set: Setter<A, B> | Setter<A, ArrayFrom<B>>,
  root?: A,
): ProxyLens<A, B> {
  return new Proxy({} as ProxyLens<A, B>, {
    get: (_, key) =>
      arrayLens(
        get as Getter<A, ArrayFrom<B>>,
        set as Setter<A, ArrayFrom<B>>,
        root,
      )[key as keyof ArrayLens<A, ArrayFrom<B>>] ??
      baseLens(get as Getter<A, B>, set as Setter<A, B>, root)[
        key as keyof BaseLens<A, B>
      ] ??
      proxyLens(
        (a: A): B[keyof B] =>
          Object.assign(getTarget<B>(key), get(a))[key as keyof B],
        (b: B[keyof B], a: A): A =>
          (set as Setter<A, B>)(
            Object.assign(getTarget<B>(key), get(a), {
              [key as keyof B]: b,
            }),
            a,
          ),
        root,
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
