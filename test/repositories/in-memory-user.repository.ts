import { User } from '@/modules/users/entities/user.entity';
import { UserRepositoryInterface } from '@/modules/users/repositories/user.respository.interface';

export class InMemoryUsersRepository implements UserRepositoryInterface {
  public users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((item) => item.email === email);
    if (!user) {
      return Promise.resolve(null);
    }
    return Promise.resolve(user);
  }

  async create(user: User): Promise<void> {
    await Promise.resolve(this.users.push(user));
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((item) => item.id.toString() === id);
    if (!user) {
      return Promise.resolve(null);
    }
    return Promise.resolve(user);
  }

  async update(user: User): Promise<void> {
    const userIndex = this.users.findIndex((item) => item.id === user.id);
    this.users[userIndex] = user;
    await Promise.resolve();
  }

  delete(id: string): Promise<void> {
    const userIndex = this.users.findIndex((item) => item.id.toString() === id);
    this.users.splice(userIndex, 1);
    return Promise.resolve();
  }

  async findAll(): Promise<User[]> {
    return Promise.resolve(this.users);
  }
}
