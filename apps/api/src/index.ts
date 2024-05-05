import { ability } from "@saas/auth"

const useCanInviteSomeoneElse = ability.can('invite', 'User')
const useCanDeleteOtherUsers = ability.can('delete', 'User')

const userCannotDeleteOtherUsers = ability.cannot('delete', 'User')

console.log(useCanInviteSomeoneElse)
console.log(useCanDeleteOtherUsers)

console.log(userCannotDeleteOtherUsers)
