import { BaseRepository } from '@/core/repositories/base.repository';
import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export abstract class UserRepositoryInterface extends BaseRepository<User> {
  abstract findByEmail(email: string): Promise<User | null>;
}
