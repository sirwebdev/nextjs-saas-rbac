import z from "zod";
import { FastifyInstance } from "fastify";
import { projectSchema } from "@saas/auth";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";

import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

export function deleteProject(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).delete('/organizations/:slug/projects/:projectId', {
    schema: {
      tags: ['Projects'],
      summary: 'Delete a project',
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

      if (cannot('delete', authProject)) throw new UnauthorizedError(`You're not allowed to delete this project.`)

      await prisma.projects.delete({
        where: {
          id: project.id
        }
      })

      return reply.status(204).send()
    }
  )
}
