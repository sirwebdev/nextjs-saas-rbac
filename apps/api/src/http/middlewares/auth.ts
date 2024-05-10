import type { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";

import { UnauthorizedError } from "../routes/_errors/unauthorized-error";
import { prisma } from "@/lib/prisma";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {

        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch (error) {
        throw new UnauthorizedError('Invalid auth token')
      }
    }

    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId()

      const member = await prisma.member.findFirst({
        where: {
          userId,
          organization: {
            slug
          }
        },
        include: {
          organization: true
        }
      })

      if (!member) throw new UnauthorizedError(`You are not a member og this organization.`)

      const { organization, ...membership } = member

      return {
        organization,
        membership
      }
    }
  })
})
