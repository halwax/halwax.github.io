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