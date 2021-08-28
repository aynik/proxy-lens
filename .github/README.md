# proxy-lens

[![npm version](https://badge.fury.io/js/proxy-lens.svg)](https://badge.fury.io/js/proxy-lens)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/aynik/proxy-lens.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/aynik/proxy-lens.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/aynik/proxy-lens.svg)

A type safe functional lens implemented via proxy

---

* [Install](#install)
* [API](#api)
    - [lens(root?: A): ProxyLens<A, A>](#lensaroot-a-proxylensa-a)
    - [Getter<A, B>](#gettera-b-type)
    - [Setter<A, B>](#settera-b-type)
    - [ProxyLens<A, B>](#proxylensa-b-type)
    - [ProxyTraversal<A, B>](#proxytraversala-b-type)
    - [BaseLens<A, B>](#baselensa-b-interface)
      + [.get(a?: A): B](#geta-a-b)
      + [.set(b: B, a?: A): A](#setb-b-a-a-a)
      + [.let(b: B): ProxyLens<A, A>](#letb-b-proxylensa-a)
      + [.peg(get: Getter<A, B>): ProxyLens<A, A>](#pegget-gettera-b-proxylensa-a)
      + [.mod(get: Getter<B, B>): ProxyLens<A, A>](#modget-getterb-b-proxylensa-a)
      + [.iso(get: Getter<B, C>, set: Setter<B, C>): ProxyLens<A, C>](#isocget-getterb-c-set-setterb-c-proxylensa-c)
    - [ArrayLens<A, B>](#arraylensa-b-interface)
      + [.del(index: number, a?: A): ProxyLens<A, A>](#delindex-number-a-a-proxylensa-a)
      + [.put(index: number, b: B | B[], a?: A): ProxyLens<A, A>](#putindex-number-b-b--b-a-a-proxylensa-a)
      + [.map(get: Getter<B, B>): ProxyLens<A, A>](#mapget-getterb-b-proxylensa-a)
      + [.tap(get?: Getter<B, boolean>): ProxyTraversal<A, B>](#tapget-getterb-boolean-proxytraversala-b)
* [Usage](#usage)
    - [Setup](#setup)
    - [Setting values with the `.set` method](#setting-values-with-the-set-method)
    - [Retrieving values with the `.get` method](#retrieving-values-with-the-get-method)
    - [Setting values and continuing with the `.let` method](#setting-values-and-continuing-with-the-let-method)
    - [Pegging lenses with the `.peg` method](#pegging-lenses-with-the-peg-method)
    - [Modifying lenses with the `.mod` method](#modifying-lenses-with-the-mod-method)
    - [Manipulating immutable arrays with the `.del` and `.put` methods](#manipulating-immutable-arrays-with-the-del-and-put-methods)
    - [Modifying array items with the `.map` method](#modifying-array-items-with-the-map-method)
    - [Traversing arrays using the `.tap` method](#traversing-arrays-using-the-tap-method)
    - [Using abstract lenses](#using-abstract-lenses)
    - [Recursive abstract lenses](#recursive-abstract-lenses)

---

## Install

```shell
yarn add proxy-lens
```

[Back to top ↑](#proxy-lens)

---

## API

`proxy-lens` exports the following members:

```typescript
import {
  lens,
  Getter,
  Setter,
  ProxyLens,
  BaseLens,
  ArrayLens,
} from 'proxy-lens';
```

[Back to top ↑](#proxy-lens)

---

### `lens<A>(root?: A): ProxyLens<A, A>`

It's the single factory function for creating proxy lenses, it takes a single optional argument which would serve both as the lens root type and value. If this argument is omitted then a type parameter is required and the lens becomes abstract (a root value would need to be passed later).


```typescript
lens({ a: 1 }) // :: ProxyLens<{ a: boolean }, { a: boolean }>
lens<Person>() // :: ProxyLens<Person, Person>
```

Proxy lenses provide two sets of methods for each level in the chain (including the root level), a base set of methods and an array-specific set of methods. The first is offered for every property and the second only to array properties. Let's see them in detail.

[Back to top ↑](#proxy-lens)

---

### `Getter<A, B>` (type)

Any function that implements the signature `(a: A) => B`.

[Back to top ↑](#proxy-lens)

---

### `Setter<A, B>` (type)

Any function that implements the signature `(b: B, a: A) => A`.

[Back to top ↑](#proxy-lens)

---

### `ProxyLens<A, B>` (type)

A union between the interfaces of `BaseLens<A, B>` and `ArrayLens<A, B>`. 

[Back to top ↑](#proxy-lens)

---

### `ProxyTraversal<A, B>` (type)

A special kind of [`ProxyLens`](#proxylensa-b-type) used to represent traversals.

[Back to top ↑](#proxy-lens)

---

### `BaseLens<A, B>` (interface)

```typescript
type BaseLens<A, B> = {
  get(target?: A): B
  set(value: B, target?: A): A
  let(value: B): ProxyLens<A, A>
  peg(get: Getter<A, B>): ProxyLens<A, A>
  mod(get: Getter<B, B>): ProxyLens<A, A>
  iso<C>(get: Getter<B, C>, set: Setter<B, C>): ProxyLens<A, C>
}
```

Base interface shared by all concrete or abstract lenses.

[Back to top ↑](#proxy-lens)

---

#### `.get(a?: A): B`

Gets a value via the current lens, the optional first parameter is either a given root value (for abstract lenses) or the root value that was passed to [`lens`](#lensaroot-a-proxylensa-a).

```typescript
lens({ a: { b: true }}).a.b.get() // :: true
lens<{ a: { b: boolean }}>().a.b.get({ a: { b: true }}) // :: true
```

[Back to top ↑](#proxy-lens)

---

#### `.set(b: B, a?: A): A`

Sets a value via the current lens, the first parameter is the value to set and the optional second parameter is either a given root value (for abstract lenses) or the root value that was passed to [`lens`](#lensaroot-a-proxylensa-a). It works on immutable root values and it always returns a copy of it containing the modifications.

```typescript
lens({ a: { b: 'hello' }}).a.b.set('bye') // :: { a: { b: 'bye' }}
lens<{ a: { b: string }}>().a.b.set('bye', { a: { b: 'hello' }}) // :: { a: { b: 'bye' }}
```

[Back to top ↑](#proxy-lens)

---

#### `.let(b: B): ProxyLens<A, A>`

Works similarly to [`.set`](#setb-b-a-a-a) but instead of returning the root value it returns a new lens of the root value, this way after using it other methods can be chained on it.

```typescript
lens({ a: false, b: true })
  .a.let(true)
  .b.let(false).get() // :: { a: true, b: false }

lens<{ a: boolean, b: boolean }>()
  .a.let(true)
  .b.let(false).get({ a: false, b: true }) // :: { a: true, b: false }

lens({ a: false, b: true })
  .a.let(true)
  .a.set(false) // :: { a: false, b: true } (overriden)

lens<{ a: boolean, b: boolean }>()
  .a.let(true)
  .a.set(false, { a: false, b: true }) // :: { a: false, b: true } (overriden)
```

[Back to top ↑](#proxy-lens)

---

#### `.peg(get: Getter<A, B>): ProxyLens<A, A>`

Pegs a getter (or another lens) to a given lens with the same signature. Like [`.let`](#letb-b-proxylensa-a) returns a lens focused on the root so other operations may be chained. 

```typescript
lens({ a: false, b: true })
  .a.peg(lens<{ a: boolean, b: boolean }>().b)
  .get() // :: { a: true, b: true }

lens({ a: false, b: true })
  .a.peg(lens<{ a: boolean, b: boolean }>().b)
  .b.set(false) // :: { a: false, b: false }

lens<{ a: boolean, b: boolean }>()
  .a.peg(lens<{ a: boolean, b: boolean }>().b)
  .get({ a: false, b: true }) // :: { a: true, b: true }

lens<{ a: boolean, b: boolean }>()
  .a.peg(lens<{ a: boolean, b: boolean }>().b)
  .b.set(false) // :: { a: false, b: false }
```

[Back to top ↑](#proxy-lens)

---

#### `.mod(get: Getter<B, B>): ProxyLens<A, A>`

It's a method used to modify lens outputs, suited for same-type value updates depending on arbitrary conditions. Takes a getter (or another lens) and like [`.let`](#letb-b-proxylensa-a) returns a lens focused on the root so other operations may be chained.

```typescript
lens({ a: { b: true }}).mod(
  (b: boolean): boolean => !b,
).get() // :: 'false'

lens<{ a: { b: boolean }}>().mod(
  (b: boolean): boolean => !b,
).get({ a: { b: true }}) // :: 'false'

```

[Back to top ↑](#proxy-lens)

---

#### `.iso<C>(get: Getter<B, C>, set: Setter<B, C>): ProxyLens<A, C>`

It's a method used to build modifications between two types `A` and `C` through a common type `B`. It takes one getter (or a lens, because it works as a getter) and an optional setter in case we want it to be a two way transformation. It then returns a new lens from the previous root type `A` to the new target type `C`.

```typescript
lens({ a: { b: true }}).iso(
  (b: boolean): string => String(b),
  (c: string): boolean => c === 'true'
).get() // :: 'true'

lens({ a: { b: true }}).iso(
  (b: boolean): string => String(b),
  (c: string): boolean => c === 'true'
).set('true') // :: { a: { b: true }}

lens<{ a: { b: boolean }}>().iso(
  (b: boolean): string => String(b),
  (c: string): boolean => c === 'true'
).get({ a: { b: true }}) // :: 'true'

lens({ a: { b: boolean }}).iso(
  (b: boolean): string => String(b),
  (c: string): boolean => c === 'true'
).set('true', { a: { b: true }}) // :: { a: { b: true }}
```

[Back to top ↑](#proxy-lens)

---

### `ArrayLens<A, B>` (interface)

```typescript
type ArrayLens<A, B> = {
  del(index: number, a?: A): ProxyLens<A, A>
  put(index: number, b: B | B[], a?: A): ProxyLens<A, A>
}
```

This interface is available for lenses focused on array types.

[Back to top ↑](#proxy-lens)

---

#### `.del(index: number, a?: A): ProxyLens<A, A>`

Used to perform a deletion of a given array item by index. It takes the given index to delete and like [`.let`](#letb-b-proxylensa-a) returns a lens focused on the root so other operations may be chained.

```typescript
lens({ a: [{ b: 'delme' }] }).a.del(0).get() // :: { a: [] }
lens<{ a: { b: string }[] }>().a.del(0).get({ a: [{ b: 'delme' }] }) // :: { a: [] }
```

[Back to top ↑](#proxy-lens)

---

#### `.put(index: number, b: B | B[], a?: A): ProxyLens<A, A>`

Used to perform a non-destructive insert of a one or more array items by index or by negative offset (`-1` being the last position and so on), it takes the value to insert and like [`.let`](#letb-b-proxylensa-a) returns a lens focused on the root so other operations may be chained.

```typescript
lens({ a: ['keep'] })
  .a.put(0, 'insert').get() // :: { a: ['insert', 'keep'] }

lens({ a: ['keep'] })
  .a.put(-1, 'insert').get() // :: { a: ['keep', 'insert'] }

lens({ a: ['keep'] })
  .a.put(0, ['insert', 'many']).get() // :: { a: ['insert', 'many', 'keep'] }

lens({ a: ['keep'] })
  .a.put(-1, ['insert', 'many']).get() // :: { a: ['keep', 'insert', 'many'] }

lens<{ a: string[] }>()
  .a.put(0, 'insert', { a: ['keep'] }).get() // :: { a: ['insert', 'keep'] }

lens<{ a: string[] }>()
  .a.put(-1, 'insert', { a: ['keep'] }).get() // :: { a: ['keep', 'insert'] }

lens<{ a: string[] }>()
  .a.put(0, ['insert', 'many'], { a: ['keep'] }).get() // :: { a: ['insert', 'many', 'keep'] }

lens<{ a: string[] }>()
  .a.put(-1, ['insert', 'many'], { a: ['keep'] }).get() // :: { a: ['keep', 'insert', 'many'] }
```

[Back to top ↑](#proxy-lens)

---

#### `.map(get: Getter<B, B>): ProxyLens<A, A>`

It works like the [`.mod`](#modget-getterb-b-proxylensa-a) method but for array items.

```typescript
lens({ a: ['map'] })
  .a.map((str) => str.toUpperCase()).get() // :: { a: ['MAP'] }

lens<{ a: string[] }>()
  .a.map((str) => str.toUpperCase())
  .get({ a: ['map'] }) // :: { a: ['MAP'] }
```

[Back to top ↑](#proxy-lens)

---

#### `.tap(get?: Getter<B, boolean>): ProxyTraversal<A, B>`

It's used to create traversal lenses from arrays, traversal lenses work like regular lenses but they are focused on the collection of values of a given property. It takes an optional getter that returns a boolean which can be used to filter the collection of values.

```typescript
lens({ a: [{ b: 'traversal'}, { b: 'lens' }] })
  .a.tap().b.get() // :: ['traversal', 'lens']

lens<{ a: { b: string }[] }>()
  .a.tap()
  .b.get({ a: [{ b: 'traversal'}, { b: 'lens' }] }) // :: ['traversal', 'lens']

lens({ a: [{ b: 'traversal'}, { b: 'lens' }] })
  .a.tap(({ b }) => b[0] === 'l').b.get() // :: ['lens']

lens<{ a: { b: string }[] }>()
  .a.tap(({ b }) => b[0] === 'l').b.get() // :: ['lens']
  .b.get({ a: [{ b: 'traversal'}, { b: 'lens' }] }) // :: ['lens']

lens({ a: [{ b: 'traversal'}, { b: 'lens' }] })
  .a.tap()
  .b.set(['modified', 'value']) // :: { a: [ { b: 'modified' }, { b: 'value' } ] }

lens({ a: { b: string }[] })
  .a.tap().b.set(
    ['modified', 'value'],
    { a: [{ b: 'traversal'}, { b: 'lens' }] }
  ) // :: { a: [ { b: 'modified' }, { b: 'value' } ] }

lens({ a: [{ b: 'traversal'}, { b: 'lens' }] })
  .a.tap(({ b }) => b[0] === 'l')
  .b.set(['modified']) // :: { a: [ { b: 'traversal' }, { b: 'modified' } ] }

lens({ a: { b: string }[] })
  .a.tap(({ b }) => b[0] === 'l')
  .b.set(
    ['modified'],
    { a: [{ b: 'traversal'}, { b: 'lens' }] }
  ) // :: { a: [ { b: 'traversal' }, { b: 'modified' } ] }
```

[Back to top ↑](#proxy-lens)

---

## Usage

Here's a throughout usage example.

[Back to top ↑](#proxy-lens)

---

### Setup

First we need to import the `lens` function from this library.

```typescript
import { lens } from 'proxy-lens';
```

We can create now some testing types that we will use through the example.

```typescript
type Hobby = {
  name: string;
};

type Street = {
  name: string;
};

type Address = {
  city: string;
  street: Street;
  zip?: number;
};

type Company = {
  name: string;
  address?: Address;
};

type Person = {
  name: string;
  company?: Company;
  hobbies?: Hobby[];
};
```

Then let's create some people.

```typescript
const john: Person = {
  name: 'John Wallace'
};

const mary: Person = {
  name: 'Mary Sanchez'
};

const michael: Person = {
  name: 'Michael Collins'
};
```

[Back to top ↑](#proxy-lens)

---

### Setting values with the [`.set`](#setb-b-a-a-a) method

Lets now assign some of them a company via the proxy lens [`.set`](#setb-b-a-a-a) method, the comment next the operation displays what will be returned.

```typescript
import { strict as assert } from 'assert'; // to check the results

const employedJohn = lens(john).company.set({
  name: 'Microsoft',
  address: { city: 'Redmond' }
});

assert.deepEqual(employedJohn, {
  name: 'John Wallace',
  company: { name: 'Microsoft', address: { city: 'Redmond' } },
})

const employedMichael = lens(michael).company.set({
  name: 'Google'
});

assert.deepEqual(employedMichael, {
  name: 'Michael Collins',
  company: { name: 'Google' }
});
```

[Back to top ↑](#proxy-lens)

---

### Retrieving values with the [`.get`](#geta-a-b) method 

Now for example we can fetch the related companies of all using the [`.get`](#geta-a-b) method, even if some have null companies.

```typescript
const employedJohnCompany = lens(employedJohn).company.name.get();

assert.equal(employedJohnCompany, 'Microsoft');

const unemployedMaryCompany = lens(mary).company.name.get();

assert.equal(unemployedMaryCompany, undefined);

const employedMichaelCompany = lens(employedMichael).company.name.get();

assert.equal(employedMichaelCompany, 'Google');
```

[Back to top ↑](#proxy-lens)

---

### Setting values and continuing with the [`.let`](#letb-b-proxylensa-a) method

We can use the [`.let`](#letb-b-proxylensa-a) method to perform sets on different slices of the parent object, at the end of the edition we can call [`.get`](#geta-a-b) to return the parent value (otherwise we keep getting the parent lens).

```typescript
const localizedEmployedJohn = lens(employedJohn)
  .company.name.let('Apple')
  .company.address.city.let('Cupertino')
  .get();

assert.deepEqual(localizedEmployedJohn, {
  name: 'John Wallace',
  company: { name: 'Apple', address: { city: 'Cupertino' } }
});

const localizedEmployedMary = lens(mary)
  .company.name.let('Microsoft')
  .company.address.let({
    city: 'Redmond',
    street: { name: '15010 NE 36th St' },
    zip: 98052
  })
  .get();

assert.deepEqual(localizedEmployedMary, {
  name: 'Mary Sanchez',
  company: {
    name: 'Microsoft',
    address: {
      city: 'Redmond',
      street: { name: '15010 NE 36th St' },
      zip: 98052
    }
  }
});
```

[Back to top ↑](#proxy-lens)

---

### Pegging lenses with the [`.peg`](#pegget-gettera-b-proxylensa-a) method

Sometimes we want a lens to depend on other lens, an easy way to do this is to use the [`.peg`](#pegget-gettera-b-proxylensa-a) method, where we can pass another lens so the value of the first is derived from the second.

```typescript
const freelancerJohn = lens(john).company.name.peg(lens<Person>().name).get()

assert.deepEqual(freelancerJohn, {
  name: 'John Wallace',
  company: { name: 'John Wallace' },
})
```

Please note that we used a one-way mod to append a string to John's name.

[Back to top ↑](#proxy-lens)

---

### Modifying lenses with the [`.mod`](#modget-getterb-b-proxylensa-a) method

We can upgrade the previously generated object by transforming the company name so it reflects that John is now running his own startup.

```typescript
const enterpreneurJohn = lens(freelancerJohn)
  .company.name.mod((name): string => `${name} Inc.`)
  .get()

assert.deepEqual(enterpreneurJohn, {
  name: 'John Wallace',
  company: { name: 'John Wallace Inc.' },
})
```

[Back to top ↑](#proxy-lens)

---

### Transforming lenses with the [`.iso`](#isocget-getterb-c-set-setterb-c-proxylensa-c) method

Transforming lenses from one type to another and viceversa is relatively simple with this method, we just need to provide a getter and a setter that produce the required type for each side of the transformation.

```typescript
const nameSplitterIso = lens<Person>().name.iso(
  (name): { first: string; last: string } => ({
    first: name.split(' ')[0],
    last: name.split(' ').slice(1).join(' '),
  }),
  ({ first, last }): string => `${first} ${last}`,
)

const johnSplitName = nameSplitterIso.get(john)

assert.deepEqual(johnSplitName, { first: 'John', last: 'Wallace' })

const johnIsNowRobert = nameSplitterIso.set(
  { first: 'Robert', last: 'Wilcox' },
  john,
)

assert.deepEqual(johnIsNowRobert, { name: 'Robert Wilcox' })


```

[Back to top ↑](#proxy-lens)

---

### Manipulating immutable arrays with the [`.del`](#delindex-number-a-a-proxylensa-a) and [`.put`](#putindex-number-b-b--b-a-a-proxylensa-a) methods

Aside of support for array access by index, there's also three extra operations for array types to manipulate their contents based on a given index, these are [`.del`](#delindex-number-a-a-proxylensa-a) to delete an item at a given index and [`.put`](#putindex-number-b-b--b-a-a-proxylensa-a) to insert one or more items at a given place (without overwriting other items). Let's see how they're used.

```typescript
const fisherMary = lens(mary).hobbies[0].name.set('Fishing');

assert.deepEqual(fisherMary, {
  name: 'Mary Sanchez',
  hobbies: [{ name: 'Fishing' }]
});

const boredMary = lens(mary)
  .hobbies.del(0)
  .get();

assert.deepEqual(boredMary, { name: 'Mary Sanchez', hobbies: [] });

const sailorMary = lens(mary)
  .hobbies.put(0, { name: 'Fishing' })
  .hobbies.put(-1, { name: 'Boating' })
  .hobbies.put(1, [{ name: 'Swimming' }, { name: 'Rowing' }])
  .get();

assert.deepEqual(sailorMary, {
  name: 'Mary Sanchez',
  hobbies: [
    { name: 'Fishing' },
    { name: 'Swimming' },
    { name: 'Rowing' },
    { name: 'Boating' }
  ]
});
```

[Back to top ↑](#proxy-lens)

---

### Modifying array items with the `.map` method

With this method we can map arrays against a modification getter.

```typescript
const people = [john, michael, mary]

const upperCaseNamePeople = lens(people)
  .map(({ name, ...person }) => ({
    ...person,
    name: name.toUpperCase(),
  }))
  .get()

assert.deepEqual(upperCaseNamePeople, [
  { name: 'JOHN WALLACE' },
  { name: 'MICHAEL COLLINS' },
  { name: 'MARY SANCHEZ' },
])
```


[Back to top ↑](#proxy-lens)

---

### Traversing arrays using the `.tap` method

Often times we want to work with a given array item property, for this we use traversal lenses which can be created this way.

```typescript
const peopleNames = lens(people).tap().name.get()

assert.deepEqual(peopleNames, [
  'John Wallace',
  'Michael Collins',
  'Mary Sanchez',
])

const peopleNamesStartingWithM = lens(people)
  .tap(({ name }) => name[0] === 'M')
  .name.get()

assert.deepEqual(peopleNamesStartingWithM, ['Michael Collins', 'Mary Sanchez'])

const surnameFirstPeople = lens(people)
  .tap()
  .name.map((name: string) => name.split(' ').reverse().join(', '))
  .get()

assert.deepEqual(surnameFirstPeople, [
  { name: 'Wallace, John' },
  { name: 'Collins, Michael' },
  { name: 'Sanchez, Mary' },
])
```

[Back to top ↑](#proxy-lens)

---

### Using abstract lenses

We can also use the lens methods in an abstract way, so we can pass it to higher order functions:

```typescript
const allCompanies = [
  localizedEmployedJohn,
  localizedEmployedMary,
  employedMichael
].map(lens<Person>().company.name.get);

assert.deepEqual(allCompanies, ['Apple', 'Microsoft', 'Google']);
```

[Back to top ↑](#proxy-lens)

---

### Recursive abstract lenses

This library supports recursive types, that means we can work with generic data structures like `Json`. 

```typescript
type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

const jsonLens = lens<Json>()

assert.deepEqual(
  jsonLens.name
    .let('Jason Finch')
    .hobbies[0].let({ name: 'Electronics' })
    .company.name.let('Toshiba')
    .company.address.set({
      street: 'Shibaura 1-chome, 1-1',
      city: 'Minato-ku',
      zip: '105-8001',
    }),
  {
    name: 'Jason Finch',
    hobbies: [
      {
        name: 'Electronics',
      },
    ],
    company: {
      name: 'Toshiba',
      address: {
        street: 'Shibaura 1-chome, 1-1',
        city: 'Minato-ku',
        zip: '105-8001',
      },
    },
  },
)
```
