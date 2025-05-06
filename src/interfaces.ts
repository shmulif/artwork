
  export interface AnimalEvent {
    name: string;
    date: string | Date;
    url: string;
}
export interface User {
  id: string
  hash: string
  name: string
  animals: NameAndID[]
}

export interface Artwork {
  id: string
  name: string
  image: string
  description: string[]
  createdByUser: string
}

export interface JsonObject { 
  [key: string]: any 
}

export interface NameAndID {
  name: string;
  id: string;
}