# proxy-lens

[![npm version](https://badge.fury.io/js/proxy-lens.svg)](https://badge.fury.io/js/proxy-lens)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/aynik/proxy-lens.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/aynik/proxy-lens.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/aynik/proxy-lens.svg)

A type safe functional lens implemented via proxy

## Install

```shell
yarn add proxy-lens
```

## API

`proxy-lens` exports the following members:

```typescript
import {
  lens,
  Getter,
  Setter,
  ArrayItem,
  ProxyLens,
  ProxyLensBaseMethods,
  ProxyLensArrayMethods
} from 'proxy-lens';
```

### `lens` (function)

It's the single factory function for creating proxy lenses, it takes a single optional argument which would serve both as the lens root type and value. If this argument is omitted then a type parameter is required and the lens becomes abstract (a root value would need to be passed later).


```typescript
lens({ a: 1 }) // :: ProxyLens<{ a: boolean }, { a: boolean }>
lens<Person>() // :: ProxyLens<Person, Person>
```

Proxy lenses provide two sets of methods for each level in the chain (including the root level), a base set of methods and an array-specific set of methods. The first is offered for every property and the second only to array properties. Let's see them in detail.

### `ProxyLensBaseMethods` (type)

```typescript
type ProxyLensBaseMethods<A, B> = {
  get(a?: A): B
  set(b: B, a?: A): A
  put(b: B): ProxyLens<A, A>
  mod(fn: (b: B) => B): ProxyLens<A, B>
  iso<C>(get: Getter<B, C>, set: Setter<B, C>): ProxyLens<A, C>
}
```

#### `get(a?: A): B` (method)

Gets a value via the current lens, the optional first parameter is either a given root value (for abstract lenses) or the root value that was passed to `lens()`.

```typescript
lens({ a: { b: true }}).a.b.get() // :: true
lens<{ a: { b: boolean }}>().a.b.get({ a: { b: true }}) // :: true
```

#### `set(b: B, a?: A): A` (method)

Sets a value via the current lens, the first parameter is the value to set and the optional second parameter is either a given root value (for abstract lenses) or the root value that was passed to `lens()`. It works on immutable root values and it always returns a copy of it containing the modifications.

```typescript
lens({ a: { b: 'hello' }}).a.b.set('bye') // :: { a: { b: 'bye' }}
lens<{ a: { b: string }}>().a.b.set('bye', { a: { b: 'hello' }}) // :: { a: { b: 'bye' }}
```

#### `put(b: B): ProxyLens<A, A>` (method)

Works similarly to `set()` but instead of returning the root value it returns a new lens of the root value, this way after using it other methods can be chained on it. 

```typescript
lens({ a: false, b: true })
  .a.put(true)
  .b.put(false).get() // :: { a: true, b: false }

lens<{ a: boolean, b: boolean }>()
  .a.put(true)
  .b.put(false).get({ a: false, b: true }) // :: { a: true, b: false }

lens({ a: false, b: true })
  .a.put(true)
  .a.set(false) // :: { a: false, b: true } (overriden)

lens<{ a: boolean, b: boolean }>()
  .a.put(true)
  .a.set(false, { a: false, b: true }) // :: { a: false, b: true } (overriden)
```

#### `mod(fn: (b: B) => B): ProxyLens<A, B>` (method)

It's a method used to modify inputs and outputs of the current lens, it takes a function that receives an input or output value and returns a value of the same type. The method then returns a new lens focused on the property that was modified.

```typescript
lens({ a: { b: true }}).mod(
  (b: boolean): string => String(b)
).get() // :: 'true'

lens({ a: { b: true }}).mod(
  (b: boolean): string => String(b)
).set(true) // :: { a: { b: 'true' }}

lens<{ a: { b: boolean }}>().mod(
  (b: boolean): string => String(b)
).get({ a: { b: true }}) // :: 'true'

lens<{ a: { b: boolean | string }}>().mod(
  (b: boolean): string => String(b)
).set(true) // :: { a: { b: 'true' }}
```

#### `iso<C>(get: Getter<B, C>, set: Setter<B, C>): ProxyLens<A, C>` (method)

It's a method used to build isomorphisms, that is, two-way transformations between input and output values. It takes two functions as arguments, one to transform the current value from a focused property and another to transform a given input into the current value of the focused property, then returns a new lens from the previous root type `A` to the new target type `C`.

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


### `ProxyLensArrayMethods` (type)

```typescript
type ProxyLensBaseMethods<A, B> = {
  del(index: number, a?: A): ProxyLens<A, A>
  ins(index: number, b: ArrayItem<B> | B, a?: A): ProxyLens<A, A>
  cat(b: ArrayItem<B> | B, a?: A): ProxyLens<A, A>
}
```

These methods are only available for properties focused on array types.

#### `del(index: number, a?: A): ProxyLens<A, A>` (method)

Used to perform a deletion of a given array item by index. It takes the given index and returns a lens focused on the root property.

```typescript
lens({ a: [{ b: 'delme' }] }).a.del(0).get() // :: { a: [] }
lens<{ a: { b: string }[] }>().a.del(0).get({ a: [{ b: 'delme' }] }) // :: { a: [] }
```

#### `ins(index: number, b: ArrayItem<B> | B, a?: A): ProxyLens<A, A>` (method)

Used to perform a non-destructive insert of a given array item by index, it takes the value to insert and returns a lens focused on the root property. It may take a value of the type `B` (the array) or an item contained in the type `B` (an item of the array).

```typescript
lens({ a: ['keep'] })
  .a.ins(0, 'insert').get() // :: { a: ['insert', 'keep'] }

lens({ a: ['keep'] })
  .a.ins(0, ['insert', 'many']).get() // :: { a: ['insert', 'many', 'keep'] }

lens<{ a: string[] }>()
  .a.ins(0, 'insert', { a: ['keep'] }).get() // :: { a: ['insert', 'keep'] }

lens<{ a: string[] }>()
  .a.ins(0, ['insert', 'many'], { a: ['keep'] }).get() // :: { a: ['insert', 'many', 'keep'] }
```
 
#### `cat(b: ArrayItem<B> | B, a?: A): ProxyLens<A, A>` (method)

Used to perform a concatenation of a given array item, it takes the value to concatenate and returns a lens focused on the root property. Similarly to `ins`, can take a value of the type `B` (the array) or an item contained in the type `B` (an item of the array).

```typescript
lens({ a: ['keep'] })
  .a.cat('concat').get() // :: { a: ['keep', 'concat'] }

lens({ a: ['keep'] })
  .a.cat(['concat', 'many']).get() // :: { a: ['keep', 'concat', 'many'] }

lens<{ a: string[] }>()
  .a.cat('concat', { a: ['keep'] }).get() // :: { a: ['keep', 'concat'] }

lens<{ a: string[] }>()
  .a.cat(['concat', 'many'], { a: ['keep'] }).get() // :: { a: ['keep', 'concat', 'many'] }
```

## Usage

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

Lets now assign some of them a company via the proxy lens `set` method, the comment next the operation displays what will be returned.

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

Now for example we can fetch the related companies of all using the `get` method, even if some have null companies.

```typescript
const employedJohnCompany = lens(employedJohn).company.name.get();

assert.equal(employedJohnCompany, 'Microsoft');

const unemployedMaryCompany = lens(mary).company.name.get();

assert.equal(unemployedMaryCompany, undefined);

const employedMichaelCompany = lens(employedMichael).company.name.get();

assert.equal(employedMichaelCompany, 'Google');
```

Aside of support for array access by index, there's also three extra operations for array types to manipulate their contents based on a given index, these are `del` to delete an item at a given index, `ins` to insert an item at a given place (without overwriting other items) and `cat` to concatenate an item at the end of the array. Let's see how they're used.

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
  .hobbies.ins(0, { name: 'Fishing' })
  .hobbies.cat({ name: 'Boating' })
  .hobbies.ins(1, [{ name: 'Swimming' }, { name: 'Rowing' }])
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

We can use the `put` method to perform sets on different slices of the parent object, at the end of the edition we can call `get` to return the parent value (otherwise we keep getting the parent lens).

```typescript
const localizedEmployedJohn = lens(employedJohn)
  .company.name.put('Apple')
  .company.address.city.put('Cupertino')
  .get();

assert.deepEqual(localizedEmployedJohn, {
  name: 'John Wallace',
  company: { name: 'Apple', address: { city: 'Cupertino' } }
});

const localizedEmployedMary = lens(mary)
  .company.name.put('Microsoft')
  .company.address.put({
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

We can also use the lens methods in an abstract way, so we can pass it to higher order functions:

```typescript
const allCompanies = [
  localizedEmployedJohn,
  localizedEmployedMary,
  employedMichael
].map(lens<Person>().company.name.get);

assert.deepEqual(allCompanies, ['Apple', 'Microsoft', 'Google']);
```

Lastly there are two extra utility methods, the first is named `mod` and it is used to automatically modify `get`, `set` and `put` operations.

```typescript
const allNamesUppercase = [
  localizedEmployedJohn,
  localizedEmployedMary,
  employedMichael
].map(lens<Person>().name.mod(name => name.toUpperCase()).get);

assert.deepEqual(allNamesUppercase, [
  'JOHN WALLACE',
  'MARY SANCHEZ',
  'MICHAEL COLLINS'
]);
```

And the second is named `iso` and is used to perform two-way isomorphic modifications.

```typescript
const nameSplitterIso = lens<Person>().name.iso(
  (name: string): { first: string; last: string } => ({
    first: name.split(' ')[0],
    last: name
      .split(' ')
      .slice(1)
      .join(' ')
  }),
  ({ first, last }): string => `${first} ${last}`
);

const johnSplitName = nameSplitterIso.get(john);

assert.deepEqual(johnSplitName, { first: 'John', last: 'Wallace' });

const johnIsNowRobert = nameSplitterIso.set(
  { first: 'Robert', last: 'Wilcox' },
  john
);

assert.deepEqual(johnIsNowRobert, { name: 'Robert Wilcox' });
```
