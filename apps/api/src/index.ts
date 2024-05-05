import { defineAbilityFor } from "@saas/auth"

const ability = defineAbilityFor({ role: 'MEMBER' })

const useCanInviteSomeoneElse = ability.can('invite', 'User')
const useCanDeleteOtherUsers = ability.can('delete', 'User')

const userCannotDeleteOtherUsers = ability.cannot('delete', 'User')

console.log(useCanInviteSomeoneElse)
console.log(useCanDeleteOtherUsers)

console.log(userCannotDeleteOtherUsers)
