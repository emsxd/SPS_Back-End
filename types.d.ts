
import { FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      name: string;
      email: string;
      type: string;
    }
  }
}