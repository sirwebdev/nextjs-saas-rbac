import { fastify } from "fastify"
import fastifyCors from "@fastify/cors"
import { ZodTypeProvider, validatorCompiler, serializerCompiler } from "fastify-type-provider-zod"
import { createAccount } from "./routes/auth/create-account"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors)

app.register(createAccount)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running')
})
