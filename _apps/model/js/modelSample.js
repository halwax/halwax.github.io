const tsDefaultModel = 
`class VeryLongClassName {}

class Person {
  firstName: string
  lastName: string
  pets: Animal[]
  address: Address
  partner: Person
  children: Person[]
  gender: Gender
}

class Animal {
  name: string
}

class Dog extends Animal {
}

class Address {
  street: string
  number: number
  city: City
}

class City {
  name: string
  code: number
  country: Country
}

class Country {
  name: string
  code: string
}

enum Gender {
  MALE,
  FEMALE,
}`;

/*
var model = {
  path: 'model',
  name: 'model',
  qualifiedName: 'model',
  mClasses: [
    {
      path: 'model.domain.person.Person',
      name: 'Person',
      mAttributes: [
        {
          name: 'firstName',
          typeName: 'String'
        },
        {
          name: 'lastName',
          typeName: 'String'
        }
      ],
      sql: 'CREATE TABLE PERSON'
    },
    {
      path: 'model.domain.person.Address',
      name: 'Address',
      mAttributes: [
        {
          name: 'street',
          typeName: 'String'
        }
      ]
    },
    {
      path: 'model.domain.person.Partner',
      name: 'Partner',
      mAttributes: [
        {
          name: 'type',
          typeName: 'String'
        }
      ]
    },
  ],
  mReferences: [
    {
      source: 'model.domain.person.Person',
      target: 'model.domain.person.Address',
      sourceLabel: 'person',
      targetLabel: 'addresses : 0..*'
    },
    {
      source: 'model.domain.person.Person',
      target: 'model.domain.person.Partner',
      sourceLabel: 'person',
      targetLabel: 'partner : 0..1'
    },
  ],
  mGeneralizations: [
    {
      source: 'model.domain.person.Partner',
      target: 'model.domain.person.Person'
    }
  ]
};
*/