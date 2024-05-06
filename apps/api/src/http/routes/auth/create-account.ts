import { z } from "zod"
import { hash } from "bcryptjs"
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "@/lib/prisma";

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/users', {
    schema: {
      summary: 'Create a new account',
      tags: ['auth'],
      body: z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6)
      })
    }
  }, async (request, reply) => {
    const { name, email, password } = request.body

    const userWithSameEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (userWithSameEmail) {
      return reply.status(400).send({
        message: "user with same email already exists."
      })
    }

    const [, domain] = email.split("@")

    const autoJoinOrganization = await prisma.organization.findFirst({
      where: {
        domain,
        shouldAttachUsersByDomain: true
      }
    })

    const passwordHash = await hash(password, 6)

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        memberOn: autoJoinOrganization ? {
          create: {
            organizationId: autoJoinOrganization.id,
          }
        } : undefined
      }
    })

    return reply.status(201).send()
  })
}
