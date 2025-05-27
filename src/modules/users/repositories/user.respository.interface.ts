import { BaseRepository } from '@/core/repositories/base.repository';
import { User } from '../entities/user.entity';

export abstract class UserRepositoryInterface extends BaseRepository<User> {
  abstract findByEmail(email: string): Promise<User | null>;
}
