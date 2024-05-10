import z from "zod";
import { FastifyInstance } from "fastify";
import { organizationSchema } from "@saas/auth";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { BadRequestError } from "../_errors/bad-request-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { getUserPermissions } from "@/utils/get-user-permissions";

export function updateOrganization(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).post('/organizations/:slug', {
    schema: {
      tags: ['Organizations'],
      summary: 'Update organization details',
      body: z.object({
        name: z.string(),
        domain: z.string().nullish(),
        shouldAttachUsersByDomain: z.boolean().optional()
      }),
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
      const { name, domain, shouldAttachUsersByDomain } = request.body

      const { organization, membership } = await request.getUserMembership(slug)

      const authOrganization = organizationSchema.parse(organization)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('update', authOrganization)) throw new UnauthorizedError(`You're not allowed to update this organization.`)



      if (domain) {
        const organizationByDomain = await prisma.organization.findFirst({
          where: {
            domain,
            id: {
              not: organization.id
            }
          }
        })

        if (organizationByDomain) throw new BadRequestError('Another organization with same domain already exists.')

        await prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            name,
            domain,
            shouldAttachUsersByDomain
          }
        })

        return reply.status(204).send()
      }
    }
  )
}
