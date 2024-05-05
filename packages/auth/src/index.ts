import { createMongoAbility, ForcedSubject, CreateAbility, MongoAbility, AbilityBuilder } from '@casl/ability';
import { User } from './models/user';
import { permissions } from './permissions';

const actions = ['manage', 'invite', 'delete'] as const;
const subjects = ['User', 'all'] as const;

export type AppAbilities = [
  typeof actions[number],
  typeof subjects[number] | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
];

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

const builder = new AbilityBuilder(createAppAbility)

export function defineAbilityFor(user: User) {
  if (typeof permissions[user.role] !== 'function') throw new Error(`Permissios for role ${user.role} not found.`)

  permissions[user.role](user, builder)

  const ability = builder.build()

  return ability
}
