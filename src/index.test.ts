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
  it('pegs a sibling value', () => {
    const source: { a: { c: boolean }; b: boolean } = {
      a: { c: false },
      b: true,
    }
    expect(
      lens(source).a.c.peg(lens<typeof source>().b.get).get(),
    ).toMatchObject({
      a: { c: true },
      b: true,
    })
  })

  it('pegs a sibling value via undefined', () => {
    const source: { a?: { c?: boolean }; b: boolean } = { b: true }
    expect(
      lens(source).a.c.peg(lens<typeof source>().b.get).get(),
    ).toMatchObject({
      a: { c: true },
      b: true,
    })
  })

  it('pegs a sibling value via null', () => {
    const source: { a: { c: boolean | null } | null; b: boolean } = {
      a: null,
      b: true,
    }
    expect(
      lens(source).a.c.peg(lens<typeof source>().b.get).get(),
    ).toMatchObject({
      a: { c: true },
      b: true,
    })
  })

  it('pegs a sibling value via array index', () => {
    const source: { a?: { c?: boolean }[]; b: boolean } = { b: true }
    expect(
      lens(source).a[0].c.peg(lens<typeof source>().b.get).get(),
    ).toMatchObject({
      a: [{ c: true }],
      b: true,
    })
  })

  it('pegs a sibling undefined value via array index', () => {
    const source: { a?: { c?: boolean }[]; b: boolean } = { b: true }
    expect(
      lens(source).a[0].c.peg(lens<typeof source>().b.get).get(),
    ).toMatchObject({
      a: [{ c: true }],
      b: true,
    })
  })

  it('pegs a sibling value using abstract lens', () => {
    const source = {
      a: { c: false },
      b: true,
    }
    expect(
      lens<{ a: { c: boolean }; b: boolean }>()
        .a.c.peg(lens<typeof source>().b.get)
        .get(source),
    ).toMatchObject({
      a: { c: true },
      b: true,
    })
  })

  it('pegs a nested value using abstract lens via array', () => {
    const source = {
      a: [{ c: false }],
      b: true,
    }
    expect(
      lens<{ a: { c: boolean }[]; b: boolean }>()
        .a[0].c.peg(lens<typeof source>().b.get)
        .get(source),
    ).toMatchObject({
      a: [{ c: true }],
      b: true,
    })
  })
})

describe('mod (one-way)', () => {
  it('gets an one-way mod from a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .get(),
    ).toEqual(false)
  })

  it('gets an one-way mod from a nested undefined value via undefined', () => {
    const source: { a?: { b?: { c?: boolean } } } = {}
    expect(
      lens(source)
        .a.b.c.mod((flag?: boolean): boolean => !flag)
        .get(),
    ).toEqual(true)
  })

  it('gets an one-way mod from a nested undefined value via null', () => {
    const source: { a: { b: { c: boolean | null } | null } | null } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean | null): boolean => !flag)
        .get(),
    ).toEqual(true)
  })

  it('gets an one-way mod from a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: true }] },
    }
    expect(
      lens(source)
        .a.b[0].c.mod((flag: boolean): boolean => !flag)
        .get(),
    ).toEqual(false)
  })

  it('gets an one-way mod from a nested undefined value via array index', () => {
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

  it('gets an one-way mod from a nested value using abstract lens', () => {
    const source = { a: { b: { c: true } } }
    expect(
      lens<{ a: { b: { c: boolean } } }>()
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .get(source),
    ).toEqual(false)
  })

  it('gets an one-way mod from a nested value using abstract lens via array index', () => {
    const source = { a: { b: [{ c: true }] } }
    expect(
      lens<{ a: { b: readonly { c: boolean }[] } }>()
        .a.b[0].c.mod((flag: boolean): boolean => !flag)
        .get(source),
    ).toEqual(false)
  })

  it('sets an one-way mod to no effect', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod((flag: boolean): boolean => !flag)
        .set(false),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })
})

describe('mod (two-way)', () => {
  it('gets a two-way mod from a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('true')
  })

  it('gets a two-way mod from a nested undefined value via undefined', () => {
    const source: { a?: { b?: { c?: boolean } } } = {}
    expect(
      lens(source)
        .a.b.c.mod(
          (flag?: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('false')
  })

  it('gets a two-way mod from a nested undefined value via null', () => {
    const source: { a: { b: { c: boolean | null } | null } | null } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b.c.mod(
          (flag: boolean | null): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('false')
  })

  it('gets a two-way mod from a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: true }] },
    }
    expect(
      lens(source)
        .a.b[0].c.mod(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('true')
  })

  it('gets a two-way mod from a nested undefined value via array index', () => {
    const source: {
      a: { b: readonly { c: boolean | null }[] | null } | null
    } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b[0].c.mod(
          (flag: boolean | null): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .get(),
    ).toEqual('false')
  })

  it('gets a two-way mod from a nested value using abstract lens', () => {
    const source = { a: { b: { c: true } } }
    expect(
      lens<{ a: { b: { c: boolean } } }>()
        .a.b.c.mod(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(source),
    ).toEqual('true')
  })

  it('gets a two-way mod from a nested value using abstract lens via array index', () => {
    const source = { a: { b: [{ c: true }] } }
    expect(
      lens<{ a: { b: readonly { c: boolean }[] } }>()
        .a.b[0].c.mod(
          (flag: boolean): string => String(flag),
          (str: string): boolean => str === 'true',
        )
        .get(source),
    ).toEqual('true')
  })

  it('sets a two-way mod from a nested value', () => {
    const source: { a: { b: { c: boolean } } } = { a: { b: { c: true } } }
    expect(
      lens(source)
        .a.b.c.mod(
          (flag: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a two-way mod from a nested undefined value via undefined', () => {
    const source: { a?: { b?: { c?: boolean } } } = {}
    expect(
      lens(source)
        .a.b.c.mod(
          (flag?: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a two-way mod from a nested undefined value via null', () => {
    const source: { a: { b: { c: boolean | null } | null } | null } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b.c.mod(
          (flag: boolean | null): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a two-way mod from a nested value via array index', () => {
    const source: { a: { b: readonly { c: boolean }[] } } = {
      a: { b: [{ c: true }] },
    }
    expect(
      lens(source)
        .a.b[0].c.mod(
          (flag: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })

  it('sets a two-way mod from a nested undefined value via array index', () => {
    const source: {
      a: { b: readonly { c: boolean | null }[] | null } | null
    } = {
      a: null,
    }
    expect(
      lens(source)
        .a.b[0].c.mod(
          (flag: boolean | null): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true'),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })

  it('sets a two-way mod from a nested value using abstract lens', () => {
    const source = { a: { b: { c: true } } }
    expect(
      lens<{ a: { b: { c: boolean } } }>()
        .a.b.c.mod(
          (flag: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true', source),
    ).toMatchObject({
      a: { b: { c: true } },
    })
  })

  it('sets a two-way mod from a nested value using abstract lens via array index', () => {
    const source = { a: { b: [{ c: true }] } }
    expect(
      lens<{ a: { b: readonly { c: boolean }[] } }>()
        .a.b[0].c.mod(
          (flag: boolean): string => String(!!flag),
          (str: string): boolean => str === 'true',
        )
        .set('true', source),
    ).toMatchObject({
      a: { b: [{ c: true }] },
    })
  })
})

describe('del (positive index)', () => {
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

describe('del (negative index)', () => {
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
      lens<{ a: { b: { c: string }[] } }>().a.b.del(-1, source).get(),
    ).toMatchObject({
      a: { b: [{ c: 'notouch' }] },
    })
  })
})

describe('put (positive index)', () => {
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
        .a.b.put(0, { c: 'insert' }, source)
        .get(),
    ).toMatchObject({
      a: { b: [{ c: 'insert' }, { c: 'notouch' }] },
    })
  })
})

describe('put (negative index)', () => {
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
        .a.b.put(-1, { c: 'insert' }, source)
        .get(),
    ).toMatchObject({
      a: { b: [{ c: 'notouch' }, { c: 'insert' }] },
    })
  })
})
