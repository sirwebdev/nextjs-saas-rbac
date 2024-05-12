import z from "zod";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";

import { BadRequestError } from "../_errors/bad-request-error";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { roleSchema } from "@saas/auth";

export function updateMember(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).put('/organizations/:slug/members/:memberId', {
    schema: {
      tags: ['Members'],
      summary: 'Update a member',
      security: [{ bearerAuth: [] }],
      body: z.object({
        role: roleSchema
      }),
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

      if (cannot('update', 'User')) throw new UnauthorizedError(`You're not allowed to update this member.`)

      const { role } = request.body

      await prisma.member.update({
        where: {
          id: member.id,
          organizationId: organization.id
        },
        data: {
          role
        }
      })

      return reply.status(204).send()
    }
  )
}
