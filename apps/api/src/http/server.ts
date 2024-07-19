import { fastify } from "fastify"
import fastifyJwt from "@fastify/jwt"
import fastifyCors from "@fastify/cors"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUI from "@fastify/swagger-ui"
import { ZodTypeProvider, validatorCompiler, serializerCompiler, jsonSchemaTransform } from "fastify-type-provider-zod"

import { errorHandler } from "./error-handler"
import { getProfile } from "./routes/auth/get-profile"
import { createAccount } from "./routes/auth/create-account"
import { authenticateWithpassword } from "./routes/auth/authenticate-with-password"
import { requestPasswordRecover } from "./routes/auth/request-password.recover"
import { resetPassword } from "./routes/auth/reset-password"
import { authenticateWithGithub } from "./routes/auth/authenticate-with-github"
import { env } from "@saas/env"
import { createOrganization } from "./routes/orgs/create-organization"
import { getOrganization } from "./routes/orgs/get-organization"
import { getOrganizations } from "./routes/orgs/get-organizations"
import { updateOrganization } from "./routes/orgs/update-organization"
import { shutdownOrganization } from "./routes/orgs/shutdown-organization"
import { transferOrganization } from "./routes/orgs/transfer-organization"
import { createProject } from "./routes/projects/create-project"
import { deleteProject } from "./routes/projects/delete-project"
import { getProject } from "./routes/projects/get-project"
import { getProjects } from "./routes/projects/get-projects"
import { updateProject } from "./routes/projects/update-project"
import { getMembers } from "./routes/members/get-members"
import { updateMember } from "./routes/members/update-member"
import { removeMember } from "./routes/members/remove-member"
import { createInvite } from "./routes/invites/create-invite"
import { getInvite } from "./routes/invites/get-invite"
import { getInvites } from "./routes/invites/get-invites"
import { acceptInvite } from "./routes/invites/accept-invite"
import { rejectInvite } from "./routes/invites/reject-invite"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next.js Saas',
      description: "Full-stack Saas app with multi-tenant & RBAC.",
      version: "1.0.0"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  transform: jsonSchemaTransform
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs'
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET
})

app.register(fastifyCors)

app.register(createAccount)
app.register(authenticateWithpassword)
app.register(getProfile)
app.register(requestPasswordRecover)
app.register(resetPassword)
app.register(authenticateWithGithub)

app.register(createOrganization)
app.register(getOrganization)
app.register(getOrganizations)
app.register(updateOrganization)
app.register(shutdownOrganization)
app.register(transferOrganization)

app.register(getProject)
app.register(getProjects)
app.register(createProject)
app.register(deleteProject)
app.register(updateProject)

app.register(getMembers)
app.register(updateMember)
app.register(removeMember)

app.register(getInvite)
app.register(getInvites)
app.register(createInvite)
app.register(acceptInvite)
app.register(rejectInvite)

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log('HTTP server running')
})
