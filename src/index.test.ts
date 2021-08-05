import { lens } from '.'

describe('get', () => {
  it('gets a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(lens(source).a.b.c.get()).toEqual(true)
  })

  it('gets a nested undefined value via undefined', () => {
    const source: { a?: { b?: { c?: boolean } } } = {}
    expect(lens(source).a.b.c.get()).toEqual(undefined)
  })

  it('gets a nested undefined value via null', () => {
    const source: { a: { b: { c: boolean } | null } | null } = { a: null }
    expect(lens(source).a.b.c.get()).toEqual(undefined)
  })

  it('gets a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: true }] },
    }
    expect(lens(source).a.b[0].c.get()).toEqual(true)
  })

  it('gets a nested undefined value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] | null } | null } = {
      a: null,
    }
    expect(lens(source).a.b[0].c.get()).toEqual(undefined)
  })

  it('gets a nested value using abstract lens', () => {
    const source = { a: { b: { c: true } } }
    expect(lens<{ a: { b: { c: boolean } } }>().a.b.c.get(source)).toEqual(true)
  })

  it('gets a nested value using abstract lens via array', () => {
    const source = { a: { b: [{ c: true }] } }
    expect(lens<{ a: { b: { c: boolean }[] } }>().a.b[0].c.get(source)).toEqual(
      true,
    )
  })
})

describe('set', () => {
  it('sets a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: false } } }
    expect(lens(source).a.b.c.set(true)).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a nested value via undefined', () => {
    const source: { a?: { b?: { c?: boolean } } } = {}
    expect(lens(source).a.b.c.set(true)).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a nested value via null', () => {
    const source: { a: { b: { c: boolean | null } | null } | null } = {
      a: null,
    }
    expect(lens(source).a.b.c.set(true)).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: false }] },
    }
    expect(lens(source).a.b[0].c.set(true)).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })

  it('sets a nested undefined value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] | null } | null } = {
      a: null,
    }
    expect(lens(source).a.b[0].c.set(true)).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })

  it('sets a nested value using abstract lens', () => {
    const source = { a: { b: { c: false } } }
    expect(
      lens<{ a: { b: { c: boolean } } }>().a.b.c.set(true, source),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a nested value using abstract lens via array', () => {
    const source = { a: { b: [{ c: false }] } }
    expect(
      lens<{ a: { b: { c: boolean }[] } }>().a.b[0].c.set(true, source),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })
})

describe('put', () => {
  it('puts two nested values', () => {
    const source: { a: { b: { c: boolean }; d: { e: { f: boolean } } } } = {
      a: { b: { c: false }, d: { e: { f: false } } },
    }
    expect(lens(source).a.b.c.put(true).a.d.e.f.put(true).get()).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('puts two nested values via undefined', () => {
    const source: {
      a?: { b?: { c?: boolean }; d?: { e?: { f?: boolean } } }
    } = {}
    expect(lens(source).a.b.c.put(true).a.d.e.f.put(true).get()).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('puts two nested undefined values via null', () => {
    const source: {
      a: {
        b: { c: boolean | null } | null
        d: { e: { f: boolean | null } | null } | null
      } | null
    } = { a: null }
    expect(lens(source).a.b.c.put(true).a.d.e.f.put(true).get()).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('puts two nested values via array index', () => {
    const source: {
      a: { b: readonly { c: boolean }[]; d: { e: { f: boolean }[] } }
    } = {
      a: { b: [{ c: false }], d: { e: [{ f: false }] } },
    }
    expect(
      lens(source).a.b[0].c.put(true).a.d.e[0].f.put(true).get(),
    ).toMatchObject({
      a: { b: [{ c: true }], d: { e: [{ f: true }] } },
    })
  })

  it('puts two nested undefined values via array index', () => {
    const source: {
      a: {
        b: readonly { c: boolean | null }[] | null
        d: { e: readonly { f: boolean | null }[] | null } | null
      } | null
    } = { a: null }
    expect(
      lens(source).a.b[0].c.put(true).a.d.e[0].f.put(true).get(),
    ).toMatchObject({
      a: { b: [{ c: true }], d: { e: [{ f: true }] } },
    })
  })

  it('puts two nested values using abstract lens', () => {
    const source = { a: { b: { c: false }, d: { e: { f: false } } } }
    expect(
      lens<{ a: { b: { c: boolean }; d: { e: { f: boolean } } } }>()
        .a.b.c.put(true)
        .a.d.e.f.put(true)
        .get(source),
    ).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('puts two nested values using abstract lens via array index', () => {
    const source = { a: { b: [{ c: false }], d: { e: [{ f: false }] } } }
    expect(
      lens<{
        a: { b: readonly { c: boolean }[]; d: { e: readonly { f: boolean }[] } }
      }>()
        .a.b[0].c.put(true)
        .a.d.e[0].f.put(true)
        .get(source),
    ).toMatchObject({
      a: { b: [{ c: true }], d: { e: [{ f: true }] } },
    })
  })
})

describe('mod', () => {
  it('gets a mod from a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .get(),
    ).toEqual(false)
  })

  it('gets a mod from a nested undefined value via undefined', () => {
    const source: { a?: { b?: { c?: boolean } } } = {}
    expect(
      lens(source)
        .a.b.c.mod((flag?: boolean): boolean => !flag)
        .get(),
    ).toEqual(true)
  })

  it('gets a mod from a nested undefined value via null', () => {
    const source: { a: { b: { c: boolean | null } | null } | null } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean | null): boolean => !flag)
        .get(),
    ).toEqual(true)
  })

  it('gets a mod from a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: true }] },
    }
    expect(
      lens(source)
        .a.b[0].c.mod((flag: boolean): boolean => !flag)
        .get(),
    ).toEqual(false)
  })

  it('gets a mod from a nested undefined value via array index', () => {
    const source: {
      a: { b: readonly { c: boolean | null }[] | null } | null
    } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b[0].c.mod((flag: boolean | null): boolean => !flag)
        .get(),
    ).toEqual(true)
  })

  it('gets a mod from a nested value using abstract lens', () => {
    const source = { a: { b: { c: true } } }
    expect(
      lens<{ a: { b: { c: boolean } } }>()
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .get(source),
    ).toEqual(false)
  })

  it('gets a mod from a nested value using abstract lens via array index', () => {
    const source = { a: { b: [{ c: true }] } }
    expect(
      lens<{ a: { b: readonly { c: boolean }[] } }>()
        .a.b[0].c.mod((flag: boolean): boolean => !flag)
        .get(source),
    ).toEqual(false)
  })

  it('sets a mod from a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .set(false),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a mod from a nested undefined value via undefined', () => {
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

  it('sets a mod from a nested undefined value via null', () => {
    const source: { a: { b: { c: boolean | null } | null } | null } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean | null): boolean => !flag)
        .set(false),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a mod from a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: true }] },
    }
    expect(
      lens(source)
        .a.b[0].c.mod((flag: boolean): boolean => !flag)
        .set(false),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })

  it('sets a mod from a nested undefined value via array index', () => {
    const source: {
      a: { b: readonly { c: boolean | null }[] | null } | null
    } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b[0].c.mod((flag: boolean | null): boolean => !flag)
        .set(false),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })

  it('sets a mod from a nested value using abstract lens', () => {
    const source = { a: { b: { c: true } } }
    expect(
      lens<{ a: { b: { c: boolean } } }>()
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .set(false, source),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a mod from a nested value using abstract lens via array index', () => {
    const source = { a: { b: [{ c: true }] } }
    expect(
      lens<{ a: { b: readonly { c: boolean }[] } }>()
        .a.b[0].c.mod((flag: boolean): boolean => !flag)
        .set(false, source),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })
})

describe('iso', () => {
  it('gets an iso from a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.iso(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('true')
  })

  it('gets an iso from a nested undefined value via undefined', () => {
    const source: { a?: { b?: { c?: boolean } } } = {}
    expect(
      lens(source)
        .a.b.c.iso(
          (flag?: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('false')
  })

  it('gets an iso from a nested undefined value via null', () => {
    const source: { a: { b: { c: boolean | null } | null } | null } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b.c.iso(
          (flag: boolean | null): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('false')
  })

  it('gets an iso from a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: true }] },
    }
    expect(
      lens(source)
        .a.b[0].c.iso(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('true')
  })

  it('gets an iso from a nested undefined value via array index', () => {
    const source: {
      a: { b: readonly { c: boolean | null }[] | null } | null
    } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b[0].c.iso(
          (flag: boolean | null): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('false')
  })

  it('gets an iso from a nested value using abstract lens', () => {
    const source = { a: { b: { c: true } } }
    expect(
      lens<{ a: { b: { c: boolean } } }>()
        .a.b.c.iso(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(source),
    ).toEqual('true')
  })

  it('gets an iso from a nested value using abstract lens via array index', () => {
    const source = { a: { b: [{ c: true }] } }
    expect(
      lens<{ a: { b: readonly { c: boolean }[] } }>()
        .a.b[0].c.iso(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(source),
    ).toEqual('true')
  })

  it('sets an iso from a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
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

  it('sets an iso from a nested undefined value via undefined', () => {
    const source: { a?: { b?: { c?: boolean } } } = {}
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

  it('sets an iso from a nested undefined value via null', () => {
    const source: { a: { b: { c: boolean | null } | null } | null } = {
      a: null,
    }
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

  it('sets an iso from a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: true }] },
    }
    expect(
      lens(source)
        .a.b[0].c.iso(
          (flag: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })

  it('sets an iso from a nested undefined value via array index', () => {
    const source: {
      a: { b: readonly { c: boolean | null }[] | null } | null
    } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b[0].c.iso(
          (flag: boolean | null): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })

  it('sets an iso from a nested value using abstract lens', () => {
    const source = { a: { b: { c: true } } }
    expect(
      lens<{ a: { b: { c: boolean } } }>()
        .a.b.c.iso(
          (flag: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true', source),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets an iso from a nested value using abstract lens via array index', () => {
    const source = { a: { b: [{ c: true }] } }
    expect(
      lens<{ a: { b: readonly { c: boolean }[] } }>()
        .a.b[0].c.iso(
          (flag: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true', source),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })
})

describe('del', () => {
  it('deletes a nested item', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'delme' }] },
    }
    expect(lens(source).a.b.del(0).get()).toMatchObject({
      a: { b: [] },
    })
  })

  it('deletes a nested undefined item', () => {
    const source: { a: { b: { c: string }[] | null } | null } = {
      a: null,
    }
    expect(lens(source).a.b.del(0).get()).toMatchObject({
      a: { b: [] },
    })
  })

  it('deletes a nested item using abstract lens', () => {
    const source = {
      a: { b: [{ c: 'delme' }] },
    }
    expect(
      lens<{ a: { b: { c: string }[] } }>().a.b.del(0, source).get(),
    ).toMatchObject({
      a: { b: [] },
    })
  })
})

describe('ins', () => {
  it('inserts a nested item', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(lens(source).a.b.ins(0, { c: 'insert' }).get()).toMatchObject({
      a: { b: [{ c: 'insert' }, { c: 'notouch' }] },
    })
  })

  it('inserts many nested items', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(
      lens(source)
        .a.b.ins(0, [{ c: 'insert' }, { c: 'many' }])
        .get(),
    ).toMatchObject({
      a: { b: [{ c: 'insert' }, { c: 'many' }, { c: 'notouch' }] },
    })
  })

  it('inserts a nested item via null', () => {
    const source: { a: { b: { c: string }[] | null } | null } = {
      a: null,
    }
    expect(lens(source).a.b.ins(0, { c: 'insert' }).get()).toMatchObject({
      a: { b: [{ c: 'insert' }] },
    })
  })

  it('inserts a nested item using abstract lens', () => {
    const source = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(
      lens<{ a: { b: { c: string }[] } }>()
        .a.b.ins(0, { c: 'insert' }, source)
        .get(),
    ).toMatchObject({
      a: { b: [{ c: 'insert' }, { c: 'notouch' }] },
    })
  })
})

describe('cat', () => {
  it('concats a nested item', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(lens(source).a.b.cat({ c: 'concat' }).get()).toMatchObject({
      a: { b: [{ c: 'notouch' }, { c: 'concat' }] },
    })
  })

  it('concats many nested items', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(
      lens(source)
        .a.b.cat([{ c: 'concat' }, { c: 'many' }])
        .get(),
    ).toMatchObject({
      a: { b: [{ c: 'notouch' }, { c: 'concat' }, { c: 'many' }] },
    })
  })

  it('concats a nested item via null', () => {
    const source: { a: { b: { c: string }[] | null } | null } = {
      a: null,
    }
    expect(lens(source).a.b.cat({ c: 'concat' }).get()).toMatchObject({
      a: { b: [{ c: 'concat' }] },
    })
  })

  it('concats a nested item using abstract lens', () => {
    const source = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(
      lens<{ a: { b: { c: string }[] } }>()
        .a.b.cat({ c: 'concat' }, source)
        .get(),
    ).toMatchObject({
      a: { b: [{ c: 'notouch' }, { c: 'concat' }] },
    })
  })
})

describe('proxy', () => {
  it('implements ownKeys for object root', () => {
    expect(Object.keys(lens({}))).toEqual([
      'get',
      'set',
      'put',
      'mod',
      'iso',
      'del',
      'ins',
      'cat',
    ])
  })

  it('implements ownKeys for array root', () => {
    expect(Object.keys(lens([]))).toEqual([
      'get',
      'set',
      'put',
      'mod',
      'iso',
      'del',
      'ins',
      'cat',
    ])
  })

  it('implements ownKeys for abstract lens', () => {
    expect(Object.keys(lens())).toEqual([
      'get',
      'set',
      'put',
      'mod',
      'iso',
      'del',
      'ins',
      'cat',
    ])
  })
})
