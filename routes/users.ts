import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import  { randomUUID } from 'node:crypto'
import { authenticate } from '../middlewares/auth'
import { Database } from '../src/database';


interface User {
id: string
name: string
email: string
type: string
password: string
}


export async function usersRoutes(app: FastifyInstance) {
  const database = Database.getInstance();

app.addHook('preHandler', authenticate)

app.post('/users', async (request, reply) => {
const createUserSchema = z.object({
name: z.string(),
type: z.enum(['user', 'admin']),
email: z.string().email(),
password: z.string().min(4),
})

const { name, email, type, password } = createUserSchema.parse(request.body)

const existingUser = await database.findByEmail('users', email)
if (existingUser) {
return reply.status(400).send({ message: 'Email already exists' })
}

const user: User = {
id: randomUUID(),
name,
email,
type,
password,
}

await database.create('users', user)

return reply.status(201).send(user)
})

app.get('/users', async (request, reply) => {
const users = await database.list('users')
return reply.send(users)
})

app.get('/users/:id', async (request, reply) => {
const getUserParamsSchema = z.object({
id: z.string(),
})

const { id } = getUserParamsSchema.parse(request.params)
const user = await database.list('users', id)

if (!user) {
return reply.status(404).send({ message: 'User not found' })
}

return reply.send(user)
})

app.put('/users/:id', async (request, reply) => {
const updateUserParamsSchema = z.object({
id: z.string(),
})

const updateUserBodySchema = z.object({
name: z.string().optional(),
email: z.string().email().optional(),
type: z.string().optional(),
password: z.string().optional(),
})

const { id } = updateUserParamsSchema.parse(request.params)
const { name, email, password, type } = updateUserBodySchema.parse(request.body)

let user = await database.list('users', id)

if (!user) {
return reply.status(404).send({ message: 'User not found' })
}

if (email && email !== user.email) {
const users = await database.list('users')
const emailExists = users.some(u => u.email === email && u.id !== id)

if (emailExists) {
return reply.status(400).send({ message: 'Email already registered' })
}
}

user = {
...user,
name: name || user.name,
email: email || user.email,
password: password || user.password,
type: type || user.type
}
await database.update('users', id, user)

return reply.send(user)
})

app.delete('/users/:id', async (request, reply) => {
const deleteUserParamsSchema = z.object({
id: z.string().uuid(),
})

const { id } = deleteUserParamsSchema.parse(request.params)
const user = await database.list('users', id)

if (!user) {
return reply.status(404).send({ message: 'User not found' })
}

await database.delete('users', id)
return reply.status(204).send()
})
}