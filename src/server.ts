import fastify from 'fastify'
import { usersRoutes } from '../routes/users'
import { authRoutes } from '../routes/auth'
import fastifyCors from '@fastify/cors'

const app = fastify()

app.register(fastifyCors, {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
});

app.register(authRoutes)
app.register(usersRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('http server running')
  })
