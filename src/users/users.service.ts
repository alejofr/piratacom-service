import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export type User = {
  id: string;
  username: string;
  passwordHash: string; // stored hashed password for demo
};

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor() {
    // Seed one user: username: demo, password: demo
    const hash = bcrypt.hashSync('demo', 8);
    this.users.push({ id: '1', username: 'demo', passwordHash: hash });
  }

  async findByUsername(username: string) {
    return this.users.find((u) => u.username === username) || null;
  }

  async findById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }
}
