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

## Usage

First we need to import the `lens` function from this library.


```typescript
import { lens } from 'proxy-lens'
```

We can create now some testing types that we will use through the example.

```typescript
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
};
```

Then let's create some people.

```typescript
const john: Person = {
  name: "John Wallace",
}

const mary: Person = {
  name: "Mary Sanchez",
}

const michael: Person = {
  name: "Michael Collins",
}
```

Lets now assign some of them a company via the proxy lens `set` method, the comment next the operation displays what will be returned.


```typescript
import { strict as assert } from 'assert'; // to check the results

const employedJohn = lens(john).company.set({
  name: "Microsoft",
});

assert.deepEqual(employedJohn, {
  name: 'John Wallace',
  company: { name: 'Microsoft' },
});

const employedMichael = lens(michael).company.set({
  name: "Google"
});

assert.deepEqual(employedMichael, {
  name: 'Michael Collins',
  company: { name: 'Google' },
});
```

Now for example we can fetch the related companies of all using the `get` method, even if some have null companies.

```typescript
const employedJohnCompany = lens(employedJohn).company.name.get();

assert.equal(employedJohnCompany, 'Microsoft');

const unemployedMaryCompany = lens(mary).company.name.get();

assert.equal(unemployedMaryCompany, undefined);

const employedMichaelCompany = lens(employedMichael).company.name.get();

assert.equal(employedMichaelCompany, "Google");
```

We can use the `put` method to perform sets on different slices of the parent object, at the end of the edition we can call `get` to return the parent value (otherwise we keep getting the parent lens).

```typescript
const localizedEmployedJohn = lens(employedJohn)
  .company.name.put("Apple")
  .company.address.city.put("Cupertino")
  .get();

assert.deepEqual(localizedEmployedJohn, {
  name: 'John Wallace',
  company: { name: 'Apple', address: { city: 'Cupertino' } },
});

const localizedEmployedMary = lens(mary)
  .company.name.put("Microsoft")
  .company.address.put({
    city: "Redmond",
    street: {name: "15010 NE 36th St"},
    zip: 98052,
  })
  .get();

assert.deepEqual(localizedEmployedMary, {
  name: 'Mary Sanchez',
  company: {
    name: 'Microsoft',
    address: {
      city: 'Redmond',
      street: { name: '15010 NE 36th St' },
      zip: 98052,
    },
  },
});
```

We can also use the lens methods in an abstract way, so we can pass it to higher order functions:

```typescript
const allCompanies = [
  localizedEmployedJohn,
  localizedEmployedMary,
  employedMichael,
].map(lens<Person>().company.name.get);

assert.deepEqual(allCompanies, ['Apple', 'Microsoft', 'Google']);
```

Lastly there are two extra utility methods, the first is named `mod` and it is used to automatically modify `get`, `set` and `put` operations.

```typescript
const allNamesUppercase = [
  localizedEmployedJohn,
  localizedEmployedMary,
  employedMichael,
].map(lens<Person>().name.mod((name) => name.toUpperCase()).get);

assert.deepEqual(allNamesUppercase, [
  'JOHN WALLACE',
  'MARY SANCHEZ',
  'MICHAEL COLLINS',
]);
```

And the second is named `iso` and is used to perform two-way isomorphic modifications.

```typescript
const nameSplitterIso = lens<Person>().name.iso(
  (name: string): { first: string, last: string } => ({
    first: name.split(" ")[0],
    last: name.split(" ").slice(1).join(" "),
  }),
  ({first, last}): string => `${first} ${last}`
)

const johnSplitName = nameSplitterIso.get(john);

assert.deepEqual(johnSplitName, { first: 'John', last: 'Wallace' });

const johnIsNowRobert = nameSplitterIso.set({first: "Robert", last: "Wilcox"}, john);

assert.deepEqual(johnIsNowRobert, { name: 'Robert Wilcox' });
```
