import 'fastify'

import { Member, Organization } from '@prisma/client'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(slug: string): Promise<{
      membership: Member;
      organization: Organization;
    }>
  }
}
