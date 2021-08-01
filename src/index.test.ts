import { lens } from '.'

describe('get', () => {
  it('gets a nested value', async () => {
    type S = { a: { b: { c: boolean } } }
    const source: S = { a: { b: { c: true } } }
    expect(lens(source).a.b.c.get()).toEqual(true)
  })

  it('gets a nested undefined value via undefined', async () => {
    type S = { a?: { b?: { c?: boolean } } }
    const source: S = {}
    expect(lens(source).a.b.c.get()).toEqual(undefined)
  })

  it('gets a nested undefined value via null', async () => {
    type S = { a: { b: { c: boolean } | null } | null }
    const source: S = { a: null }
    expect(lens(source).a.b.c.get()).toEqual(undefined)
  })

  it('gets a nested value using abstract lens', async () => {
    type S = { a: { b: { c: boolean } } }
    const source = { a: { b: { c: true } } }
    expect(lens<S>().a.b.c.get(source)).toEqual(true)
  })
})

describe('set', () => {
  it('sets a nested value', async () => {
    type S = { a: { b: { c: boolean } } }
    const source: S = { a: { b: { c: false } } }
    expect(lens(source).a.b.c.set(true)).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a nested value via undefined', async () => {
    type S = { a?: { b?: { c?: boolean } } }
    const source: S = {}
    expect(lens(source).a.b.c.set(true)).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('gets a nested undefined value via null', async () => {
    type S = { a: { b: { c: boolean | null } | null } | null }
    const source: S = { a: null }
    expect(lens(source).a.b.c.set(true)).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a nested value using abstract lens', async () => {
    type S = { a: { b: { c: boolean } } }
    const source = { a: { b: { c: false } } }
    expect(lens<S>().a.b.c.set(true, source)).toMatchObject({
      a: { b: { c: true } },
    })
  })
})

describe('put', () => {
  it('puts two nested values', async () => {
    type S = { a: { b: { c: boolean }; d: { e: { f: boolean } } } }
    const source: S = { a: { b: { c: false }, d: { e: { f: false } } } }
    expect(lens(source).a.b.c.put(true).a.d.e.f.put(true).get()).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('sets a nested value via undefined', async () => {
    type S = { a?: { b?: { c?: boolean }; d?: { e?: { f?: boolean } } } }
    const source: S = {}
    expect(lens(source).a.b.c.put(true).a.d.e.f.put(true).get()).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('gets a nested undefined value via null', async () => {
    type S = {
      a: {
        b: { c: boolean | null } | null
        d: { e: { f: boolean | null } | null } | null
      } | null
    }
    const source: S = { a: null }
    expect(lens(source).a.b.c.put(true).a.d.e.f.put(true).get()).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('puts two nested values using abstract lens', async () => {
    type S = { a: { b: { c: boolean }; d: { e: { f: boolean } } } }
    const source = { a: { b: { c: false }, d: { e: { f: false } } } }
    expect(
      lens<S>().a.b.c.put(true, source).a.d.e.f.put(true, source).get(source),
    ).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })
})

describe('mod', () => {
  it('gets a mod from a nested value', async () => {
    type S = { a: { b: { c: boolean } } }
    const source: S = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .get(),
    ).toEqual(false)
  })

  it('gets a mod from a nested undefined value via undefined', async () => {
    type S = { a?: { b?: { c?: boolean } } }
    const source: S = {}
    expect(
      lens(source)
        .a.b.c.mod((flag?: boolean): boolean => !flag)
        .get(),
    ).toEqual(true)
  })

  it('gets a mod from a nested undefined value via null', async () => {
    type S = { a: { b: { c: boolean | null } | null } | null }
    const source: S = { a: null }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean | null): boolean => !flag)
        .get(),
    ).toEqual(true)
  })

  it('gets a mod from a nested value using abstract lens', async () => {
    type S = { a: { b: { c: boolean } } }
    const source = { a: { b: { c: true } } }
    expect(
      lens<S>()
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .get(source),
    ).toEqual(false)
  })

  it('sets a mod from a nested value', async () => {
    type S = { a: { b: { c: boolean } } }
    const source: S = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .set(false),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a mod from a nested undefined value via undefined', async () => {
    type S = { a?: { b?: { c?: boolean } } }
    const source: S = {}
    expect(
      lens(source)
        .a.b.c.mod((flag?: boolean): boolean => !flag)
        .set(false),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a mod from a nested undefined value via null', async () => {
    type S = { a: { b: { c: boolean | null } | null } | null }
    const source: S = { a: null }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean | null): boolean => !flag)
        .set(false),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a mod from a nested value using abstract lens', async () => {
    type S = { a: { b: { c: boolean } } }
    const source = { a: { b: { c: true } } }
    expect(
      lens<S>()
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .set(false, source),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })
})

describe('iso', () => {
  it('gets an iso from a nested value', async () => {
    type S = { a: { b: { c: boolean } } }
    const source: S = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.iso(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('true')
  })

  it('gets an iso from a nested undefined value via undefined', async () => {
    type S = { a?: { b?: { c?: boolean } } }
    const source: S = {}
    expect(
      lens(source)
        .a.b.c.iso(
          (flag?: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('false')
  })

  it('gets an iso from a nested undefined value via null', async () => {
    type S = { a: { b: { c: boolean | null } | null } | null }
    const source: S = { a: null }
    expect(
      lens(source)
        .a.b.c.iso(
          (flag: boolean | null): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('false')
  })

  it('gets an iso from a nested value using abstract lens', async () => {
    type S = { a: { b: { c: boolean } } }
    const source = { a: { b: { c: true } } }
    expect(
      lens<S>()
        .a.b.c.iso(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(source),
    ).toEqual('true')
  })

  it('sets an iso from a nested value', async () => {
    type S = { a: { b: { c: boolean } } }
    const source: S = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.iso(
          (flag: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets an iso from a nested undefined value via undefined', async () => {
    type S = { a?: { b?: { c?: boolean } } }
    const source: S = {}
    expect(
      lens(source)
        .a.b.c.iso(
          (flag?: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets an iso from a nested undefined value via null', async () => {
    type S = { a: { b: { c: boolean | null } | null } | null }
    const source: S = { a: null }
    expect(
      lens(source)
        .a.b.c.iso(
          (flag: boolean | null): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets an iso from a nested value using abstract lens', async () => {
    type S = { a: { b: { c: boolean } } }
    const source = { a: { b: { c: true } } }
    expect(
      lens<S>()
        .a.b.c.iso(
          (flag: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true', source),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })
})
