
import z from "zod";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "@/lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { auth } from "@/http/middlewares/auth";

export function rejectInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).post('/invites/:inviteId/reject', {
    schema: {
      tags: ['Invites'],
      summary: 'Reject an invite',
      params: z.object({
        inviteId: z.string()
      }),
      response: {
        204: z.null()
      }
    }
  },
    async (request, reply) => {
      const userId = request.getCurrentUserId()
      const { inviteId } = request.params

      const invite = await prisma.invite.findUnique({
        where: {
          id: inviteId,

        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }

          },
          organization: {
            select: {
              name: true
            }
          }
        }
      })

      if (!invite) throw new BadRequestError('Invite not found or expired.')


      const user = await prisma.user.findUnique({
        where: {
          id: userId
        }
      })

      if (!user) throw new BadRequestError('User not found.')


      if (invite.email !== user.email) throw new BadRequestError('This invite belongs to another user.')



      await prisma.invide.delete({
        where: {
          id: invite.id
        }
      })



      return reply.status(204).send()
    }
  )
}
