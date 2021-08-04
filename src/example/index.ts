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
  .hobbies.ins(0, { name: 'Fishing' })
  .hobbies.cat({ name: 'Boating' })
  .hobbies.ins(1, [{ name: 'Swimming' }, { name: 'Rowing' }])
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
  .company.name.put('Apple')
  .company.address.city.put('Cupertino')
  .get()

assert.deepEqual(localizedEmployedJohn, {
  name: 'John Wallace',
  company: { name: 'Apple', address: { city: 'Cupertino' } },
})

const localizedEmployedMary = lens(mary)
  .company.name.put('Microsoft')
  .company.address.put({
    city: 'Redmond',
    street: { name: '15010 NE 36th St' },
    zip: 98052,
  })
  .get()

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

const nameSplitterIso = lens<Person>().name.iso(
  (name: string): { first: string; last: string } => ({
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
