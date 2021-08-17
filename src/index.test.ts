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

describe('let', () => {
  it('lets two nested values', () => {
    const source: { a: { b: { c: boolean }; d: { e: { f: boolean } } } } = {
      a: { b: { c: false }, d: { e: { f: false } } },
    }
    expect(lens(source).a.b.c.let(true).a.d.e.f.let(true).get()).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('lets two nested values via undefined', () => {
    const source: {
      a?: { b?: { c?: boolean }; d?: { e?: { f?: boolean } } }
    } = {}
    expect(lens(source).a.b.c.let(true).a.d.e.f.let(true).get()).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('lets two nested undefined values via null', () => {
    const source: {
      a: {
        b: { c: boolean | null } | null
        d: { e: { f: boolean | null } | null } | null
      } | null
    } = { a: null }
    expect(lens(source).a.b.c.let(true).a.d.e.f.let(true).get()).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('lets two nested values via array index', () => {
    const source: {
      a: { b: readonly { c: boolean }[]; d: { e: { f: boolean }[] } }
    } = {
      a: { b: [{ c: false }], d: { e: [{ f: false }] } },
    }
    expect(
      lens(source).a.b[0].c.let(true).a.d.e[0].f.let(true).get(),
    ).toMatchObject({
      a: { b: [{ c: true }], d: { e: [{ f: true }] } },
    })
  })

  it('lets two nested undefined values via array index', () => {
    const source: {
      a: {
        b: readonly { c: boolean | null }[] | null
        d: { e: readonly { f: boolean | null }[] | null } | null
      } | null
    } = { a: null }
    expect(
      lens(source).a.b[0].c.let(true).a.d.e[0].f.let(true).get(),
    ).toMatchObject({
      a: { b: [{ c: true }], d: { e: [{ f: true }] } },
    })
  })

  it('lets two nested values using abstract lens', () => {
    const source = { a: { b: { c: false }, d: { e: { f: false } } } }
    expect(
      lens<{ a: { b: { c: boolean }; d: { e: { f: boolean } } } }>()
        .a.b.c.let(true)
        .a.d.e.f.let(true)
        .get(source),
    ).toMatchObject({
      a: { b: { c: true }, d: { e: { f: true } } },
    })
  })

  it('lets two nested values using abstract lens via array index', () => {
    const source = { a: { b: [{ c: false }], d: { e: [{ f: false }] } } }
    expect(
      lens<{
        a: { b: readonly { c: boolean }[]; d: { e: readonly { f: boolean }[] } }
      }>()
        .a.b[0].c.let(true)
        .a.d.e[0].f.let(true)
        .get(source),
    ).toMatchObject({
      a: { b: [{ c: true }], d: { e: [{ f: true }] } },
    })
  })
})

describe('peg', () => {
  it('gets a pegged sibling value', () => {
    const source: { a: { c: boolean }; b: boolean } = {
      a: { c: false },
      b: true,
    }
    expect(lens(source).a.c.peg(lens<typeof source>().b).a.c.get()).toEqual(
      true,
    )
  })

  it('gets a pegged sibling value via undefined', () => {
    const source: { a?: { c?: boolean }; b?: boolean } = { b: true }
    expect(lens(source).a.c.peg(lens<typeof source>().b).a.c.get()).toEqual(
      true,
    )
  })

  it('gets a pegged sibling value via null', () => {
    const source: { a: { c: boolean | null } | null; b: boolean | null } = {
      a: null,
      b: true,
    }
    expect(lens(source).a.c.peg(lens<typeof source>().b).a.c.get()).toEqual(
      true,
    )
  })

  it('gets a pegged sibling value via array index', () => {
    const source: { a?: { c?: boolean }[]; b?: boolean } = { b: true }
    expect(
      lens(source).a[0].c.peg(lens<typeof source>().b).a[0].c.get(),
    ).toEqual(true)
  })

  it('gets a pegged sibling undefined value via array index', () => {
    const source: { a?: { c?: boolean }[]; b?: boolean } = { b: true }
    expect(
      lens(source).a[0].c.peg(lens<typeof source>().b).a[0].c.get(),
    ).toEqual(true)
  })

  it('gets a pegged sibling value using abstract lens', () => {
    const source: { a: { c: boolean }; b: boolean } = {
      a: { c: false },
      b: true,
    }
    expect(
      lens<typeof source>().a.c.peg(lens<typeof source>().b).a.c.get(source),
    ).toEqual(true)
  })

  it('gets a pegged nested value using abstract lens via array', () => {
    const source: { a: { c: boolean }[]; b: boolean } = {
      a: [{ c: false }],
      b: true,
    }
    expect(
      lens<typeof source>()
        .a[0].c.peg(lens<typeof source>().b)
        .a[0].c.get(source),
    ).toEqual(true)
  })

  it('sets a pegged sibling value', () => {
    const source: { a: { c: boolean }; b: boolean } = {
      a: { c: false },
      b: false,
    }
    expect(
      lens(source).a.c.peg(lens<typeof source>().b).b.set(true),
    ).toMatchObject({
      a: { c: true },
      b: true,
    })
  })

  it('sets a pegged sibling value via undefined', () => {
    const source: { a?: { c?: boolean }; b?: boolean } = {}
    expect(
      lens(source).a.c.peg(lens<typeof source>().b).b.set(true),
    ).toMatchObject({
      a: { c: true },
      b: true,
    })
  })

  it('sets a pegged sibling value via null', () => {
    const source: { a: { c: boolean | null } | null; b: boolean | null } = {
      a: null,
      b: null,
    }
    expect(
      lens(source).a.c.peg(lens<typeof source>().b).b.set(true),
    ).toMatchObject({
      a: { c: true },
      b: true,
    })
  })

  it('sets a pegged sibling value via array index', () => {
    const source: { a?: { c?: boolean }[]; b?: boolean } = {}
    expect(
      lens(source).a[0].c.peg(lens<typeof source>().b).b.set(true),
    ).toMatchObject({
      a: [{ c: true }],
      b: true,
    })
  })

  it('sets a pegged sibling undefined value via array index', () => {
    const source: { a?: { c?: boolean }[]; b?: boolean } = {}
    expect(
      lens(source).a[0].c.peg(lens<typeof source>().b).b.set(true),
    ).toMatchObject({
      a: [{ c: true }],
      b: true,
    })
  })

  it('sets a pegged sibling value using abstract lens', () => {
    const source: { a: { c: boolean }; b: boolean } = {
      a: { c: false },
      b: true,
    }
    expect(
      lens<typeof source>().a.c.peg(lens<typeof source>().b).set(source),
    ).toMatchObject({
      a: { c: true },
      b: true,
    })
  })

  it('sets a pegged nested value using abstract lens via array', () => {
    const source: { a: { c: boolean }[]; b: boolean } = {
      a: [{ c: false }],
      b: true,
    }
    expect(
      lens<typeof source>().a[0].c.peg(lens<typeof source>().b).set(source),
    ).toMatchObject({
      a: [{ c: true }],
      b: true,
    })
  })
})

describe('mod', () => {
  it('gets a mod from a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .a.b.c.get(),
    ).toEqual(false)
  })

  it('gets a mod from a nested undefined value via undefined', () => {
    const source: { a?: { b?: { c?: boolean } } } = {}
    expect(
      lens(source)
        .a.b.c.mod((flag?: boolean): boolean => !flag)
        .a.b.c.get(),
    ).toEqual(true)
  })

  it('gets a mod from a nested undefined value via null', () => {
    const source: { a: { b: { c: boolean | null } | null } | null } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean | null): boolean => !flag)
        .a.b.c.get(),
    ).toEqual(true)
  })

  it('gets a mod from a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: true }] },
    }
    expect(
      lens(source)
        .a.b[0].c.mod((flag: boolean): boolean => !flag)
        .a.b[0].c.get(),
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
        .a.b[0].c.get(),
    ).toEqual(true)
  })

  it('gets a mod from a nested value using abstract lens', () => {
    const source = { a: { b: { c: true } } }
    expect(
      lens<{ a: { b: { c: boolean } } }>()
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .a.b.c.get(source),
    ).toEqual(false)
  })

  it('gets a mod from a nested value using abstract lens via array index', () => {
    const source = { a: { b: [{ c: true }] } }
    expect(
      lens<{ a: { b: readonly { c: boolean }[] } }>()
        .a.b[0].c.mod((flag: boolean): boolean => !flag)
        .a.b[0].c.get(source),
    ).toEqual(false)
  })

  it('sets a mod to no effect', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .a.b.c.set(false),
    ).toMatchObject({
      a: { b: { c: true } },
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
      lens<{ a: { b: { c: string }[] } }>().a.b.del(0).get(source),
    ).toMatchObject({
      a: { b: [] },
    })
  })

  it('deletes a nested item in a negative position', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }, { c: 'delme' }] },
    }
    expect(lens(source).a.b.del(-1).get()).toMatchObject({
      a: { b: [{ c: 'notouch' }] },
    })
  })

  it('deletes a nested undefined item in a negative position', () => {
    const source: { a: { b: { c: string }[] | null } | null } = {
      a: null,
    }
    expect(lens(source).a.b.del(-1).get()).toMatchObject({
      a: { b: [] },
    })
  })

  it('deletes a nested item in a negative position using abstract lens', () => {
    const source = {
      a: { b: [{ c: 'notouch' }, { c: 'delme' }] },
    }
    expect(
      lens<{ a: { b: { c: string }[] } }>().a.b.del(-1).get(source),
    ).toMatchObject({
      a: { b: [{ c: 'notouch' }] },
    })
  })

  it('sets a previously deleted nested item', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(lens(source).a.b.del(0).set(source)).toMatchObject({
      a: { b: [{ c: 'notouch' }] },
    })
  })
})

describe('put', () => {
  it('puts a nested item', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(lens(source).a.b.put(0, { c: 'insert' }).get()).toMatchObject({
      a: { b: [{ c: 'insert' }, { c: 'notouch' }] },
    })
  })

  it('puts many nested items', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(
      lens(source)
        .a.b.put(0, [{ c: 'insert' }, { c: 'many' }])
        .get(),
    ).toMatchObject({
      a: { b: [{ c: 'insert' }, { c: 'many' }, { c: 'notouch' }] },
    })
  })

  it('puts a nested item via null', () => {
    const source: { a: { b: { c: string }[] | null } | null } = {
      a: null,
    }
    expect(lens(source).a.b.put(0, { c: 'insert' }).get()).toMatchObject({
      a: { b: [{ c: 'insert' }] },
    })
  })

  it('puts a nested item using abstract lens', () => {
    const source = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(
      lens<{ a: { b: { c: string }[] } }>()
        .a.b.put(0, { c: 'insert' })
        .get(source),
    ).toMatchObject({
      a: { b: [{ c: 'insert' }, { c: 'notouch' }] },
    })
  })

  it('puts a nested item in a negative position', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(lens(source).a.b.put(-1, { c: 'insert' }).get()).toMatchObject({
      a: { b: [{ c: 'notouch' }, { c: 'insert' }] },
    })
  })

  it('puts many nested items in a negative position', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(
      lens(source)
        .a.b.put(-1, [{ c: 'insert' }, { c: 'many' }])
        .get(),
    ).toMatchObject({
      a: { b: [{ c: 'notouch' }, { c: 'insert' }, { c: 'many' }] },
    })
  })

  it('puts a nested item in a negative position via null', () => {
    const source: { a: { b: { c: string }[] | null } | null } = {
      a: null,
    }
    expect(lens(source).a.b.put(-1, { c: 'insert' }).get()).toMatchObject({
      a: { b: [{ c: 'insert' }] },
    })
  })

  it('puts a nested item in a negative position using abstract lens', () => {
    const source = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(
      lens<{ a: { b: { c: string }[] } }>()
        .a.b.put(-1, { c: 'insert' })
        .get(source),
    ).toMatchObject({
      a: { b: [{ c: 'notouch' }, { c: 'insert' }] },
    })
  })

  it('sets a previously put nested item', () => {
    const source: { a: { b: { c: string }[] } } = {
      a: { b: [{ c: 'notouch' }] },
    }
    expect(lens(source).a.b.put(0, { c: 'insert' }).set(source)).toMatchObject({
      a: { b: [{ c: 'notouch' }] },
    })
  })
})
