export type Getter<A, B> = (a: A) => B
export type Setter<A, B> = (b: B, a: A) => A

export type BaseLens<A, B> = {
  get(target?: A): B
  set(value: B, target?: A): A
  let(value: B): ProxyLens<A, A>
  peg(get: Getter<A, B> | ProxyLens<A, B>): ProxyLens<A, A>
  mod(get: Getter<B, B> | ProxyLens<B, B>): ProxyLens<A, A>
  iso<C>(
    get: Getter<B, C> | ProxyLens<B, C>,
    set: Setter<B, C>,
  ): ProxyLens<A, C>
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

export type ArrayLens<A, B extends ArrayFrom<B>> = {
  del(index: number): ProxyLens<A, A>
  put(index: number, value: ArrayItem<B> | B): ProxyLens<A, A>
}

type ArrayProxyLens<A, B extends ArrayFrom<B>> = ArrayLens<A, B> &
  {
    [I in keyof Omit<B, Exclude<keyof B, number>>]: ProxyLens<A, B[I]>
  }

export type ProxyLens<A, B> = BaseProxyLens<A, B> &
  (ExtractArray<B> extends never
    ? unknown
    : ArrayProxyLens<A, ExtractArray<ArrayFrom<B>>>)

function baseLens<A, B>(
  get: Getter<A, B>,
  set: Setter<A, B>,
  root?: A,
): BaseLens<A, B> {
  return {
    get: (target: A): B => get((target ?? root) as A),
    set: (value: B, target: A): A => set(value, (target ?? root) as A),
    let: (value: B): ProxyLens<A, A> =>
      proxyLens<A, A>(
        (target: A): A => set(value, target),
        (value: A): A => value,
        root,
      ),
    peg: (get_: Getter<A, B>): ProxyLens<A, A> =>
      proxyLens<A, A>(
        (target: A): A => set(get_(set(get(target), target)), target),
        (value: A): A => set(get_(set(get(value), value)), value),
        root,
      ),
    mod: (get_: Getter<B, B>): ProxyLens<A, A> =>
      proxyLens<A, A>(
        (target: A): A => set(get_(get(target)), target),
        (value: A): A => set(get_(get(value)), value),
        root,
      ),
    iso: <C>(get_: Getter<B, C>, set_: Setter<B, C>): ProxyLens<A, C> =>
      proxyLens<A, C>(
        (target: A): C => get_(get(target)),
        (value: C, target: A): A => set(set_(value, get(target)), target),
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
    del: (index: number): ProxyLens<A, A> =>
      proxyLens<A, A>(
        (target: A): A =>
          set(
            (() => {
              const copy = (get(target) ?? []).slice()
              copy.splice(index, 1)
              return copy
            })(),
            target,
          ),
        (value: A): A => value,
        root,
      ),
    put: (index: number, value: ArrayFrom<B> | B): ProxyLens<A, A> =>
      proxyLens<A, A>(
        (target: A): A =>
          set(
            (() => {
              const copy = (get(target) ?? []).slice()
              copy.splice(
                index < 0 ? copy.length + 1 + index : index,
                0,
                ...(Array.isArray(value) ? value : [value]),
              )
              return copy
            })(),
            target,
          ),
        (value: A): A => value,
        root,
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
  return new Proxy(get as ProxyLens<A, B>, {
    apply: (_, __, args: (A | void)[]): B =>
      (get as Getter<A, B>)(args[0] as A),
    get: (_, key) =>
      arrayLens(
        get as Getter<A, ArrayFrom<B>>,
        set as Setter<A, ArrayFrom<B>>,
        root,
      )[key as keyof ArrayLens<A, ArrayFrom<B>>] ??
      baseLens(get as Getter<A, B>, set as Setter<A, B>, root)[
        key as keyof BaseLens<A, B>
      ] ??
      proxyLens<A, B[keyof B]>(
        (target: A): B[keyof B] =>
          Object.assign(getTarget<B>(key), get(target))[key as keyof B],
        (value: B[keyof B], target: A): A =>
          (set as Setter<A, B>)(
            Object.assign(getTarget<B>(key), get(target), {
              [key as keyof B]: value,
            }),
            target,
          ),
        root,
      ),
  })
}

export function lens<A>(root?: A): ProxyLens<A, A> {
  return proxyLens<A, A>(
    (target: A): A => target,
    (value: A): A => value,
    root,
  )
}
