type Prop = string | number | symbol

export type Getter<A, B> = (a: A) => B
export type Setter<A, B> = (b: B, a: A) => A

type ArrayItem<T> = T extends ReadonlyArray<infer R> ? R : never
type ArrayFrom<T> = Array<ArrayItem<T>>

type ArrayGetter<A, B> = Getter<A, ArrayFrom<B>>
type ArraySetter<A, B> = Setter<A, ArrayFrom<B>>

export type BaseLens<A, B> = {
  get(target?: A): B
  set(value: B, target?: A): A
  put(value: B): ProxyLens<A, A>
  mod(fn: (value: B) => B): ProxyLens<A, B>
  iso<C>(get: Getter<B, C>, set: Setter<B, C>): ProxyLens<A, C>
}

export type ArrayLens<A, B extends ArrayFrom<B>> = {
  del(index: number, target?: A): ProxyLens<A, A>
  ins(index: number, value: ArrayItem<B> | B, target?: A): ProxyLens<A, A>
  cat(value: ArrayItem<B> | B, target?: A): ProxyLens<A, A>
}

type Lens<A, B> = BaseLens<A, B> & ArrayLens<A, ArrayFrom<B>>

type BaseProxyLens<A, B> = BaseLens<A, B> &
  (Exclude<B, void | null> extends Record<Prop, unknown>
    ? { [K in keyof B]-?: ProxyLens<A, B[K]> }
    : Lens<A, B>)

type ArrayProxyLens<A, B> = Exclude<B, void | null> extends ReadonlyArray<
  unknown
>
  ? ArrayLens<A, ArrayFrom<B>> &
      Omit<
        ReadonlyArray<BaseProxyLens<A, ArrayItem<B>>>,
        Exclude<keyof ArrayFrom<B>, number>
      >
  : Lens<A, B>

export type ProxyLens<A, B> = BaseProxyLens<A, B> & ArrayProxyLens<A, B>

function baseLens<A, B>(
  get: Getter<A, B>,
  set: Setter<A, B>,
  root?: A,
): BaseLens<A, B> {
  return {
    get: (target?: A) => get((target ?? root) as A),
    set: (value: B, target?: A) => set(value, (target ?? root) as A),
    put: (value: B) =>
      proxyLens(
        (target: A) => set(value, target),
        (target: A) => target,
        root,
      ),
    mod: (fn) =>
      proxyLens(
        (target: A) => fn(get(target)),
        (value: B, target: A) => set(fn(value), target),
        root,
      ),
    iso: <C>(get_: Getter<B, C>, set_: Setter<B, C>) =>
      proxyLens(
        (root: A): C => get_(get(root)),
        (value: C, root: A) => set(set_(value, get(root)), root),
        root,
      ),
  }
}

function arrayLens<A, B extends ArrayFrom<B>>(
  get: ArrayGetter<A, B>,
  set: ArraySetter<A, B>,
  a?: A,
): ArrayLens<A, ArrayFrom<B>> {
  return {
    del: (index: number, target?: A) =>
      lens(
        set(
          lens(get((target ?? a) as A))
            .mod((target) => [
              ...(target ?? []).slice(0, index),
              ...(target ?? []).slice(index + 1),
            ])
            .get() as B,
          (target ?? a) as A,
        ) as A,
      ),
    ins: (index: number, value: ArrayItem<B> | B, target?: A) =>
      lens(
        set(
          lens(get((target ?? a) as A))
            .mod((target) => [
              ...(target ?? []).slice(0, index),
              ...(Array.isArray(value) ? value : [value]),
              ...(target ?? []).slice(index),
            ])
            .get() as B,
          (target ?? a) as A,
        ) as A,
      ),
    cat: (value: ArrayItem<B> | B, target?: A) =>
      lens(
        set(
          lens(get((target ?? a) as A))
            .mod((target) => [
              ...(target ?? []),
              ...(Array.isArray(value) ? value : [value]),
            ])
            .get() as B,
          (target ?? a) as A,
        ) as A,
      ),
  }
}

function getTarget<T>(key: Prop) {
  return (key.toString().match(/^\+?(0|[1-9]\d*)$/) ? [] : {}) as T
}

function proxyLens<A, B>(
  get: Getter<A, B> | ArrayGetter<A, B>,
  set: Setter<A, B> | ArraySetter<A, B>,
  root?: A,
): ProxyLens<A, B> {
  return new Proxy(
    {
      ...baseLens(get as Getter<A, B>, set as Setter<A, B>, root),
      ...arrayLens(get as ArrayGetter<A, B>, set as ArraySetter<A, B>, root),
    } as ProxyLens<A, B>,
    {
      get: (lens, key) =>
        lens[key as keyof Lens<A, B>] ??
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
    },
  )
}

export function lens<A>(a?: A): ProxyLens<A, A> {
  return proxyLens<A, A>(
    (a: A): A => a,
    (b: A, _: A): A => b,
    a,
  )
}
