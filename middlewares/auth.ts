import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'testmazzatech'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      reply.code(401).send({ error: 'Authentication required' })
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })

    if (typeof decoded === 'string') {
      throw new Error('Invalid token format')
    }

    request.user = decoded as {
      id: string;
      name: string;
      email: string;
      type: string;
    }

  } catch (err) {
    console.error('Token verification error:', err)
    if (err instanceof jwt.JsonWebTokenError) {
      reply.code(401).send({ error: 'Invalid token' })
    } else {
      reply.code(500).send({ error: 'Internal server error' })
    }
  }
}