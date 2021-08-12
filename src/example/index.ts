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

const employedJohnCompany = lens(employedJohn).company.name.get()

assert.equal(employedJohnCompany, 'Microsoft')

const unemployedMaryCompany = lens(mary).company.name.get()

assert.equal(unemployedMaryCompany, undefined)

const employedMichaelCompany = lens(employedMichael).company.name.get()

assert.equal(employedMichaelCompany, 'Google')

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

const allCompanies = [
  localizedEmployedJohn,
  localizedEmployedMary,
  employedMichael,
].map(lens<Person>().company.name.get)

assert.deepEqual(allCompanies, ['Apple', 'Microsoft', 'Google'])

const selfEmployedJohn = lens(john)
  .company.name.peg(lens<Person>().name.mod((name) => `${name} Inc.`).get)
  .get()

assert.deepEqual(selfEmployedJohn, {
  name: 'John Wallace',
  company: { name: 'John Wallace Inc.' },
})

const nameSplitterMod = lens<Person>().name.mod(
  (name): { first: string; last: string } => ({
    first: name.split(' ')[0],
    last: name.split(' ').slice(1).join(' '),
  }),
  ({ first, last }): string => `${first} ${last}`,
)

const johnSplitName = nameSplitterMod.get(john)

assert.deepEqual(johnSplitName, { first: 'John', last: 'Wallace' })

const johnIsNowRobert = nameSplitterMod.set(
  { first: 'Robert', last: 'Wilcox' },
  john,
)

assert.deepEqual(johnIsNowRobert, { name: 'Robert Wilcox' })

const allNamesUppercase = [
  localizedEmployedJohn,
  localizedEmployedMary,
  employedMichael,
].map(lens<Person>().name.mod((name) => name.toUpperCase()).get)

assert.deepEqual(allNamesUppercase, [
  'JOHN WALLACE',
  'MARY SANCHEZ',
  'MICHAEL COLLINS',
])

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
