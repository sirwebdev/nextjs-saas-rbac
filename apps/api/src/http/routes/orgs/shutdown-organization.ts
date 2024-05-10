import z from "zod";
import { FastifyInstance } from "fastify";
import { organizationSchema } from "@saas/auth";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { getUserPermissions } from "@/utils/get-user-permissions";

export function shutdownOrganization(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).delete('/organizations/:slug', {
    schema: {
      tags: ['Organizations'],
      summary: 'Shutdown organization',
      params: z.object({
        slug: z.string()
      }),
      response: {
        204: z.null()
      }
    }
  },
    async (request, reply) => {
      const { slug } = request.params

      const userId = await request.getCurrentUserId()
      const { organization, membership } = await request.getUserMembership(slug)

      const authOrganization = organizationSchema.parse(organization)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('delete', authOrganization)) throw new UnauthorizedError(`You're not allowed to shutdown this organization.`)


      await prisma.organization.delete({
        where: {
          id: organization.id,
        },
      })

      return reply.status(204)
    }
  )
}
