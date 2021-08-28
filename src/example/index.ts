// Setup

import { strict as assert } from 'assert'
import { lens } from '..'

type Hobby = {
  name: string
}

type Street = {
  name: string
}

type Address = {
  city: string
  street?: Street
  zip?: number
}

type Company = {
  name: string
  address?: Address
}

type Person = {
  name: string
  company?: Company
  hobbies?: Hobby[]
}

const john: Person = {
  name: 'John Wallace',
}

const mary: Person = {
  name: 'Mary Sanchez',
}

const michael: Person = {
  name: 'Michael Collins',
}

// Setting values with the `.set()` method

const employedJohn = lens(john).company.set({
  name: 'Microsoft',
  address: { city: 'Redmond' },
})

assert.deepEqual(employedJohn, {
  name: 'John Wallace',
  company: { name: 'Microsoft', address: { city: 'Redmond' } },
})

const employedMichael = lens(michael).company.set({
  name: 'Google',
})

assert.deepEqual(employedMichael, {
  name: 'Michael Collins',
  company: { name: 'Google' },
})

// Retrieving values with the `.get()` method

const employedJohnCompany = lens(employedJohn).company.name.get()

assert.equal(employedJohnCompany, 'Microsoft')

const unemployedMaryCompany = lens(mary).company.name.get()

assert.equal(unemployedMaryCompany, undefined)

const employedMichaelCompany = lens(employedMichael).company.name.get()

assert.equal(employedMichaelCompany, 'Google')

// Setting values and continuing with the `.let()` method

const localizedEmployedJohn = lens(employedJohn)
  .company.name.let('Apple')
  .company.address.city.let('Cupertino')
  .get()

assert.deepEqual(localizedEmployedJohn, {
  name: 'John Wallace',
  company: { name: 'Apple', address: { city: 'Cupertino' } },
})

const localizedEmployedMary = lens(mary)
  .company.name.let('Microsoft')
  .company.address.set({
    city: 'Redmond',
    street: { name: '15010 NE 36th St' },
    zip: 98052,
  })

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
})

// Pegging lenses with the `.peg()` method

const freelancerJohn = lens(john).company.name.peg(lens<Person>().name).get()

assert.deepEqual(freelancerJohn, {
  name: 'John Wallace',
  company: { name: 'John Wallace' },
})

// Modifying lenses with the `.mod()` method

const enterpreneurJohn = lens(freelancerJohn)
  .company.name.mod((name): string => `${name} Inc.`)
  .get()

assert.deepEqual(enterpreneurJohn, {
  name: 'John Wallace',
  company: { name: 'John Wallace Inc.' },
})

// Transforming lenses with the `.iso()` method

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

// Manipulating immutable arrays with the `.del()` and `.put()` methods

const fisherMary = lens(mary).hobbies[0].name.set('Fishing')

assert.deepEqual(fisherMary, {
  name: 'Mary Sanchez',
  hobbies: [{ name: 'Fishing' }],
})

const boredMary = lens(mary).hobbies.del(0).get()

assert.deepEqual(boredMary, { name: 'Mary Sanchez', hobbies: [] })

const sailorMary = lens(mary)
  .hobbies.put(0, { name: 'Fishing' })
  .hobbies.put(-1, { name: 'Boating' })
  .hobbies.put(1, [{ name: 'Swimming' }, { name: 'Rowing' }])
  .get()

assert.deepEqual(sailorMary, {
  name: 'Mary Sanchez',
  hobbies: [
    { name: 'Fishing' },
    { name: 'Swimming' },
    { name: 'Rowing' },
    { name: 'Boating' },
  ],
})

// Modifying array items with the `.map()` method

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

// Traversing arrays using the `.tap()` method

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

// Using abstract lenses

const allCompanies = [
  localizedEmployedJohn,
  localizedEmployedMary,
  employedMichael,
].map(lens<Person>().company.name.get)

assert.deepEqual(allCompanies, ['Apple', 'Microsoft', 'Google'])

// Recursive abstract lenses

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
