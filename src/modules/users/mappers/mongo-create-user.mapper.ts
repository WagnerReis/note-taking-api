import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { User } from '../entities/user.entity';
import { User as UserModel } from '../models/user.model';

export class MongoCreateUserMapper {
  static toDomain(raw: UserModel): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw._id),
    );
  }
  static toPersistence(entity: User): UserModel {
    return {
      _id: entity.id.toString(),
      name: entity.name,
      email: entity.email,
      password: entity.password,
      googleId: entity.googleId,
      provider: entity.provider,
      createdAt: entity.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
  }
}
