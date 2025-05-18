import { User } from '../entities/user.entity';
import { User as UserModel } from '../models/user.model';

export class MongoCreateUserMapper {
  static toDomain(raw: UserModel): User {
    return User.create(raw);
  }

  static toPersistence(entity: User): UserModel {
    return {
      name: entity.name,
      email: entity.email,
      password: entity.password,
      createdAt: entity.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
  }
}
