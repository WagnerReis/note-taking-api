import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { User } from '@/modules/users/entities/user.entity';

export function makeUser(override: Partial<User> = {}, id?: UniqueEntityId) {
  const user = User.create(
    {
      name: 'John Doe',
      email: 'john.doe@email.com',
      password: '123456-hashed',
      ...override,
    },
    id,
  );

  return user;
}
