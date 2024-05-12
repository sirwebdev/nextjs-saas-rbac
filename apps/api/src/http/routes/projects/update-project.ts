import z from "zod";
import { FastifyInstance } from "fastify";
import { projectSchema } from "@saas/auth";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";

import { BadRequestError } from "../_errors/bad-request-error";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export function updateProject(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).put('/organizations/:slug/projects/:projectId', {
    schema: {
      tags: ['Projects'],
      summary: 'Update a project',
      security: [{ bearerAuth: [] }],
      body: z.object({
        name: z.string(),
        description: z.string()
      }),
      params: z.object({
        slug: z.string(),
        projectId: z.string()
      }),
      response: {
        204: z.null()
      }
    }
  },
    async (request, reply) => {
      const { slug, projectId } = request.params

      const userId = await request.getCurrentUserId()
      const { organization, membership } = await request.getUserMembership(slug)

      const project = await prisma.projects.findUnique({
        where: {
          id: projectId,
          organizationId: organization.id
        }
      })

      if (!project) throw new BadRequestError('Project not found.')

      const { cannot } = getUserPermissions(userId, membership.role)
      const authProject = projectSchema.parse(project)

      if (cannot('update', authProject)) throw new UnauthorizedError(`You're not allowed to update this project.`)

      const { name, description } = request.body

      await prisma.projects.update({
        where: {
          id: project.id,
        },
        data: {
          name,
          description
        }
      })

      return reply.status(204).send()
    }
  )
}
