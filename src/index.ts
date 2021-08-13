export type Getter<A, B> = (a: A) => B
export type Setter<A, B> = (b: B, a: A) => A
export type Lens<A, B> = { get: Getter<A, B>; set: Setter<A, B> }

export type BaseLens<A, B> = {
  get(target?: A): B
  set(value: B, target?: A): A
  let(value: B): ProxyLens<A, A>
  peg({ get, set }: Lens<A, B>): ProxyLens<A, A>
  mod<C>({ get, set }: Lens<B, C>): ProxyLens<A, C>
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
      put(index: number, value: ArrayItem<B> | B, target?: A): ProxyLens<A, A>
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
    let: (value: B): ProxyLens<A, A> =>
      getterProxyLens<A>((target: A): A => set(value, target), root),
    peg: ({ get: get_, set: set_ }: Lens<A, B>): ProxyLens<A, A> =>
      proxyLens<A, A>(
        (target: A): A => set(get_(target), target),
        (value: A, target: A): A => set_(get_(value), set(get_(value), target)),
        root,
      ),
    mod: <C>({ get: get_, set: set_ }: Lens<B, C>): ProxyLens<A, C> =>
      proxyLens<A, C>(
        (target: A): C => get_(get(target)),
        (value: C, target: A): A => set(set_(value, get(target)), target),
        root,
      ),
  } as BaseLens<A, B>
}

function mutateArray<B extends ArrayFrom<B>>(
  target: ArrayFrom<B>,
  fn: (target: B[]) => void,
): ArrayFrom<B> {
  const targetCopy = (target ?? []).slice()
  fn(targetCopy as B[])
  return targetCopy
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
          mutateArray(get((root ?? target) as A), (target: B[]) =>
            target.splice(index, 1),
          ),
          (root ?? target) as A,
        ),
      ),
    put: (
      index: number,
      value: ArrayFrom<B> | B,
      target?: A,
    ): ProxyLens<A, A> =>
      lens<A>(
        set(
          mutateArray(get((root ?? target) as A), (target: B[]) => {
            target.splice(
              index < 0 ? target.length + 1 + index : index,
              0,
              ...(Array.isArray(value) ? value : [value]),
            )
          }),
          (root ?? target) as A,
        ),
      ),
  }
}

function getTarget<T>(key: string | number | symbol) {
  return (key.toString().match(/^\+?(0|[1-9]\d*)$/) ? [] : {}) as T
}

export function getterProxyLens<A>(
  get: Getter<A, A> | Getter<A, ArrayFrom<A>>,
  root?: A,
): ProxyLens<A, A> {
  return proxyLens<A, A>(get, (target: A): A => target, root)
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

export function lens<A>(a?: A): ProxyLens<A, A> {
  return proxyLens<A, A>(
    (a: A): A => a,
    (b: A, _: A): A => b,
    a,
  )
}
