import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { Database } from '../src/database'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'testmazzatech'

export async function authRoutes(app: FastifyInstance) {
  const database = Database.getInstance();

  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string()
    })

    const { email, password } = loginSchema.parse(request.body)
    const user = await database.findByEmail('users', email)
    if (!user || user.password !== password) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }
    const userInfo = [
      user.name,
      user.email,
      user.type 
    ]
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type
      },
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    return { token, userInfo }
  })
}