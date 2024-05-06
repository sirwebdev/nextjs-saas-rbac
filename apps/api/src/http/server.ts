import { fastify } from "fastify"
import fastifyJwt from "@fastify/jwt"
import fastifyCors from "@fastify/cors"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUI from "@fastify/swagger-ui"
import { ZodTypeProvider, validatorCompiler, serializerCompiler, jsonSchemaTransform } from "fastify-type-provider-zod"

import { createAccount } from "./routes/auth/create-account"
import { authenticateWithpassword } from "./routes/auth/authenticate-with-password"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

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
  secret: 'my-jwt-secret'
})

app.register(fastifyCors)

app.register(createAccount)
app.register(authenticateWithpassword)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running')
})
