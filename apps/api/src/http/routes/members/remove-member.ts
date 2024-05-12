import z from "zod";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";

import { BadRequestError } from "../_errors/bad-request-error";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export function removeMember(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).delete('/organizations/:slug/members/:memberId', {
    schema: {
      tags: ['Members'],
      summary: 'Remove a member from organization',
      security: [{ bearerAuth: [] }],
      params: z.object({
        slug: z.string(),
        memberId: z.string()
      }),
      response: {
        204: z.null()
      }
    }
  },
    async (request, reply) => {
      const { slug, memberId } = request.params

      const userId = await request.getCurrentUserId()
      const { organization, membership } = await request.getUserMembership(slug)

      const member = await prisma.member.findUnique({
        where: {
          id: memberId,
          organizationId: organization.id
        }
      })

      if (!member) throw new BadRequestError('Member not found.')

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('delete', 'User')) throw new UnauthorizedError(`You're not allowed to remove this member.`)


      await prisma.member.delete({
        where: {
          id: member.id,
          organizationId: organization.id
        },
      })

      return reply.status(204).send()
    }
  )
}
