import { z } from "zod"
import { createMongoAbility, CreateAbility, MongoAbility, AbilityBuilder } from '@casl/ability';

import { User } from './models/user';
import { permissions } from './permissions';
import { userSubject } from './subjects/user';
import { projectSubject } from './subjects/project';
import { organizationSubject } from "./subjects/organization";
import { inviteSubject } from "./subjects/invite";
import { billingSubject } from "./subjects/billing";


export * from "./models"

const appAbilitiesSchema = z.union([
  projectSubject,
  userSubject,
  organizationSubject,
  inviteSubject,
  billingSubject,
  z.tuple([
    z.literal('manage'),
    z.literal('all'),
  ])
])

export type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

const builder = new AbilityBuilder(createAppAbility)

export function defineAbilityFor(user: User) {
  if (typeof permissions[user.role] !== 'function') throw new Error(`Permissios for role ${user.role} not found.`)

  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    }
  })

  return ability
}
