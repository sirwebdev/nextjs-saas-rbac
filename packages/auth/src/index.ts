import { createMongoAbility, CreateAbility, MongoAbility, AbilityBuilder } from '@casl/ability';

import { User } from './models/user';
import { permissions } from './permissions';
import { UserSubject } from './subjects/user';
import { ProjectSubject } from './subjects/project';

export type AppAbilities = UserSubject | ProjectSubject | ['manage', 'all']

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

const builder = new AbilityBuilder(createAppAbility)

export function defineAbilityFor(user: User) {
  if (typeof permissions[user.role] !== 'function') throw new Error(`Permissios for role ${user.role} not found.`)

  permissions[user.role](user, builder)

  const ability = builder.build()

  return ability
}
