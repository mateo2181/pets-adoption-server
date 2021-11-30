import { shield, and, allow } from 'graphql-shield'
import * as rules from './rules'

export const permissions = shield({
  Query: {
    pets: rules.isAuthenticated,
    pet: allow
  },
  Mutation: {
    createPet: allow
  }
})