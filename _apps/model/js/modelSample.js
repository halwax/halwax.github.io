const tsDefaultModel = 
`function Entity() { 
  return (constructorFunction: Function) => {}
}
function Id() {
    return (target: any, propertyKey: string | symbol) => {}
}

namespace scribdev {
  export const package = 'io.github.scribdev'
}

namespace scribdev.person {

  import Address = scribdev.core.Address
  import Gender = scribdev.core.Gender
  import Animal = scribdev.misc.Animal

  @Entity()
  class Person {
    @Id()
    id: Number
    firstName: String
    lastName: String
    pets: Animal[]
    address: Address
    partner: Person
    children: Person[]
    gender: Gender
  }

}

namespace scribdev.core {

  export class Address {
    street: String
    number: Number
    city: City
  }

  class City {
    name: String
    code: Number
    country: Country
  }

  class Country {
    name: String
    code: String
  }

  export enum Gender {
    MALE,
    FEMALE,
  }

}

namespace scribdev.misc {
  class VeryLongClassName {}

  export class Animal {
    name: String
  }

  class Dog extends Animal {
  }
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