import crypto from 'node:crypto';

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  password: string;
}

interface DatabaseSchema {
  users: User[];
}

export class Database {
  private static instance: Database;
  #database: DatabaseSchema = { users: [] };

  private constructor() {
    this.#database.users = [
      {
        id: '1',
        name: 'admin',
        email: 'admin@spsgroup.com.br',
        type: 'admin',
        password: '1234',
      }
    ];
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async create(table: keyof DatabaseSchema, data: Partial<User>): Promise<User> {
    const id = crypto.randomUUID();
    const normalizedEmail = data.email?.trim().toLowerCase() || '';
    const newData = { 
      id, 
      ...data, 
      email: normalizedEmail 
    } as User;
    this.#database[table].push(newData);
    return newData;
  }

  async list(table: keyof DatabaseSchema, id?: string): Promise<User[]> {
    let data = this.#database[table] ?? [];
    if (id) {
      data = data.filter((row) => row.id === id);
    }
    
    return data;
  }

  async findByEmail(table: keyof DatabaseSchema, email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const data = this.#database[table] ?? [];
    return data.find((row) => row.email === normalizedEmail) ?? null;
  }

  async delete(table: keyof DatabaseSchema, id: string): Promise<void> {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
    }
  }

  async update(table: keyof DatabaseSchema, id: string, data: Partial<User>): Promise<User | null> {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);
  
    if (rowIndex > -1) {
      const existingUser = this.#database[table][rowIndex];
      const updatedData = { ...existingUser, ...data, id };
      this.#database[table][rowIndex] = updatedData;
      return updatedData;
    }
    return null;
  }
}
