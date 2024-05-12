import z from "zod";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export function getProjects(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).get('/organizations/:slug/projects', {
    schema: {
      tags: ['Projects'],
      summary: 'Get all organization projects',
      security: [{ bearerAuth: [] }],
      params: z.object({
        slug: z.string(),
      }),
      response: {
        200: z.object({
          projects: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string(),
            slug: z.string(),
            ownerId: z.string().uuid(),
            avatarUrl: z.string().nullable(),
            organizationId: z.string().uuid(),
            owner: z.object({
              id: z.string().uuid(),
              name: z.string().nullable(),
              avatarUrl: z.string().nullable(),
            }),
            createdAt: z.date()
          }))
        })
      }
    }
  },
    async (request, reply) => {
      const { slug } = request.params

      const userId = await request.getCurrentUserId()
      const { organization, membership } = await request.getUserMembership(slug)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('get', 'Project')) throw new UnauthorizedError(`You're not allowed to see organization projects.`)

      const projects = await prisma.projects.findMany({
        where: {
          organizationId: organization.id
        },
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          ownerId: true,
          avatarUrl: true,
          organizationId: true,
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          },
          createdAt: true
        }
      })

      return reply.send({
        projects
      })
    }
  )
}
