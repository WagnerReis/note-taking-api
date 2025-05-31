import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { User } from '../entities/user.entity';
import { UserDocument, User as UserModel } from '../models/user.model';

export class MongoCreateUserMapper {
  static toDomain(raw: UserDocument): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        refreshToken: raw.refreshToken,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }
  static toPersistence(entity: User): UserModel {
    return {
      name: entity.name,
      email: entity.email,
      password: entity.password,
      refreshToken: entity.refreshToken,
      googleId: entity.googleId,
      provider: entity.provider,
      createdAt: entity.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
  }
}
