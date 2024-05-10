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
    servers: []
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

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log('HTTP server running')
})
