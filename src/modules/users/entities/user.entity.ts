import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

interface UserProps {
  name: string;
  email: string;
  password: string;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  static create(props: UserProps, id?: UniqueEntityId) {
    const user = new User(
      {
        ...props,
      },
      id,
    );

    return user;
  }
}
